"use client";

import { BookVideoHero } from "./BookVideoHero";
import { LoveScrollSections } from "./LoveScrollSections";
import { TopNav } from "./TopNav";

export type LoveHomeProps = {
  videoSrc: string;
  posterSrc?: string;
};

export function LoveHome({ videoSrc, posterSrc }: LoveHomeProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1d1d1f]">
      <TopNav />
      <main>
        <BookVideoHero videoSrc={videoSrc} posterSrc={posterSrc} />
        <LoveScrollSections />
      </main>
    </div>
  );
}
