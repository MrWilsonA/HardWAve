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
  Sparkles,
  Sun,
  Moon,
  Wind,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { natureAudio } from "@/utils/natureAudio";

interface SoundControllerProps {
  isNight?: boolean;
  speed?: number;
}

export default function SoundController({ isNight = false, speed = 0 }: SoundControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.40);
  const [natureVolume, setNatureVolume] = useState(0.55);
  const [natureEnabled, setNatureEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const natureAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize HTML5 Audio & Nature Web Audio Engine
  useEffect(() => {
    const audio = new Audio("/audio/bgm.wav");
    audio.loop = true;
    audio.volume = bgmVolume;
    audioRef.current = audio;

    const natureTrack = new Audio("/audio/nature.mp3");
    natureTrack.loop = true;
    natureTrack.volume = natureVolume;
    natureAudioRef.current = natureTrack;

    const startAudio = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // Start procedural nature audio
        if (natureAudio) {
          natureAudio.init();
          natureAudio.setVolume(natureVolume);
          natureAudio.update(isNight, speed);
        }

        // Start BGM & Nature Audio
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
        natureTrack.play().catch(() => {});
      }
    };

    window.addEventListener("click", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });

    return () => {
      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
      audio.pause();
      audio.src = "";
      natureTrack.pause();
      natureTrack.src = "";
      if (natureAudio) natureAudio.destroy();
    };
  }, []);

  // Sync BGM volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  // Sync Nature Track volume & mute
  useEffect(() => {
    if (natureAudioRef.current) {
      natureAudioRef.current.volume = isMuted || !natureEnabled ? 0 : natureVolume;
    }
  }, [natureVolume, isMuted, natureEnabled]);

  // Sync Nature Audio Volume, Day/Night, and Driving Speed
  useEffect(() => {
    if (natureAudio) {
      natureAudio.setVolume(isMuted || !natureEnabled ? 0 : natureVolume);
      natureAudio.update(isNight, speed);
    }
  }, [natureVolume, natureEnabled, isMuted, isNight, speed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      if (natureAudioRef.current) natureAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (natureAudio) {
        natureAudio.init();
        natureAudio.resume();
      }
      if (natureAudioRef.current) natureAudioRef.current.play().catch(() => {});
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
        title="Music & Nature Sound Settings"
      >
        {isMuted || (!isPlaying && !natureEnabled) ? (
          <VolumeX className="w-5 h-5" />
        ) : bgmVolume > 0.5 || natureVolume > 0.5 ? (
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
          className="absolute top-12 right-0 w-[265px] p-4 rounded-3xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 select-none space-y-3.5"
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
                Sound System
              </span>
            </div>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: isPlaying ? "rgba(74, 222, 128, 0.2)" : "rgba(255, 255, 255, 0.1)",
                color: isPlaying ? "#4ade80" : "#94a3b8",
              }}
            >
              {isPlaying ? "ACTIVE" : "STANDBY"}
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
                <p className="text-[9px] text-emerald-400 font-medium">Isekai Adventure BGM</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer bg-white/10 border-white/20 hover:bg-white/20 text-white"
                title={isPlaying ? "Pause" : "Play"}
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

          {/* 2. BGM Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Music size={11} className="text-amber-400" /> BGM Volume
              </span>
              <span className="text-amber-300 font-bold">
                {isMuted ? "0%" : `${Math.round(bgmVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : bgmVolume}
              onChange={(e) => {
                setBgmVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-400 bg-white/10"
            />
          </div>

          {/* 3. Natural Ambience Sound Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Wind size={11} className="text-emerald-400" /> Nature Ambience
              </span>
              <span className="text-emerald-400 font-bold">
                {!natureEnabled || isMuted ? "0%" : `${Math.round(natureVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={!natureEnabled || isMuted ? 0 : natureVolume}
              onChange={(e) => {
                setNatureVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
                if (!natureEnabled) setNatureEnabled(true);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/10"
            />
          </div>

          {/* 4. Live Environment Audio Status */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Environment</span>
            <div className="flex items-center gap-1 font-bold text-emerald-300">
              {isNight ? (
                <>
                  <Moon size={11} className="text-indigo-400" /> Crickets & Night Breeze
                </>
              ) : (
                <>
                  <Sun size={11} className="text-amber-400" /> Forest Birdsong & Wind
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
