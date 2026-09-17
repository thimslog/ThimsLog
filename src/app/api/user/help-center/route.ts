import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    let links: any[] = [];
    try {
      if ((prisma as any).helpCenterLink) {
        links = await (prisma as any).helpCenterLink.findMany({
          where: { isActive: true },
          orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "desc" }],
        });

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
            where: { isActive: true },
            orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "desc" }],
          });
        }
      }
    } catch (dbErr) {
      console.warn("HelpCenterLink query fallback:", dbErr);
    }

    if (!links || links.length === 0) {
      links = DEFAULT_LINKS;
    }

    return NextResponse.json({
      success: true,
      data: links,
    });
  } catch (error: any) {
    console.error("User fetch help center links error:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_LINKS,
    });
  }
}
