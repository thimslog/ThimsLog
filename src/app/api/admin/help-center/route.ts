import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

export const dynamic = "force-dynamic";

const DEFAULT_LINKS = [
  {
    id: "default-1",
    title: "Tutorials Channel",
    description: "Video guides & how-to walkthroughs",
    url: "https://whatsapp.com/channel/0029VavVvCj0lwgsgV729G2Y",
    section: "TUTORIALS_CHANNEL",
    iconType: "whatsapp",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "WhatsApp Channel",
    description: "News, drops & updates",
    url: "https://whatsapp.com/channel/0029VavVvCj0lwgsgV729G2Y",
    section: "WHATSAPP_CHANNEL",
    iconType: "whatsapp",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "Community Group 1",
    description: "Join our WhatsApp group",
    url: "https://chat.whatsapp.com/invite/thimslog1",
    section: "COMMUNITY_SUPPORT",
    iconType: "community",
    order: 3,
    isActive: true,
  },
  {
    id: "default-4",
    title: "Community Group 2",
    description: "Join our WhatsApp group",
    url: "https://chat.whatsapp.com/invite/thimslog2",
    section: "COMMUNITY_SUPPORT",
    iconType: "community",
    order: 4,
    isActive: true,
  },
];

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let links: any[] = [];
    try {
      if ((prisma as any).helpCenterLink) {
        links = await (prisma as any).helpCenterLink.findMany({
          orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "desc" }],
        });

        // If DB is empty, auto-seed the default links into DB so they have real records
        if (links.length === 0) {
          for (const def of DEFAULT_LINKS) {
            await (prisma as any).helpCenterLink.create({
              data: {
                title: def.title,
                description: def.description,
                url: def.url,
                section: def.section,
                iconType: def.iconType,
                order: def.order,
                isActive: def.isActive,
              },
            });
          }
          links = await (prisma as any).helpCenterLink.findMany({
            orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "desc" }],
          });
        }
      }
    } catch (dbErr) {
      console.warn("HelpCenterLink table not yet pushed or query error:", dbErr);
    }

    // Fallback if DB table is inaccessible
    if (!links || links.length === 0) {
      links = DEFAULT_LINKS;
    }

    return NextResponse.json({
      success: true,
      data: links,
    });
  } catch (error: any) {
    console.error("Admin fetch help center error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, url, section, iconType, order, isActive } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and URL are required" },
        { status: 400 }
      );
    }

    let createdLink = null;
    try {
      if ((prisma as any).helpCenterLink) {
        createdLink = await (prisma as any).helpCenterLink.create({
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            url: url.trim(),
            section: section?.trim() || "WHATSAPP_CHANNEL",
            iconType: iconType?.trim() || "whatsapp",
            order: Number(order) || 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
          },
        });
      }
    } catch (dbErr: any) {
      console.error("Failed to create in DB:", dbErr);
      return NextResponse.json(
        {
          success: false,
          message: "Database schema might need push: " + (dbErr?.message || ""),
        },
        { status: 500 }
      );
    }

    // Record Audit Log
    if (createdLink) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "HELP_LINK_CREATED",
          entityId: createdLink.id,
          entityType: "HELP_CENTER",
          entityLabel: createdLink.title,
          description: `Admin ${admin.email} created help resource link "${createdLink.title}" (${createdLink.section}) at ${nigeriaTime()}`,
          metadata: {
            title: createdLink.title,
            url: createdLink.url,
            section: createdLink.section,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Help Center link created successfully",
      data: createdLink,
    });
  } catch (error: any) {
    console.error("Admin create help center link error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create link" },
      { status: 500 }
    );
  }
}
