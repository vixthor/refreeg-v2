"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";

type Position = { x: number; y: number };

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
  const [showIntro, setShowIntro] = useState(false);
  const pointerOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const pointerStartRef = useRef<Position>({ x: 0, y: 0 });
  const movedRef = useRef(false);

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
    setShowIntro(true);
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

  if (!position) return null;

  const popupLeft = Math.max(12, position.x + size / 2 - 140);
  const popupTop = Math.max(12, position.y - 190);

  return (
    <>
      {showIntro && (
        <div
          className="fixed z-50 w-[280px] rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl"
          style={{ left: popupLeft, top: popupTop }}
        >
          <p className="text-sm font-medium leading-6 text-slate-700">
            Hey, I&apos;m Refreeg AI Assistant. How can I help today?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowIntro(false);
                router.push("/causes");
              }}
              className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              Crowdfund
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIntro(false);
                router.push(href);
              }}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              EIZA Rewards
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="AI Agent Bot"
        title="Drag or open AI Agent Bot"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openBotAction();
          }
        }}
        className="fixed z-50 flex items-center justify-center rounded-full text-white shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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
      <style jsx>{`
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
      `}</style>
    </>
  );
}
