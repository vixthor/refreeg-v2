"use client";
import React, { useState } from "react";

export default function MultimediaCarousel({
  media,
  coverImage,
  title,
}: {
  media: string[];
  coverImage?: string;
  title: string;
}) {
  const [current, setCurrent] = useState(0);
  const slides = [coverImage, ...media.filter(Boolean)].filter(Boolean);
  const isVideo = (url: string) => /\.(mp4|mov|webm)$/i.test(url);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {slides.map((url, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-500 ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {typeof url === "string" && isVideo(url) ? (
            <video
              src={url}
              controls
              className="object-contain w-full h-full bg-black"
              poster={coverImage && idx === 0 ? coverImage : undefined}
            />
          ) : (
            <img
              src={url as string}
              alt={title}
              className="object-cover w-full h-full"
            />
          )}
        </div>
      ))}
      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full w-10 h-10 shadow-md z-20"
            aria-label="Previous"
            type="button"
          >
            &#8592;
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black rounded-full w-10 h-10 shadow-md z-20"
            aria-label="Next"
            type="button"
          >
            &#8594;
          </button>
        </>
      )}
      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 rounded-full ${
                idx === current ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}
