import type { BgmTrack } from "@/lib/soviet-vn/types";

const TRACK_FILES: Record<Exclude<BgmTrack, "none">, string> = {
  ambient: "/audio/soviet-vn/ambient.mp3",
  sochi: "/audio/soviet-vn/sochi-theme.mp3",
  fishing: "/audio/soviet-vn/fishing-theme.mp3",
  katyusha: "/audio/soviet-vn/katyusha.mp3",
};

type AmbientVoice = {
  stop: () => void;
};

let audioCtx: AudioContext | null = null;
let ambientVoice: AmbientVoice | null = null;
let htmlAudio: HTMLAudioElement | null = null;
let currentTrack: BgmTrack = "none";
let unlocked = false;
let muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function unlockAudio(): void {
  unlocked = true;
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

export function setMuted(value: boolean): void {
  muted = value;
  if (htmlAudio) htmlAudio.muted = value;
  if (muted) stopAmbientSynth();
}

export function isMuted(): boolean {
  return muted;
}

function stopHtmlAudio(): void {
  if (!htmlAudio) return;
  htmlAudio.pause();
  htmlAudio.src = "";
  htmlAudio = null;
}

function stopAmbientSynth(): void {
  ambientVoice?.stop();
  ambientVoice = null;
}

async function fileExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function startAmbientSynth(track: BgmTrack): void {
  stopAmbientSynth();
  if (muted || !unlocked) return;

  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = track === "katyusha" ? 0.08 : 0.05;
  master.connect(ctx.destination);

  const freqs =
    track === "sochi"
      ? [55, 82.5, 110]
      : track === "fishing"
        ? [49, 73.5, 98]
        : track === "katyusha"
          ? [65.4, 98, 130.8]
          : [43.65, 65.4, 87.3];

  const stops: (() => void)[] = [];

  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = track === "katyusha" ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.12 / freqs.length;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    stops.push(() => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
  }

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();
  stops.push(() => {
    try {
      lfo.stop();
    } catch {
      /* noop */
    }
  });

  ambientVoice = {
    stop: () => {
      for (const fn of stops) fn();
      try {
        master.disconnect();
      } catch {
        /* noop */
      }
    },
  };
}

async function playHtmlTrack(track: Exclude<BgmTrack, "none">): Promise<boolean> {
  const url = TRACK_FILES[track];
  const exists = await fileExists(url);
  if (!exists) return false;

  stopHtmlAudio();
  stopAmbientSynth();

  const audio = new Audio(url);
  audio.loop = track !== "katyusha";
  audio.volume = track === "katyusha" ? 0.65 : 0.45;
  audio.muted = muted;
  htmlAudio = audio;
  try {
    await audio.play();
    return true;
  } catch {
    htmlAudio = null;
    return false;
  }
}

export async function playBgm(track: BgmTrack): Promise<void> {
  if (track === currentTrack) return;
  currentTrack = track;

  if (track === "none" || muted) {
    stopHtmlAudio();
    stopAmbientSynth();
    return;
  }

  if (!unlocked) return;

  const played = await playHtmlTrack(track);
  if (!played) {
    stopHtmlAudio();
    startAmbientSynth(track);
  } else {
    stopAmbientSynth();
  }
}

export function stopAllBgm(): void {
  currentTrack = "none";
  stopHtmlAudio();
  stopAmbientSynth();
}

export function getCurrentTrack(): BgmTrack {
  return currentTrack;
}
