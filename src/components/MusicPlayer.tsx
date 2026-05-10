"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import type { Song } from "@/lib/gaana";
import type { Quality } from "@/lib/config";
import { QUALITY_OPTIONS, QUALITY_TO_MUSIC_KEY } from "@/lib/config";
import { usePlaylist } from "@/lib/playlist";
import { useToast } from "@/lib/toast";
import { ActionsDropdown, MenuItem, MenuDivider, SubMenu, MenuRadioGroup, MenuRadioItem } from "./ActionsDropdown";
import { AddToPlaylistDropdown } from "./AddToPlaylistDropdown";

interface MusicPlayerProps {
  song: Song;
  queue: Song[];
  quality: Quality;
  onClose: () => void;
  onQualityChange?: (quality: Quality) => void;
  onPlayFromQueue: (song: Song) => void;
  onPlayNextInQueue: () => void;
  onPlayPrevInQueue: () => void;
  onRemoveFromQueue: (songId: string) => void;
  onMoveQueueItem: (songId: string, direction: "up" | "down") => void;
  onClearQueue: () => void;
  autoPlay?: boolean;
}

type RepeatMode = 'off' | 'track' | 'queue';

interface PlayerActionsMenuProps {
  song: Song;
  quality: Quality;
  onQualityChange?: (quality: Quality) => void;
  onDownload: () => void;
  onShowShortcuts: () => void;
  onClosePlayer: () => void;
}

const PlayerActionsMenu = memo(function PlayerActionsMenu({
  song,
  quality,
  onQualityChange,
  onDownload,
  onShowShortcuts,
  onClosePlayer,
}: PlayerActionsMenuProps) {
  return (
    <>
      <SubMenu
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        }
        label="Quality"
      >
        <MenuRadioGroup value={quality} onValueChange={(v) => onQualityChange?.(v as Quality)}>
          {QUALITY_OPTIONS.map((opt) => (
            <MenuRadioItem key={opt.value} value={opt.value} label={opt.label} checked={quality === opt.value} />
          ))}
        </MenuRadioGroup>
      </SubMenu>

      <SubMenu
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
        label="Add to playlist"
      >
        <AddToPlaylistDropdown song={song} />
      </SubMenu>

      <MenuDivider />
      <MenuItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>}
        label="Download"
        onClick={onDownload}
      />
      <MenuItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" /></svg>}
        label="Keyboard shortcuts"
        onClick={onShowShortcuts}
      />
      <MenuDivider />
      <MenuItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
        label="Close player"
        onClick={onClosePlayer}
        danger
      />
    </>
  );
});

