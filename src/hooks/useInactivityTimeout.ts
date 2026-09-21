"use client";

import { useEffect, useRef, useCallback } from "react";

export interface UseInactivityTimeoutOptions {
  isAuthenticated: boolean;
  onTimeout: () => void | Promise<void>;
  storageKey?: string;
  timeoutMs?: number; // default: 15 minutes (15 * 60 * 1000)
  checkIntervalMs?: number; // default: 5000 (5 seconds)
}

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_CHECK_INTERVAL_MS = 5000; // 5 seconds
const THROTTLE_MS = 2000; // Update activity at most once every 2 seconds

export function useInactivityTimeout({
  isAuthenticated,
  onTimeout,
  storageKey = "thimslog_last_activity",
  timeoutMs = DEFAULT_TIMEOUT_MS,
  checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
}: UseInactivityTimeoutOptions) {
  const onTimeoutRef = useRef(onTimeout);
  const lastRecordedTimeRef = useRef<number>(Date.now());
  const isTimedOutRef = useRef<boolean>(false);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const updateActivity = useCallback(() => {
    if (!isAuthenticated || isTimedOutRef.current) return;
    const now = Date.now();
    if (now - lastRecordedTimeRef.current >= THROTTLE_MS) {
      lastRecordedTimeRef.current = now;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(storageKey, now.toString());
        }
      } catch {
        // Handle storage quota or private mode errors safely
      }
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") {
      isTimedOutRef.current = false;
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      return;
    }

    isTimedOutRef.current = false;

    // Check existing stored timestamp or initialize
    try {
      const stored = localStorage.getItem(storageKey);
      const storedTime = stored ? Number(stored) : null;
      const now = Date.now();

      if (storedTime && !isNaN(storedTime)) {
        if (now - storedTime >= timeoutMs) {
          isTimedOutRef.current = true;
          try {
            localStorage.removeItem(storageKey);
          } catch {}
          onTimeoutRef.current();
          return;
        }
        lastRecordedTimeRef.current = storedTime;
      } else {
        localStorage.setItem(storageKey, now.toString());
        lastRecordedTimeRef.current = now;
      }
    } catch {}

    const checkInactivity = () => {
      if (isTimedOutRef.current) return;

      try {
        const stored = localStorage.getItem(storageKey);
        const lastActivity = stored ? Number(stored) : lastRecordedTimeRef.current;
        const now = Date.now();

        if (now - lastActivity >= timeoutMs) {
          isTimedOutRef.current = true;
          try {
            localStorage.removeItem(storageKey);
          } catch {}
          onTimeoutRef.current();
        }
      } catch {}
    };

    // User interactions to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];

    const handleUserActivity = () => {
      updateActivity();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check inactivity immediately upon tab focus / device wakeup
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
        updateActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleFocus = () => {
      checkInactivity();
      updateActivity();
    };
    window.addEventListener("focus", handleFocus);

    // Sync across tabs via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        if (e.newValue) {
          const remoteTime = Number(e.newValue);
          if (!isNaN(remoteTime)) {
            lastRecordedTimeRef.current = remoteTime;
          }
        } else if (e.newValue === null && !isTimedOutRef.current) {
          // Logged out or cleared in another tab
          checkInactivity();
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    // Recurring interval check
    const intervalId = setInterval(checkInactivity, checkIntervalMs);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, storageKey, timeoutMs, checkIntervalMs, updateActivity]);
}
