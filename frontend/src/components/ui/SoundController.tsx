"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Volume1, Play, Pause, Music, Sparkles } from "lucide-react";
import { THEME } from "@/theme/designSystem";

export default function SoundController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio instance with BGM track
    const audio = new Audio("/audio/bgm.wav");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Autoplay on first click anywhere on page (browser policy compliance)
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked until manual play
          });
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync volume & mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (isMuted) setIsMuted(false);
        })
        .catch((e) => console.error("Audio playback error:", e));
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
        title="Music & Sound Settings"
      >
        {isMuted || !isPlaying ? (
          <VolumeX className="w-5 h-5" />
        ) : volume > 0.5 ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <Volume1 className="w-5 h-5" />
        )}

        {/* Small Audio Playing Indicator Dot */}
        {isPlaying && !isMuted && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>

      {/* Sound Settings Popover */}
      {isOpen && (
        <div
          className="absolute top-12 right-0 w-[250px] p-4 rounded-3xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 select-none space-y-3.5"
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
              <Music className="w-4 h-4 text-emerald-400" />
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
              {isPlaying ? "PLAYING" : "PAUSED"}
            </span>
          </div>

          {/* Now Playing Track Info */}
          <div
            className="p-2.5 rounded-2xl flex items-center gap-3 border"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #10b981, #065f46)"
                  : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Lanterns Over Fernvale</p>
              <p className="text-[9px] text-emerald-400 font-medium">Peaceful Isekai BGM</p>
            </div>
          </div>

          {/* Play/Pause & Mute Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(153, 27, 27, 0.8))"
                  : "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 78, 59, 0.95))",
                border: `1px solid ${isPlaying ? "rgba(248, 113, 113, 0.5)" : "rgba(74, 222, 128, 0.5)"}`,
                color: "#ffffff",
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause Music" : "Play Music"}</span>
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl border transition-all active:scale-95 cursor-pointer text-slate-300 hover:text-white"
              style={{
                background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                borderColor: isMuted ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.15)",
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400">Master Volume</span>
              <span className="text-emerald-400 font-bold">
                {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
