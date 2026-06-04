"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { TuanziAvatarSvg } from "@/components/tuanzi/TuanziAvatarSvg";

export type SeatRole = {
  id: string;
  name: string;
  title?: string;
  avatar: string;
  accent: string;
  modelLabel: string;
  configured?: boolean;
};

export function RoleSeat({
  role,
  active,
  selected,
  onToggle,
  disabled,
}: {
  role: SeatRole;
  active?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  const clickable = !!onToggle && !disabled;

  return (
    <motion.button
      type="button"
      disabled={!clickable}
      onClick={onToggle}
      whileHover={clickable ? { scale: 1.03 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      animate={
        active
          ? {
              boxShadow: [
                `0 0 0 0px ${role.accent}00`,
                `0 0 0 3px ${role.accent}66`,
                `0 0 0 0px ${role.accent}00`,
              ],
            }
          : undefined
      }
      transition={active ? { duration: 1.4, repeat: Infinity } : undefined}
      className={[
        "flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors",
        selected
          ? "border-amber-400/80 bg-amber-50/80"
          : "border-stone-200/60 bg-white/60",
        disabled ? "opacity-50 cursor-not-allowed" : clickable ? "cursor-pointer" : "",
        !role.configured && role.id !== "tuanzi" ? "opacity-60" : "",
      ].join(" ")}
      style={selected ? { borderColor: role.accent } : undefined}
    >
      <div className="relative size-14 overflow-hidden rounded-full ring-2 ring-white shadow">
        {role.avatar.includes("tuanzi-avatar") ? (
          <Image src={role.avatar} alt="" width={56} height={56} className="object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={role.avatar} alt="" className="size-full object-cover" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-stone-800">{role.name}</p>
        {role.title && <p className="text-[10px] text-stone-500">{role.title}</p>}
        <p
          className="mt-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
          style={{ backgroundColor: `${role.accent}33` }}
        >
          {role.modelLabel}
        </p>
      </div>
      {!role.configured && role.id !== "tuanzi" && (
        <span className="text-[9px] text-rose-500">未配置 Key</span>
      )}
      {selected && <TuanziAvatarSvg className="hidden" />}
    </motion.button>
  );
}
