
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  brandLabel = "Control Panel",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  brandLabel?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-100">
        {/* <div className="flex items-center gap-2 justify-center mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-card bg-brand/15 text-brand">
            <Terminal size={18} />
          </div>
          <span className="font-display text-[15px] tracking-tight text-ink">
            {brandLabel}
          </span>
        </div> */}

        <aside className="rounded-card shadow rounded-2xl bg-base-surface py-8 flex justify-center items-center">
          <div className="w-[90%]">
            <div className="flex flex-col items-center">
              <h1 className="font-semibold text-[26px] text-sky-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-[13px] text-gray-600">{subtitle}</p>
              )}
            </div>

            <div className="mt-6">{children}</div>

            {footer && (
              <div className="mt-5 text-center text-[12.5px] text-sky-900">
                {footer}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
