"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Position = { x: number; y: number };
type BotPath = "support" | "rewards" | "launch";

type AIAgentBotProps = {
  size?: number;
  bottomOffset?: number;
  rightOffset?: number;
  storageKey?: string;
  href?: string;
};

export default function AIAgentBot({
  size = 64,
  bottomOffset = 24,
  rightOffset = 24,
  storageKey = "home-floating-ai-agent-position",
  href = "/ai-agent",
}: AIAgentBotProps) {
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [dragging, setDragging] = useState(false);
  const [popupDragging, setPopupDragging] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [popupPosition, setPopupPosition] = useState<Position | null>(null);
  const [typedWelcome, setTypedWelcome] = useState("");
  const [activePath, setActivePath] = useState<BotPath | null>(null);
  const [hoveredLauncher, setHoveredLauncher] = useState(false);
  const [launcherBurst, setLauncherBurst] = useState(false);
  const pointerOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const pointerStartRef = useRef<Position>({ x: 0, y: 0 });
  const popupPointerOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const popupPointerStartRef = useRef<Position>({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const popupMovedRef = useRef(false);
  const fullWelcome =
    "Hello, I'm Refreeg AI Assistant 🤖. Want to crowdfund with us 💙, earn EIZA rewards ✨, or launch your own cause 🚀?";
  const desktopPopupWidth = 320;
  const mobilePopupWidth = 280;
  const popupSafeMargin = 12;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;
    const fallbackX = Math.max(0, maxX - rightOffset);
    const fallbackY = Math.max(0, maxY - bottomOffset);

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      setPosition({ x: fallbackX, y: fallbackY });
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Position;
      setPosition({
        x: Math.max(0, Math.min(parsed.x, maxX)),
        y: Math.max(0, Math.min(parsed.y, maxY)),
      });
    } catch {
      setPosition({ x: fallbackX, y: fallbackY });
    }
  }, [size, bottomOffset, rightOffset, storageKey]);

  useEffect(() => {
    if (!position || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position, storageKey]);

  const openBotAction = () => {
    setLauncherBurst(true);
    setShowIntro(true);
    setActivePath(null);
    setPopupPosition(null);
  };

  useEffect(() => {
    if (!launcherBurst) return;
    const timeout = window.setTimeout(() => setLauncherBurst(false), 320);
    return () => window.clearTimeout(timeout);
  }, [launcherBurst]);

  useEffect(() => {
    if (!showIntro) return;
    setTypedWelcome("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedWelcome(fullWelcome.slice(0, index));
      if (index >= fullWelcome.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [showIntro, fullWelcome]);

  const closeIntro = () => {
    setShowIntro(false);
    setActivePath(null);
    setTypedWelcome("");
  };

  const handlePrimaryAction = () => {
    if (activePath === "support") {
      closeIntro();
      router.push("/causes");
      return;
    }
    if (activePath === "rewards") {
      closeIntro();
      router.push(href);
      return;
    }
    if (activePath === "launch") {
      closeIntro();
      router.push("/dashboard/causes/create");
    }
  };

  useEffect(() => {
    if (!position || typeof window === "undefined") return;

    const onResize = () => {
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size;
      setPosition((prev) => {
        if (!prev) return prev;
        return {
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY)),
        };
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position, size]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!position) return;
    setDragging(true);
    movedRef.current = false;
    pointerOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !position || typeof window === "undefined") return;

    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;
    const x = event.clientX - pointerOffsetRef.current.x;
    const y = event.clientY - pointerOffsetRef.current.y;
    const movementX = event.clientX - pointerStartRef.current.x;
    const movementY = event.clientY - pointerStartRef.current.y;

    if (Math.abs(movementX) + Math.abs(movementY) > 6) {
      movedRef.current = true;
    }

    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!movedRef.current) {
      openBotAction();
    }
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    movedRef.current = true;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const viewportWidth =
    typeof window === "undefined" ? desktopPopupWidth + popupSafeMargin * 2 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const isMobileViewport = viewportWidth < 640;
  const popupWidth =
    isMobileViewport
      ? Math.min(mobilePopupWidth, viewportWidth - popupSafeMargin * 2)
      : desktopPopupWidth;
  const estimatedPopupHeight = activePath
    ? isMobileViewport
      ? 340
      : 360
    : isMobileViewport
      ? 300
      : 320;
  const maxPopupLeft = Math.max(popupSafeMargin, viewportWidth - popupWidth - popupSafeMargin);
  const maxPopupTop = Math.max(popupSafeMargin, viewportHeight - estimatedPopupHeight - popupSafeMargin);

  const handlePopupPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!showIntro) return;
    setPopupDragging(true);
    popupMovedRef.current = false;
    popupPointerOffsetRef.current = {
      x: event.clientX - popupAnchor.x,
      y: event.clientY - popupAnchor.y,
    };
    popupPointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePopupPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!popupDragging) return;
    const x = event.clientX - popupPointerOffsetRef.current.x;
    const y = event.clientY - popupPointerOffsetRef.current.y;
    const movementX = event.clientX - popupPointerStartRef.current.x;
    const movementY = event.clientY - popupPointerStartRef.current.y;

    if (Math.abs(movementX) + Math.abs(movementY) > 6) {
      popupMovedRef.current = true;
    }

    setPopupPosition({
      x: Math.min(Math.max(popupSafeMargin, x), maxPopupLeft),
      y: Math.min(Math.max(popupSafeMargin, y), maxPopupTop),
    });
  };

  const handlePopupPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setPopupDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePopupPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    setPopupDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    if (!showIntro) return;
    setPopupPosition((prev) => {
      if (!prev) return prev;
      const clamped = {
        x: Math.min(Math.max(popupSafeMargin, prev.x), maxPopupLeft),
        y: Math.min(Math.max(popupSafeMargin, prev.y), maxPopupTop),
      };
      if (clamped.x === prev.x && clamped.y === prev.y) {
        return prev;
      }
      return clamped;
    });
  }, [showIntro, maxPopupLeft, maxPopupTop, popupSafeMargin]);

  if (!position) return null;

  const baseLeft = isMobileViewport
    ? (viewportWidth - popupWidth) / 2
    : position.x + size / 2 - popupWidth / 2;
  const popupLeft = Math.min(Math.max(popupSafeMargin, baseLeft), maxPopupLeft);
  const preferAbove = position.y > viewportHeight / 2;
  const baseTop = isMobileViewport
    ? viewportHeight - estimatedPopupHeight - 20
    : preferAbove
      ? position.y - estimatedPopupHeight - 12
      : position.y + size + 12;
  const popupTop = Math.min(Math.max(popupSafeMargin, baseTop), maxPopupTop);
  const popupAnchor = popupPosition
    ? {
        x: Math.min(Math.max(popupSafeMargin, popupPosition.x), maxPopupLeft),
        y: Math.min(Math.max(popupSafeMargin, popupPosition.y), maxPopupTop),
      }
    : { x: popupLeft, y: popupTop };

  return (
    <>
      {showIntro && (
        <div
          className="fixed z-50 w-[280px] max-h-[72vh] overflow-y-auto rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl intro-panel sm:w-[320px] sm:max-h-none sm:overflow-visible sm:p-4"
          style={{ left: popupAnchor.x, top: popupAnchor.y }}
        >
          <div
            onPointerDown={handlePopupPointerDown}
            onPointerMove={handlePopupPointerMove}
            onPointerUp={handlePopupPointerUp}
            onPointerCancel={handlePopupPointerCancel}
            className="flex items-start justify-between gap-2 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
              aria-label="AI Guide"
              title="AI Guide"
            >
              <Sparkles size={11} />
              AI Guide
            </button>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={closeIntro}
              aria-label="Close assistant"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 min-h-[52px] text-sm font-medium leading-6 text-slate-700">
            {typedWelcome}
            {typedWelcome.length < fullWelcome.length ? (
              <span className="ml-0.5 inline-block h-4 w-[1px] animate-pulse bg-blue-500 align-middle" />
            ) : null}
          </p>

          {!activePath ? (
            <div className="mt-3 grid gap-2 panel-slide-in">
              <button
                type="button"
                onClick={() => setActivePath("support")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.99]"
              >
                Crowdfund with us 💙
              </button>
              <button
                type="button"
                onClick={() => setActivePath("rewards")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.99]"
              >
                Earn EIZA rewards
              </button>
              <button
                type="button"
                onClick={() => setActivePath("launch")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.99]"
              >
                Help me launch my cause
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 panel-slide-in">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
                <span className="text-blue-700">Step 1 of 3</span>
                <span className="text-slate-500">Guided setup</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {activePath === "support" && "Discover causes that match your interests."}
                {activePath === "rewards" && "Track your streak and grow your EIZA points."}
                {activePath === "launch" && "Start your cause and get fundraising-ready fast."}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {activePath === "support" &&
                  "I will take you to causes where you can comment, share, and donate in a few taps."}
                {activePath === "rewards" &&
                  "I will open your rewards flow so you can view points and your latest transactions."}
                {activePath === "launch" &&
                  "I will open the create-cause flow and guide you through the first required step."}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePath(null)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full bg-blue-500 transition-all duration-300 ${
                activePath ? "w-1/3" : "w-[10%]"
              }`}
            />
          </div>
        </div>
      )}

      {!showIntro && (
        <button
          type="button"
          aria-label="AI Agent Bot"
          title="Drag or open AI Agent Bot"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onMouseEnter={() => setHoveredLauncher(true)}
          onMouseLeave={() => setHoveredLauncher(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openBotAction();
            }
          }}
          className={`fixed z-50 flex items-center justify-center rounded-full text-white shadow-xl transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
            hoveredLauncher ? "scale-105" : "scale-100"
          } ${launcherBurst ? "launcher-burst" : ""}`}
          style={{
            width: size,
            height: size,
            left: position.x,
            top: position.y,
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          <span className="absolute inset-0 rounded-full bg-blue-100/70 animate-pulse" />
          <span className="absolute inset-1 rounded-full border border-blue-200/80 bg-gradient-to-b from-blue-100 to-blue-200 shadow-inner" />
          <span className="absolute inset-2 rounded-full border border-blue-300/70" />
          <span className="orbit-ring absolute inset-0">
            <span className="orbit-dot" />
          </span>
          <span className="orbit-ring-reverse absolute inset-1">
            <span className="orbit-dot" />
          </span>
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
            <Bot size={18} strokeWidth={2.5} />
          </span>
        </button>
      )}
      <style jsx>{`
        .intro-panel {
          animation: popup-in 220ms ease-out;
        }

        .panel-slide-in {
          animation: panel-in 220ms ease-out;
        }

        .launcher-burst {
          animation: burst 260ms ease-out;
        }

        .orbit-ring {
          animation: orbit 7s linear infinite;
        }

        .orbit-ring-reverse {
          animation: orbit-reverse 9s linear infinite;
        }

        .orbit-dot {
          position: absolute;
          top: 1px;
          left: 50%;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          border-radius: 9999px;
          background: #60a5fa;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes popup-in {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes panel-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes burst {
          0% {
            transform: scale(1);
          }
          45% {
            transform: scale(0.93);
          }
          100% {
            transform: scale(1.04);
          }
        }
      `}</style>
    </>
  );
}
