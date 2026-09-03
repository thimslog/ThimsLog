export default function WhatsAppCard() {
  return (
    <div className="relative flex max-w-xs flex-col items-center overflow-hidden rounded-4xl border border-[#7ae39f]/50 bg-[#e7f9ee] px-6 py-8 text-center shadow-[0_10px_25px_-5px_rgba(37,211,102,0.15)]">
      {/* Background Watermark Icon */}
      <svg
        className="pointer-events-none absolute -right-6 -top-4 h-48 w-48 text-[#25D366]/10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>

      {/* Top Floating Circular Icon */}
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-[#25D366]/30">
        <svg
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      </div>

      {/* Text Content */}
      <div className="relative z-10 mt-5 space-y-1">
        <h3 className="text-xl font-extrabold tracking-tight text-[#083b27]">
          ThimLogs News
        </h3>
        <p className="text-sm font-medium text-[#196b4a]">
          Get exclusive updates &amp; drops
        </p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className="relative z-10 mt-6 w-full rounded-2xl bg-[#25D366] py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition duration-200 hover:bg-[#20ba59] active:scale-[0.98] cursor-pointer"
      >
        Join WhatsApp
      </button>
    </div>
  );
}
