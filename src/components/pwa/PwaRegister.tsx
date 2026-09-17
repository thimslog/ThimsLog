"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle2, Share } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("PWA Service Worker registration failed:", error);
          });
      });
    }

    // 2. Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check for iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // 3. Listen for BeforeInstallPrompt event (Android, Chrome, Edge, Windows, Mac)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosPrompt(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed || (!isInstallable && !isIos)) {
    return null;
  }

  return (
    <>
      {/* Floating Install Prompt Banner (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto">
        <div className="bg-slate-900/95 dark:bg-[#0b101b]/95 backdrop-blur-md text-white border border-slate-700/60 dark:border-white/15 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                Install Thimslog App
              </h4>
              <p className="text-[11px] text-slate-300 dark:text-slate-400 truncate">
                Fast access, offline mode & native feel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss app install banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS "Add to Home Screen" Instruction Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0b101b] w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <h3 className="text-sm font-bold">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosPrompt(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To install <strong>Thimslog</strong> on your Apple device without the App Store:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">1.</span>
                <span>
                  Tap the <strong>Share</strong> icon{" "}
                  <Share size={13} className="inline mx-1 text-sky-600 dark:text-sky-400" /> at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">2.</span>
                <span>Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">3.</span>
                <span>Tap <strong>Add</strong> in the top right corner to install the icon.</span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
