"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Video,
  Users,
  Copy,
  Check,
  X,
  LifeBuoy,
  RefreshCw,
  Globe,
} from "lucide-react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useAdminPage } from "@/context/admin-page-context";
import { StatusPill } from "@/components/admin/status-pill";
import { toast } from "@/components/ui/toast";

interface HelpCenterLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  section: string;
  iconType: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const SECTION_OPTIONS = [
  { value: "TUTORIALS_CHANNEL", label: "Tutorials Channel" },
  { value: "WHATSAPP_CHANNEL", label: "WhatsApp Channel" },
  { value: "COMMUNITY_SUPPORT", label: "Community & Support" },
  { value: "CUSTOM", label: "Custom Section..." },
];

const ICON_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "video", label: "Video / Tutorial" },
  { value: "community", label: "Community Users" },
  { value: "telegram", label: "Telegram" },
  { value: "link", label: "General Link" },
];

export default function AdminHelpCenterPage() {
  const { setPageTitle } = useAdminPage();

  const [links, setLinks] = useState<HelpCenterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<HelpCenterLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HelpCenterLink | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [sectionSelect, setSectionSelect] = useState("WHATSAPP_CHANNEL");
  const [customSection, setCustomSection] = useState("");
  const [iconType, setIconType] = useState("whatsapp");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setPageTitle({
      title: "Help Center",
      subtitle: "Manage public channels, tutorials, and community support links",
    });
  }, [setPageTitle]);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/help-center", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setLinks(data.data);
      }
    } catch (err) {
      console.error("Failed to load help center links:", err);
      toast.error("Failed to load help center links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const openCreateModal = () => {
    setEditingLink(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setSectionSelect("WHATSAPP_CHANNEL");
    setCustomSection("");
    setIconType("whatsapp");
    setOrder(links.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (link: HelpCenterLink) => {
    setEditingLink(link);
    setTitle(link.title);
    setDescription(link.description || "");
    setUrl(link.url);

    const isStandard = SECTION_OPTIONS.some(
      (opt) => opt.value === link.section && opt.value !== "CUSTOM"
    );
    if (isStandard) {
      setSectionSelect(link.section);
      setCustomSection("");
    } else {
      setSectionSelect("CUSTOM");
      setCustomSection(link.section);
    }

    setIconType(link.iconType || "whatsapp");
    setOrder(link.order || 0);
    setIsActive(link.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    const finalSection =
      sectionSelect === "CUSTOM"
        ? customSection.trim() || "COMMUNITY_SUPPORT"
        : sectionSelect;

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      url: url.trim(),
      section: finalSection,
      iconType,
      order: Number(order) || 0,
      isActive,
    };

    try {
      setSubmitting(true);
      if (editingLink) {
        const res = await fetch(`/api/admin/help-center/${editingLink.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update link");
        }
        toast.success("Link updated successfully!");
      } else {
        const res = await fetch("/api/admin/help-center", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to create link");
        }
        toast.success("Link created successfully!");
      }

      setModalOpen(false);
      await fetchLinks();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/help-center/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete link");
      }

      toast.success("Link removed successfully");
      setDeleteTarget(null);
      await fetchLinks();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "whatsapp":
        return <FaWhatsapp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "video":
        return <Video className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "community":
      case "users":
        return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "telegram":
        return <FaTelegramPlane className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const formatSectionBadge = (sec: string) => {
    switch (sec) {
      case "TUTORIALS_CHANNEL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            Tutorials Channel
          </span>
        );
      case "WHATSAPP_CHANNEL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
            WhatsApp Channel
          </span>
        );
      case "COMMUNITY_SUPPORT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20">
            Community &amp; Support
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
            {sec.replaceAll("_", " ")}
          </span>
        );
    }
  };

  const filteredLinks = links.filter((l) => {
    if (selectedSection === "ALL") return true;
    return l.section === selectedSection;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Section Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Sections" },
            { id: "TUTORIALS_CHANNEL", label: "Tutorials" },
            { id: "WHATSAPP_CHANNEL", label: "WhatsApp" },
            { id: "COMMUNITY_SUPPORT", label: "Community" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSection(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedSection === tab.id
                  ? "bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLinks}
            className="p-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Refresh links"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-sky-600" : ""} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Resource Link</span>
          </button>
        </div>
      </div>

      {/* Links Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Resource / Title</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Target Destination</th>
                <th className="px-5 py-3.5">Sort Order</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-sky-600" />
                      <span>Loading resources...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No links found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Resource / Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                          {renderIcon(item.iconType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-[11.5px] text-slate-400 truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Section */}
                    <td className="px-5 py-3.5">
                      {formatSectionBadge(item.section)}
                    </td>

                    {/* Target Destination URL */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                        <span className="truncate max-w-[180px]">{item.url}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.url, item.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded cursor-pointer"
                          title="Copy Link URL"
                        >
                          {copiedId === item.id ? (
                            <Check size={12} className="text-emerald-500" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 p-1"
                          title="Open Link"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>

                    {/* Sort Order */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-[11px]">
                        #{item.order}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusPill
                        label={item.isActive ? "Active" : "Hidden"}
                        tone={item.isActive ? "good" : "neutral"}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Resource"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLink ? "Edit Help Center Resource" : "New Help Center Resource"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Section Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Target Section
                </label>
                <select
                  value={sectionSelect}
                  onChange={(e) => setSectionSelect(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b101b] text-slate-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 cursor-pointer"
                >
                  {SECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {sectionSelect === "CUSTOM" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Custom Section Name
                  </label>
                  <input
                    type="text"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    placeholder="e.g. SPECIAL GUIDES"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                    required
                  />
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tutorials Channel or Community Group 1"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Video guides & how-to walkthroughs"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://whatsapp.com/... or https://t.me/..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 font-mono"
                  required
                />
              </div>

              {/* Icon Type & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Icon Type
                  </label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b101b] text-slate-900 dark:text-white outline-none focus:border-sky-600 cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 accent-sky-600"
                  />
                  <span>Active &amp; Visible to Users</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingLink ? "Save Changes" : "Create Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Resource Link
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {deleteTarget.title}
              </span>
              ? It will no longer appear on the user Help Center.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
