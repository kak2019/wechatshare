import { TILE_LOGIC_SIZE } from "@/content/yanglegeyang";
import type { BoardTile } from "@/lib/yanglegeyang/types";

export function tileRect(tile: BoardTile) {
  return {
    left: tile.x,
    top: tile.y,
    right: tile.x + TILE_LOGIC_SIZE,
    bottom: tile.y + TILE_LOGIC_SIZE,
  };
}

function rectsOverlap(a: ReturnType<typeof tileRect>, b: ReturnType<typeof tileRect>): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function isTileClickable(tile: BoardTile, board: BoardTile[]): boolean {
  if (tile.removed) return false;
  const rect = tileRect(tile);
  for (const other of board) {
    if (other.removed || other.uid === tile.uid) continue;
    if (other.layer <= tile.layer) continue;
    if (rectsOverlap(rect, tileRect(other))) return false;
  }
  return true;
}

export function getClickableTiles(board: BoardTile[]): BoardTile[] {
  return board.filter((t) => isTileClickable(t, board));
}

export function getClickableUids(board: BoardTile[]): Set<string> {
  return new Set(getClickableTiles(board).map((t) => t.uid));
}
