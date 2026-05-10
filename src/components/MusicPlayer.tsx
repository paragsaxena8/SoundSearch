"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import type { Song } from "@/lib/gaana";
import type { Quality } from "@/lib/config";
import { QUALITY_TO_MUSIC_KEY } from "@/lib/config";
import { usePlaylist } from "@/lib/playlist";
import { useToast } from "@/lib/toast";
import { safeWindowOpen } from "@/lib/utils";
import { ActionsDropdown, MenuItem, MenuDivider, SubMenu } from "./ActionsDropdown";
import { AddToPlaylistDropdown } from "./AddToPlaylistDropdown";

interface MusicPlayerProps {
  song: Song;
  queue: Song[];
  quality: Quality;
  onClose: () => void;
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
  onDownload: () => void;
  onClosePlayer: () => void;
}

const PlayerActionsMenu = memo(function PlayerActionsMenu({
  song,
  onDownload,
  onClosePlayer,
}: PlayerActionsMenuProps) {
  return (
    <>
      <SubMenu
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
        label="Add to playlist"
      >
        <AddToPlaylistDropdown song={song} />
      </SubMenu>

      <MenuDivider />
      <MenuItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>}
        label="Download"
        onClick={onDownload}
      />
      <MenuDivider />
      <MenuItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
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
    let isCancelled = false;
    const loadHls = async () => {
      if (!streamUrl) return;

      const Hls = (await import("hls.js")).default;
      if (isCancelled) return;

      if (Hls.isSupported() && audioRef.current) {
        const hls = new Hls({
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          maxBufferSize: 5 * 1024 * 1024,
          backBufferLength: 10,
          maxBufferHole: 0.5,
          lowLatencyMode: false,
          startLevel: -1,
          progressive: true,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 4,
          fragLoadingMaxRetryTimeout: 32000,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 4,
          manifestLoadingMaxRetryTimeout: 32000,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 4,
          levelLoadingMaxRetryTimeout: 32000,
          abrEwmaDefaultEstimate: 300000,
          abrEwmaFastVoD: 0.9,
          abrEwmaSlowVoD: 0.7,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isCancelled) return;
          setIsLoading(false);
          if (autoPlay && !hasAutoPlayed.current && audioRef.current) {
            hasAutoPlayed.current = true;
            audioRef.current.play().catch(() => setIsPlaying(false));
          }
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (isCancelled) return;
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Fatal network error, retrying:", data.details);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error, recovering:", data.details);
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal HLS error:", data);
                hls.destroy();
                setIsLoading(false);
                setIsPlaying(false);
                break;
            }
          } else if (data.details === "bufferStalledError") {
            // Non-fatal stall — HLS.js will auto-resume when buffer refills
          } else {
            console.error("HLS error:", data.details);
          }
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
      isCancelled = true;
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seek, seekTo]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = useCallback(() => {
    if (!streamUrl) return;
    safeWindowOpen(streamUrl);
    showToast("Download started", "Opened stream URL in a new tab");
  }, [streamUrl, showToast]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'track' : prev === 'track' ? 'queue' : 'off';
      const labels = { off: 'Repeat off', track: 'Repeat: Current song', queue: 'Repeat: Queue' };
      showToast(labels[next]);
      return next;
    });
  }, [showToast]);

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
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-border p-4 shadow-brutal">
        <div className="max-w-4xl mx-auto text-center font-bold text-text-secondary uppercase tracking-wide">
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
        className={`fixed inset-x-0 bottom-0 bg-surface border-t-2 border-border shadow-brutal-lg z-50 transform transition-transform duration-300 ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "80vh" }}
      >
        <div className="flex justify-center pt-4">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        <div className="h-full flex flex-row max-w-5xl mx-auto px-6 py-4 gap-6">
          {/* Left: Player controls */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Actions */}
            <div className="flex items-center justify-end mb-4">
              <div className="flex items-center gap-1">
                <ActionsDropdown side="bottom">
                  <PlayerActionsMenu
                    song={song}
                    onDownload={handleDownload}
                    onClosePlayer={onClose}
                  />
                </ActionsDropdown>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  title="Collapse"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Album art */}
            <div className="flex justify-center mb-6">
              <img
                src={song.thumbnail.large}
                alt={song.title}
                className="w-64 h-64 border-2 border-border object-cover shadow-brutal"
              />
            </div>

            {/* Song info */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-text-primary truncate mb-1">{song.title}</h3>
              <p className="text-sm text-text-secondary truncate">{song.artists}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-text-muted font-mono font-bold w-10">{formatTime(currentTime)}</span>
                <div className="flex-1 relative group">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Seek audio position"
                    className="w-full h-2 bg-surface-elevated appearance-none cursor-pointer border border-border
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-border
                      [&::-webkit-slider-thumb]:rounded-none
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:duration-200
                      group-hover:[&::-webkit-slider-thumb]:scale-125"
                  />
                </div>
                <span className="text-xs text-text-muted font-mono font-bold w-10 text-right">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div className="flex items-center gap-2">
              {/* Left side: prev-in-queue, back-10s, favorite, repeat */}
              <div className="flex items-center gap-1 flex-1 justify-end">
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
                <button onClick={() => seek(-10)} className="p-2 text-text-secondary hover:text-text-primary transition-colors" title="Back 10s">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>
                <button
                  onClick={toggleLikeSong}
                  disabled={isLikeBusy}
                  className={`p-2 transition-all duration-200 ${isLiked ? 'text-pink-500 hover:text-pink-400' : 'text-text-muted hover:text-text-primary'}`}
                  title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                  key={heartPopKey}
                >
                  <svg
                    width="20" height="20" viewBox="0 0 24 24"
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Center: play/pause */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-14 h-14 border-2 border-border bg-primary flex items-center justify-center transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                title="Play/Pause (Space)"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-border/30 border-t-border rounded-full animate-spin" />
                ) : isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Right side: forward-10s, next-in-queue */}
              <div className="flex items-center gap-1 flex-1 justify-start">
                <button onClick={() => seek(10)} className="p-2 text-text-secondary hover:text-text-primary transition-colors" title="Forward 10s">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 6v12l8.5-6L13 6zm-.5 6L4 6v12l8.5-6z" />
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
            </div>
          </div>

          {/* Right: Queue panel */}
          <div className="w-72 shrink-0 flex flex-col border-l-2 border-border pl-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">Queue</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono font-bold">{queue.length} songs</span>
                {queue.length > 0 && (
                  <button
                    onClick={onClearQueue}
                    className="text-xs font-bold text-error hover:text-error/80 uppercase tracking-wide"
                    title="Clear queue (keeps current song)"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-0">
              {queue.length === 0 ? (
                <div className="text-center text-text-muted text-sm font-bold uppercase py-8">No songs in queue</div>
              ) : (
                queue.map((queuedSong) => {
                  const isCurrent = queuedSong.id === song.id
                  return (
                    <div
                      key={queuedSong.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onPlayFromQueue(queuedSong)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPlayFromQueue(queuedSong) }}
                      className={`w-full text-left flex items-center gap-2.5 p-2 border-2 transition-all duration-100 cursor-pointer ${
                        isCurrent
                          ? "border-primary bg-primary/15 shadow-brutal-sm"
                          : "border-border bg-surface hover:border-primary hover:shadow-brutal-sm"
                      }`}
                    >
                      {isCurrent && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                          <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                          <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                        </div>
                      )}
                      <img
                        src={queuedSong.thumbnail.small}
                        alt={queuedSong.title}
                        className={`w-8 h-8 border object-cover flex-shrink-0 ${isCurrent ? 'border-primary' : 'border-border'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate font-bold ${isCurrent ? "text-primary" : "text-text-primary"}`}>
                          {queuedSong.title}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate">{queuedSong.artists}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveQueueItem(queuedSong.id, "up")
                          }}
                          className="p-1 text-text-muted hover:text-text-primary transition-colors"
                          title="Move up"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        {/* Keyboard shortcuts help */}
      </div>

      {/* Minimized player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-border shadow-brutal">
        <div className="max-w-4xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          {/* Row 1: corners (song info left, actions right) */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <img
                src={song.thumbnail.small}
                alt={song.title}
                className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-border object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">{song.title}</h4>
                <p className="hidden min-[380px]:block text-[11px] sm:text-xs text-text-muted truncate">{song.artists}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                onClick={toggleLikeSong}
                disabled={isLikeBusy}
                className={`p-1 sm:p-1.5 transition-all duration-200 ${isLiked ? 'text-pink-500 hover:text-pink-400' : 'text-text-muted hover:text-text-primary'}`}
                title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                key={`mini-${heartPopKey}`}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2.5"
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
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                  </svg>
                ) : (
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  onDownload={handleDownload}
                  onClosePlayer={onClose}
                />
              </ActionsDropdown>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 sm:p-1 text-text-secondary hover:text-text-primary transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-border bg-primary flex items-center justify-center transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              title="Play/Pause (Space)"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-2 border-border/30 border-t-border rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="#1A1A1A">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="#1A1A1A">
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
              <span className="text-[10px] sm:text-xs text-text-muted font-mono font-bold w-8 sm:w-9 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek audio position"
                  className="w-full h-1.5 bg-surface-elevated appearance-none cursor-pointer border border-border
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    sm:[&::-webkit-slider-thumb]:w-3.5
                    sm:[&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-border
                    [&::-webkit-slider-thumb]:rounded-none
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:duration-200
                    group-hover:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-text-muted font-mono font-bold w-8 sm:w-9">{formatTime(duration)}</span>
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