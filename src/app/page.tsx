import { LoveHome } from "@/components/love/LoveHome";

function coupleVideoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_COUPLE_VIDEO_URL?.trim();
  if (fromEnv) return fromEnv;
  return "";
}

export default function Home() {
  const poster = process.env.NEXT_PUBLIC_COUPLE_VIDEO_POSTER?.trim();
  return (
    <LoveHome videoSrc={coupleVideoSrc()} posterSrc={poster || undefined} />
  );
}
