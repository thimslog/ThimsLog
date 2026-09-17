-- CreateTable
CREATE TABLE "HelpCenterLink" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'WHATSAPP_CHANNEL',
    "iconType" TEXT DEFAULT 'whatsapp',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpCenterLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpCenterLink_section_idx" ON "HelpCenterLink"("section");

-- CreateIndex
CREATE INDEX "HelpCenterLink_isActive_idx" ON "HelpCenterLink"("isActive");
