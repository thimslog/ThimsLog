import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const HISTORY_FILE_PATH = path.join(process.cwd(), ".username_history.json");

interface UsernameHistoryEntry {
  userId: string;
  changedAt: string; // ISO string
}

// In-memory cache for fast lookups
const inMemoryCache = new Map<string, Date>();

function readHistoryFromFile(): Record<string, string> {
  try {
    if (fs.existsSync(HISTORY_FILE_PATH)) {
      const data = fs.readFileSync(HISTORY_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read username history file:", err);
  }
  return {};
}

function writeHistoryToFile(userId: string, date: Date) {
  try {
    const history = readHistoryFromFile();
    history[userId] = date.toISOString();
    fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(history, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write username history file:", err);
  }
}

/**
 * Retrieves the last username change date for a user from DB, file fallback, or memory.
 */
export async function getLastUsernameChangeDate(userId: string): Promise<Date | null> {
  if (!userId) return null;

  // 1. Check in-memory cache
  if (inMemoryCache.has(userId)) {
    return inMemoryCache.get(userId)!;
  }

  // 2. Try DB check
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { usernameChangedAt: true },
    });
    if (user?.usernameChangedAt) {
      const dbDate = new Date(user.usernameChangedAt);
      inMemoryCache.set(userId, dbDate);
      return dbDate;
    }
  } catch {
    // DB field may not be generated yet, proceed to fallback
  }

  // 3. Check persistent file fallback
  const fileHistory = readHistoryFromFile();
  if (fileHistory[userId]) {
    const fileDate = new Date(fileHistory[userId]);
    inMemoryCache.set(userId, fileDate);
    return fileDate;
  }

  return null;
}

/**
 * Calculates 3-month (90 days) cooldown information.
 */
export async function getUsernameCooldownInfo(userId: string) {
  const lastChanged = await getLastUsernameChangeDate(userId);
  const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
  const now = new Date();

  if (!lastChanged) {
    return {
      canChangeUsername: true,
      lastChangedAt: null,
      daysRemaining: 0,
      nextAllowedDate: null,
    };
  }

  const nextAllowed = new Date(lastChanged.getTime() + threeMonthsMs);

  if (now < nextAllowed) {
    const msRemaining = nextAllowed.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    return {
      canChangeUsername: false,
      lastChangedAt: lastChanged,
      daysRemaining,
      nextAllowedDate: nextAllowed,
    };
  }

  return {
    canChangeUsername: true,
    lastChangedAt: lastChanged,
    daysRemaining: 0,
    nextAllowedDate: null,
  };
}

/**
 * Records a new username change date in DB, file store, and in-memory cache.
 */
export async function recordUsernameChange(userId: string, date: Date = new Date()) {
  if (!userId) return;

  // 1. Update in-memory cache
  inMemoryCache.set(userId, date);

  // 2. Update file fallback
  writeHistoryToFile(userId, date);

  // 3. Update DB if column exists
  try {
    await (prisma as any).user.update({
      where: { id: userId },
      data: { usernameChangedAt: date },
    });
  } catch (err) {
    console.warn("DB usernameChangedAt column update skipped:", err);
  }
}