export function MusicPlayer({
  song,
  queue,
  quality,
  onClose,
  onQualityChange,
  onPlayFromQueue,
  onPlayNextInQueue,
  onPlayPrevInQueue,
  onRemoveFromQueue,
  onMoveQueueItem,
  onClearQueue,
  autoPlay = false,
}: MusicPlayerProps) {
  const LIKED_PLAYLIST_NAME = "Liked Songs";
  const { playlists, createNewPlaylist, addSong, removeSong, isSongAdded } = usePlaylist();
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [heartPopKey, setHeartPopKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<any>(null);
  const hasAutoPlayed = useRef(false);

  const musicKey = QUALITY_TO_MUSIC_KEY[quality];
  const streamUrl = song.music[musicKey];
  const currentQueueIndex = queue.findIndex((queuedSong) => queuedSong.id === song.id);
  const hasPrevInQueue = currentQueueIndex > 0;
  const hasNextInQueue = currentQueueIndex >= 0 && currentQueueIndex < queue.length - 1;

  const getLikedPlaylistId = useCallback(() => {
    return playlists.find((playlist) => playlist.name.toLowerCase() === LIKED_PLAYLIST_NAME.toLowerCase())?.id;
  }, [playlists]);

  useEffect(() => {
    let isCancelled = false;
    const syncLikedState = async () => {
      const likedPlaylistId = getLikedPlaylistId();
      if (!likedPlaylistId) {
        if (!isCancelled) setIsLiked(false);
        return;
      }
      const added = await isSongAdded(likedPlaylistId, song.id);
      if (!isCancelled) setIsLiked(added);
    };

    syncLikedState();
    return () => {
      isCancelled = true;
    };
  }, [getLikedPlaylistId, isSongAdded, song.id]);

  useEffect(() => {
    const loadHls = async () => {
      if (!streamUrl) return;

      const Hls = (await import("hls.js")).default;

      if (Hls.isSupported() && audioRef.current) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay && !hasAutoPlayed.current && audioRef.current) {
            hasAutoPlayed.current = true;
            audioRef.current.play().catch(() => setIsPlaying(false));
          }
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error("HLS error:", data);
          setIsLoading(false);
        });
        hlsRef.current = hls;
      } else if (audioRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        audioRef.current.src = streamUrl;
        setIsLoading(false);
        if (autoPlay && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }
    };

    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    hasAutoPlayed.current = false;
    loadHls();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [streamUrl, autoPlay]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const seekTo = useCallback((percent: number) => {
    if (!audioRef.current) return;
    const newTime = (percent / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          seek(30);
          break;
        case "ArrowDown":
          e.preventDefault();
          seek(-30);
          break;
        case "Home":
          e.preventDefault();
          seekTo(0);
          break;
        case "End":
          e.preventDefault();
          seekTo(100);
          break;
        case "KeyH":
          e.preventDefault();
          setShowShortcuts((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seek, seekTo]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const nextTime = audioRef.current.currentTime;
    // Reduce re-render churn while playing to keep hover-driven submenus stable.
    setCurrentTime((prev) => (Math.abs(prev - nextTime) >= 0.25 ? nextTime : prev));
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = useCallback(() => {
    if (!streamUrl) return;
    window.open(streamUrl, "_blank");
    showToast("Download started", "Opened stream URL in a new tab");
  }, [streamUrl, showToast]);

  const openShortcutsExpanded = useCallback(() => {
    setShowShortcuts(true);
    setIsExpanded(false);
  }, []);

  const openShortcutsMinimized = useCallback(() => {
    setShowShortcuts(true);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'track' : prev === 'track' ? 'queue' : 'off';
      const labels = { off: 'Repeat off', track: 'Repeat: Current song', queue: 'Repeat: Queue' };
      showToast(labels[next]);
      return next;
    });
  }, [showToast]);

  const handleQualityChange = useCallback(
    (nextQuality: Quality) => {
      onQualityChange?.(nextQuality);
      const selected = QUALITY_OPTIONS.find((option) => option.value === nextQuality);
      showToast("Stream quality changed", selected?.label || nextQuality);
    },
    [onQualityChange, showToast]
  );

  const toggleLikeSong = useCallback(async () => {
    if (isLikeBusy) return;
    setIsLikeBusy(true);
    try {
      let likedPlaylistId = getLikedPlaylistId();
      if (!likedPlaylistId) {
        const playlist = await createNewPlaylist(LIKED_PLAYLIST_NAME);
        likedPlaylistId = playlist.id;
      }

      if (isLiked) {
        await removeSong(likedPlaylistId, `${likedPlaylistId}-${song.id}`);
        setIsLiked(false);
        showToast("Removed from favorites", song.title);
      } else {
        await addSong(likedPlaylistId, song);
        setIsLiked(true);
        setHeartPopKey((k) => k + 1);
        showToast("Added to favorites", song.title);
      }
    } catch (error) {
      console.error("Failed to toggle liked song:", error);
      showToast("Favorite update failed", "Please try again");
    } finally {
      setIsLikeBusy(false);
    }
  }, [isLikeBusy, getLikedPlaylistId, createNewPlaylist, isLiked, removeSong, song.id, addSong, song, showToast]);

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!streamUrl) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <div className="max-w-4xl mx-auto text-center text-text-secondary">
          No streaming URL available
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Expanded drawer overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-surface border-t border-border shadow-elevated z-50 transform transition-transform duration-300 ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "80vh" }}
      >
        <div className="h-full flex flex-col max-w-lg mx-auto px-6 py-6">
          {/* Handle bar */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-surface-elevated rounded-full" />
          </div>

          {/* Top-right actions */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <button
              onClick={toggleLikeSong}
              disabled={isLikeBusy}
              className={`p-2 transition-all duration-200 ${isLiked ? 'text-purple-400 hover:text-purple-300' : 'text-text-muted hover:text-text-primary'}`}
              title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              key={heartPopKey}
            >
              <svg
                width="22" height="22" viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                className={isLiked ? 'animate-heart-pop' : ''}
              >
                <path d="M12 21s-7-4.35-9.33-8.11C.5 9.34 2.42 5 6.5 5c2.16 0 3.44 1.23 4.2 2.36C11.46 6.23 12.84 5 15 5c4.08 0 6 4.34 3.83 7.89C16.5 16.65 12 21 12 21z" />
              </svg>
            </button>
            <button
              onClick={cycleRepeat}
              className={`p-2 transition-all duration-200 ${repeatMode !== 'off' ? 'text-primary hover:text-primary-hover' : 'text-text-muted hover:text-text-primary'}`}
              title={repeatMode === 'off' ? 'Repeat: Off' : repeatMode === 'track' ? 'Repeat: Current song' : 'Repeat: Queue'}
            >
              {repeatMode === 'track' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              )}
            </button>
            <ActionsDropdown side="bottom">
              <PlayerActionsMenu
                song={song}
                quality={quality}
                onQualityChange={handleQualityChange}
                onDownload={handleDownload}
                onShowShortcuts={openShortcutsExpanded}
                onClosePlayer={onClose}
              />
            </ActionsDropdown>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              title="Collapse"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Album art */}
          <div className="flex justify-center mb-6">
            <img
              src={song.thumbnail.large}
              alt={song.title}
              className="w-64 h-64 rounded-xl object-cover shadow-elevated"
            />
          </div>

          {/* Song info */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary truncate mb-1">{song.title}</h3>
            <p className="text-sm text-text-secondary truncate">{song.artists}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-text-muted font-mono w-10">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:duration-200
                    group-hover:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
              <span className="text-xs text-text-muted font-mono w-10 text-right">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <button onClick={() => seek(-10)} className="p-3 text-text-secondary hover:text-text-primary transition-colors" title="Back 10s">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
              title="Play/Pause (Space)"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button onClick={() => seek(10)} className="p-3 text-text-secondary hover:text-text-primary transition-colors" title="Forward 10s">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 6v12l8.5-6L13 6zm-.5 6L4 6v12l8.5-6z" />
              </svg>
            </button>
            <button
              onClick={onPlayPrevInQueue}
              disabled={!hasPrevInQueue}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous in queue"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zM9 12l9 6V6z" />
              </svg>
            </button>
            <button
              onClick={onPlayNextInQueue}
              disabled={!hasNextInQueue}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next in queue"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6h2v12h-2zM6 6v12l9-6z" />
              </svg>
            </button>
          </div>

          {/* Now Playing Queue */}
          <div className="mt-auto min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-text-primary">Now Playing Queue</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{queue.length} songs</span>
                <button
                  onClick={onClearQueue}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  title="Clear queue (keeps current song)"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
              {queue.map((queuedSong) => {
                const isCurrent = queuedSong.id === song.id
                return (
                  <button
                    key={queuedSong.id}
                    onClick={() => onPlayFromQueue(queuedSong)}
                    className={`w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-primary/15 border border-primary/40"
                        : "bg-surface-elevated hover:bg-surface"
                    }`}
                  >
                    <img
                      src={queuedSong.thumbnail.small}
                      alt={queuedSong.title}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs truncate ${isCurrent ? "text-primary font-medium" : "text-text-primary"}`}>
                        {queuedSong.title}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">{queuedSong.artists}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveQueueItem(queuedSong.id, "up")
                        }}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        title="Move up"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveQueueItem(queuedSong.id, "down")
                        }}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        title="Move down"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveFromQueue(queuedSong.id)
                        }}
                        className="p-1 text-text-muted hover:text-error transition-colors"
                        title="Remove from queue"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      {isCurrent && (
                        <span className="text-[10px] text-primary font-semibold ml-1">Playing</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Keyboard shortcuts help */}
        {showShortcuts && (
          <div className="absolute inset-0 bg-surface/95 flex items-center justify-center z-50">
            <div className="bg-surface-elevated border border-border rounded-card p-4 shadow-elevated max-w-xs w-full mx-4">
              <div className="text-xs text-text-primary space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-text-secondary">Keyboard Shortcuts</p>
                  <button onClick={() => setShowShortcuts(false)} className="text-text-muted hover:text-text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">Space</kbd><span className="text-text-muted">Play/Pause</span></div>
                  <div className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">←</kbd><span className="text-text-muted">Back 10s</span></div>
                  <div className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">→</kbd><span className="text-text-muted">Forward 10s</span></div>
                  <div className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">↑</kbd><span className="text-text-muted">Forward 30s</span></div>
                  <div className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">↓</kbd><span className="text-text-muted">Back 30s</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimized player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border shadow-elevated">
        <div className="max-w-4xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          {/* Row 1: corners (song info left, actions right) */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <img
                src={song.thumbnail.small}
                alt={song.title}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-text-primary truncate">{song.title}</h4>
                <p className="hidden min-[380px]:block text-[11px] sm:text-xs text-text-muted truncate">{song.artists}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                onClick={toggleLikeSong}
                disabled={isLikeBusy}
                className={`p-1 sm:p-1.5 transition-all duration-200 ${isLiked ? 'text-purple-400 hover:text-purple-300' : 'text-text-muted hover:text-text-primary'}`}
                title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                key={`mini-${heartPopKey}`}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2"
                  className={`sm:w-[18px] sm:h-[18px] ${isLiked ? 'animate-heart-pop' : ''}`}
                >
                  <path d="M12 21s-7-4.35-9.33-8.11C.5 9.34 2.42 5 6.5 5c2.16 0 3.44 1.23 4.2 2.36C11.46 6.23 12.84 5 15 5c4.08 0 6 4.34 3.83 7.89C16.5 16.65 12 21 12 21z" />
                </svg>
              </button>
              <button
                onClick={cycleRepeat}
                className={`p-1 sm:p-1.5 transition-all duration-200 ${repeatMode !== 'off' ? 'text-primary hover:text-primary-hover' : 'text-text-muted hover:text-text-primary'}`}
                title={repeatMode === 'off' ? 'Repeat: Off' : repeatMode === 'track' ? 'Repeat: Current song' : 'Repeat: Queue'}
              >
                {repeatMode === 'track' ? (
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                  </svg>
                ) : (
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                )}
              </button>
              <ActionsDropdown side="top">
                <PlayerActionsMenu
                  song={song}
                  quality={quality}
                  onQualityChange={handleQualityChange}
                  onDownload={handleDownload}
                  onShowShortcuts={openShortcutsMinimized}
                  onClosePlayer={onClose}
                />
              </ActionsDropdown>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 sm:p-1 text-text-secondary hover:text-text-primary transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2: transport + progress */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button onClick={() => seek(-10)} className="p-2 sm:p-2.5 text-text-secondary hover:text-text-primary transition-colors" title="Back 10s">
              <svg width="20" height="20" className="sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
              title="Play/Pause (Space)"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button onClick={() => seek(10)} className="p-2 sm:p-2.5 text-text-secondary hover:text-text-primary transition-colors" title="Forward 10s">
              <svg width="20" height="20" className="sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 6v12l8.5-6L13 6zm-.5 6L4 6v12l8.5-6z" />
              </svg>
            </button>

            <div className="flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs text-text-muted font-mono w-8 sm:w-9 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-surface-elevated rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    sm:[&::-webkit-slider-thumb]:w-3.5
                    sm:[&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:duration-200
                    group-hover:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-text-muted font-mono w-8 sm:w-9">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        loop={repeatMode === 'track'}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (repeatMode === 'track') return; // handled by loop attribute
          if (repeatMode === 'queue') {
            if (hasNextInQueue) {
              onPlayNextInQueue();
            } else {
              // Queue repeat: loop back to first song
              const firstSong = queue[0];
              if (firstSong && firstSong.id !== song.id) {
                onPlayFromQueue(firstSong);
              } else {
                setIsPlaying(false);
              }
            }
          } else {
            if (hasNextInQueue) {
              onPlayNextInQueue();
            } else {
              setIsPlaying(false);
            }
          }
        }}
      />
    </>
  );
}