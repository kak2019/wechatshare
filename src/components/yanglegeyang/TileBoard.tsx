"use client";

import { motion } from "framer-motion";

import { getTileEmoji } from "@/lib/yanglegeyang/engine";

interface TileProps {
  emoji: string;
  clickable: boolean;
  layer: number;
  left: number;
  top: number;
  size: number;
  onPick: () => void;
}

export function Tile({ emoji, clickable, layer, left, top, size, onPick }: TileProps) {
  return (
    <motion.button
      type="button"
      disabled={!clickable}
      onClick={onPick}
      className={[
        "absolute flex items-center justify-center rounded-xl shadow-md ring-1",
        clickable
          ? "cursor-pointer bg-white ring-amber-200/80 active:scale-95"
          : "cursor-not-allowed bg-gray-100/90 opacity-45 ring-gray-200",
      ].join(" ")}
      style={{
        left,
        top,
        width: size,
        height: size,
        zIndex: layer * 10 + 1,
        fontSize: Math.max(18, size * 0.45),
      }}
      whileTap={clickable ? { scale: 0.92 } : undefined}
      aria-label={emoji}
    >
      {emoji}
    </motion.button>
  );
}

interface TileBoardProps {
  board: import("@/lib/yanglegeyang/types").BoardTile[];
  clickableUids: Set<string>;
  tilePx: number;
  bounds: { width: number; height: number };
  onPick: (uid: string) => void;
}

export function TileBoard({ board, clickableUids, tilePx, bounds, onPick }: TileBoardProps) {
  const boardW = bounds.width * (tilePx / 2);
  const boardH = bounds.height * (tilePx / 2);

  return (
    <div className="relative mx-auto w-full max-w-[364px] flex-1 min-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div
        className="relative mx-auto"
        style={{ width: boardW, height: boardH, minHeight: "100%" }}
      >
        {board
          .filter((t) => !t.removed)
          .sort((a, b) => a.layer - b.layer)
          .map((t) => (
            <Tile
              key={t.uid}
              emoji={getTileEmoji(t.typeId)}
              clickable={clickableUids.has(t.uid)}
              layer={t.layer}
              left={t.x * (tilePx / 2)}
              top={t.y * (tilePx / 2)}
              size={tilePx}
              onPick={() => onPick(t.uid)}
            />
          ))}
      </div>
    </div>
  );
}
