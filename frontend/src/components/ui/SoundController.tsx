"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  Music,
  Trees,
  Sun,
  Moon,
  Sparkles,
  CloudRain,
  CloudSun,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { natureAudio } from "@/utils/natureAudio";
import { useWorldTelemetry } from "@/store/worldTelemetry";

interface SoundControllerProps {
  isNight?: boolean;
  isRaining?: boolean;
  onToggleRain?: () => void;
}

export default function SoundController({
  isNight = false,
  isRaining = false,
  onToggleRain,
}: SoundControllerProps) {
  // Read the buggy speed straight from telemetry so the parent header does not
  // have to re-render just to forward it.
  const speed = useWorldTelemetry((s) => s.speed);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.25);
  const [sfxVolume, setSfxVolume] = useState(0.30);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const natureRef = useRef<HTMLAudioElement | null>(null);
  const rainyRef = useRef<HTMLAudioElement | null>(null);

  // Latest scene state, read by the one-shot bootstrap below without making it
  // a dependency (re-running it would tear down and re-create every element).
  const latest = useRef({ isNight, isRaining, speed, musicVolume, sfxVolume });
  useEffect(() => {
    latest.current = { isNight, isRaining, speed, musicVolume, sfxVolume };
  }, [isNight, isRaining, speed, musicVolume, sfxVolume]);

  // Initialise the HTML5 audio elements & procedural nature engine once.
  useEffect(() => {
    /**
     * `preload: none` matters: the BGM track is a multi-megabyte WAV, and the
     * browser default ("auto") downloaded all of it on first paint even for
     * visitors who never turn the sound on. Playback still streams on demand.
     */
    const createTrack = (src: string, volume: number) => {
      const el = new Audio();
      el.preload = "none";
      el.loop = true;
      el.volume = volume;
      el.src = src;
      return el;
    };

    const bgm = createTrack("/audio/bgm.wav", latest.current.musicVolume);
    const nature = createTrack("/audio/nature.mp3", latest.current.sfxVolume);
    const rainy = createTrack("/audio/rainy.mp3", latest.current.sfxVolume);

    bgmRef.current = bgm;
    natureRef.current = nature;
    rainyRef.current = rainy;

    // Browsers block audio until a real gesture; this is that gesture.
    const startAudio = () => {
      setHasInteracted(true);
      const { isNight: night, isRaining: raining, speed: spd, sfxVolume: sfx } = latest.current;

      natureAudio?.init();
      natureAudio?.setVolume(sfx);
      natureAudio?.update(night, spd, raining);

      bgm
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
      (raining ? rainy : nature).play().catch(() => {});
    };

    window.addEventListener("pointerdown", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("keydown", startAudio);
      for (const el of [bgm, nature, rainy]) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
      natureAudio?.destroy();
    };
  }, []);

  // Sync Music Volume & Mute
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMuted]);

  // Sync SFX Volume & Weather Audio Switch (Rain vs Nature)
  useEffect(() => {
    const effectiveSfxVol = isMuted ? 0 : sfxVolume;

    if (natureRef.current) {
      natureRef.current.volume = effectiveSfxVol;
    }
    if (rainyRef.current) {
      rainyRef.current.volume = effectiveSfxVol;
    }

    // Switch between Rainy Track and Nature Track
    if (isPlaying && !isMuted) {
      if (isRaining) {
        natureRef.current?.pause();
        rainyRef.current?.play().catch(() => {});
      } else {
        rainyRef.current?.pause();
        natureRef.current?.play().catch(() => {});
      }
    } else {
      natureRef.current?.pause();
      rainyRef.current?.pause();
    }

    if (natureAudio) {
      natureAudio.setVolume(effectiveSfxVol);
      natureAudio.update(isNight, speed, isRaining);
    }
  }, [sfxVolume, isMuted, isRaining, isPlaying, isNight, speed]);

  const togglePlay = () => {
    if (!bgmRef.current) return;
    if (isPlaying) {
      bgmRef.current.pause();
      natureRef.current?.pause();
      rainyRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (natureAudio) {
        natureAudio.init();
        natureAudio.resume();
      }
      if (isRaining) {
        rainyRef.current?.play().catch(() => {});
      } else {
        natureRef.current?.play().catch(() => {});
      }
      bgmRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (isMuted) setIsMuted(false);
        })
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative">
      {/* Sound Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer relative group"
        style={{
          background: isPlaying && !isMuted
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 78, 59, 0.95))"
            : THEME.colors.glass.bg,
          borderColor: isPlaying && !isMuted ? "#4ade80" : THEME.colors.glass.border,
          backdropFilter: THEME.colors.glass.backdropBlur,
          color: isPlaying && !isMuted ? "#4ade80" : "#94a3b8",
        }}
        title="Audio & Sound Settings"
      >
        {isMuted || !isPlaying ? (
          <VolumeX className="w-5 h-5" />
        ) : musicVolume > 0.5 || sfxVolume > 0.5 ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <Volume1 className="w-5 h-5" />
        )}

        {/* Audio Active Dot */}
        {isPlaying && !isMuted && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>

      {/* Sound Settings Popover */}
      {isOpen && (
        <div
          className="absolute top-12 right-0 w-[275px] p-4 rounded-3xl border shadow-2xl hw-popover z-50 select-none space-y-3.5"
          style={{
            background: THEME.colors.glass.bgElevated,
            borderColor: THEME.colors.glass.border,
            backdropFilter: "blur(24px)",
            boxShadow: THEME.colors.glass.shadow,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Audio Settings
              </span>
            </div>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: isPlaying ? "rgba(74, 222, 128, 0.2)" : "rgba(255, 255, 255, 0.1)",
                color: isPlaying ? "#4ade80" : "#94a3b8",
              }}
            >
              {isPlaying ? "PLAYING" : hasInteracted ? "PAUSED" : "TAP TO START"}
            </span>
          </div>

          {/* 1. Track Info & Quick Actions */}
          <div
            className="p-2.5 rounded-2xl flex items-center justify-between border"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shadow-inner shrink-0"
                style={{
                  background: isPlaying
                    ? "linear-gradient(135deg, #10b981, #065f46)"
                    : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <Music className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-white truncate">Lanterns Over Fernvale</p>
                <p className="text-[9px] text-emerald-400 font-medium">Isekai OST (Loop)</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer bg-white/10 border-white/20 hover:bg-white/20 text-white"
                title={isPlaying ? "Pause Audio" : "Play Audio"}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer text-slate-300 hover:text-white"
                style={{
                  background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  borderColor: isMuted ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.15)",
                }}
                title={isMuted ? "Unmute All" : "Mute All"}
              >
                {isMuted ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} />}
              </button>
            </div>
          </div>

          {/* 2. Channel 1: Music (BGM) Volume */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Music size={11} className="text-amber-400" /> Music (BGM)
              </span>
              <span className="text-amber-300 font-bold">
                {isMuted ? "0%" : `${Math.round(musicVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : musicVolume}
              onChange={(e) => {
                setMusicVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-400 bg-white/10"
            />
          </div>

          {/* 3. Channel 2: SFX (Nature & Rain) Volume */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-400" /> SFX (Nature & Rain)
              </span>
              <span className="text-emerald-400 font-bold">
                {isMuted ? "0%" : `${Math.round(sfxVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : sfxVolume}
              onChange={(e) => {
                setSfxVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/10"
            />
          </div>

          {/* 4. Weather Rain Toggle & Ambient Status */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
              {isRaining ? (
                <span className="flex items-center gap-1 text-sky-400 font-bold">
                  <CloudRain size={12} className="animate-bounce" /> Rainy Audio
                </span>
              ) : isNight ? (
                <span className="flex items-center gap-1 text-indigo-300 font-bold">
                  <Moon size={12} /> Night Crickets
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Sun size={12} /> Day Birds
                </span>
              )}
            </div>

            {onToggleRain && (
              <button
                onClick={onToggleRain}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95 cursor-pointer"
                style={{
                  background: isRaining
                    ? "linear-gradient(135deg, rgba(2, 132, 199, 0.4), rgba(3, 105, 161, 0.9))"
                    : "rgba(255, 255, 255, 0.08)",
                  borderColor: isRaining ? "#38bdf8" : "rgba(255, 255, 255, 0.15)",
                  color: isRaining ? "#7dd3fc" : "#cbd5e1",
                }}
                title={isRaining ? "Stop Rain" : "Start Rain"}
              >
                {isRaining ? <CloudSun size={12} /> : <CloudRain size={12} />}
                <span>{isRaining ? "Clear Sky" : "Rain Mode"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
