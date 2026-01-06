
import React, { useId, useState, useEffect, useRef, useCallback } from "react";

interface VideoPresenterProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
}

function getVimeoId(input: string | undefined): string {
  if (!input) return "";
  const m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m?.[1]) return m[1];
  if (/^\d+$/.test(input)) return input;
  return "";
}

const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        return sessionStorage.getItem(key);
      }
    } catch {
      return memoryStorage[key] || null;
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem(key, value);
      }
    } catch {
    }
    memoryStorage[key] = value;
  },
};

const VideoPresenter: React.FC<VideoPresenterProps> = ({ src, className, autoPlay = true }) => {
  const filterId = useId().replace(/:/g, "");
  const SESSION_KEY = "lfnm_presenter_intro_played_v5";

  const [isScanning, setIsScanning] = useState(false);
  const [isTransparent] = useState(true);
  // Initial state strictly false to prevent white flash
  const [isVideoReady, setIsVideoReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isAnimatingRef = useRef(false);
  const pendingPlayRef = useRef(false);

  const vimeoId = getVimeoId(src);
  const isVimeo = !!vimeoId;
  const isYoutube = !!src && (src.includes("youtube.com") || src.includes("youtu.be"));

  const embedUrl = isVimeo
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&playsinline=1&background=1&loop=0&autopause=1&transparent=1`
    : "";

  const runPlayWithRetry = useCallback(
    async (resetToStart: boolean) => {
      const maxTries = 16;
      const waitMs = 250;

      for (let i = 0; i < maxTries; i++) {
        if (isVimeo && playerRef.current) {
          try {
            if (resetToStart) {
              await playerRef.current.pause().catch(() => {});
              await playerRef.current.setCurrentTime(0).catch(() => {});
            }
            await playerRef.current.play().catch(() => {});
            return true;
          } catch {
          }
        }

        if (!isVimeo && videoRef.current) {
          try {
            if (resetToStart) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
            await videoRef.current.play();
            return true;
          } catch {
          }
        }

        await new Promise((r) => setTimeout(r, waitMs));
      }

      return false;
    },
    [isVimeo]
  );

  const triggerAnimation = useCallback(
    async (isInitial = false) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      setIsScanning(false);

      setTimeout(async () => {
        setIsScanning(true);
        await runPlayWithRetry(true);

        setTimeout(() => {
          setIsScanning(false);
          isAnimatingRef.current = false;

          if (isInitial) safeStorage.setItem(SESSION_KEY, "true");
        }, 900);
      }, 300);
    },
    [runPlayWithRetry]
  );

  // Vimeo Integration
  useEffect(() => {
    if (!isVimeo || !embedUrl) return;

    let disposed = false;
    // Removed the aggressive safetyTimer that was forcing visibility too early.
    // We rely on the player events now.

    (async () => {
      try {
        const mod = await import("@vimeo/player");
        const Player = (mod as any).default || mod;

        if (disposed || !iframeRef.current) return;

        const player = new Player(iframeRef.current);
        playerRef.current = player;

        await player.setMuted(true).catch(() => {});
        await player.setLoop(false).catch(() => {});

        player.on("loaded", async () => {
          // Do NOT set isVideoReady here to avoid white flash.
          // Just trigger the play logic.
          if (autoPlay) {
            await player.play().catch(() => {});
          }
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            triggerAnimation(false);
          }
        });

        // Trigger visibility only when playback actually begins
        player.on("play", () => {
          setTimeout(() => {
             if (!disposed) setIsVideoReady(true);
          }, 150); // Small buffer to ensure first frame is rendered
        });
        
        // Backup: sometimes 'play' doesn't fire correctly on some devices, 'timeupdate' is reliable
        player.on("timeupdate", (data: any) => {
            if (data.seconds > 0 && !disposed) {
                setIsVideoReady(true);
            }
        });

        player.on("ended", async () => {
          try {
            await player.pause();
          } catch {}
        });
      } catch (e) {
        console.warn("Vimeo Player SDK failed to load:", e);
        // Only force show if SDK fails completely
        setIsVideoReady(true);
      }
    })();

    return () => {
      disposed = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [embedUrl, isVimeo, autoPlay, triggerAnimation]);

  // General Logic
  useEffect(() => {
    if (!src) return;

    const hasPlayed = safeStorage.getItem(SESSION_KEY);

    const start = async () => {
      if (isVimeo && !playerRef.current) {
        pendingPlayRef.current = true;
        return;
      }

      if (!hasPlayed && autoPlay) {
        await triggerAnimation(true);
      } else if (autoPlay) {
        await runPlayWithRetry(false);
      }
    };

    start();

    const intervalId = window.setInterval(() => {
      triggerAnimation(false);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [src, isVimeo, autoPlay, triggerAnimation, runPlayWithRetry]);

  if (!src) return null;

  const matrixChroma = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.6 -3.2 1.6 1.0 0";

  return (
    <div
      className={`relative transition-opacity duration-1000 ease-out bg-transparent ${
        isVideoReady ? "opacity-100" : "opacity-0"
      } ${className || ""}`}
    >
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            className="transition-all duration-300"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          />

          {isTransparent && (
            <>
              <feColorMatrix type="matrix" values={matrixChroma} result="alphaMask" />
              <feGaussianBlur in="alphaMask" stdDeviation="0.4" result="blurredAlpha" />
              <feComposite in="SourceGraphic" in2="blurredAlpha" operator="in" />
            </>
          )}

          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0 0 0.8 1" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div
        className="w-full h-full transition-all duration-700 bg-transparent"
        style={{
          filter: `url(#${filterId})`,
          WebkitFilter: `url(#${filterId})`,
          transform: isScanning ? "scale(1.03)" : "scale(1)",
          // RESTAURADO: Corte inferior para ajuste estético
          clipPath: "inset(0 0 20% 0)",
        }}
      >
        {isVimeo ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            style={{ backgroundColor: "transparent", colorScheme: "dark" }}
            allow="autoplay; fullscreen; picture-in-picture"
            title="Presenter"
            loading="lazy"
          />
        ) : isYoutube ? (
          <iframe
            src={`https://www.youtube.com/embed/${
              src.includes("v=") ? src.split("v=")[1]?.split("&")[0] : src.split("/").pop()
            }?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&loop=0`}
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            style={{ backgroundColor: "transparent" }}
            onLoad={() => {
                setTimeout(() => setIsVideoReady(true), 500);
            }}
            allow="autoplay; fullscreen"
            title="Presenter"
            loading="lazy"
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            onPlaying={() => setIsVideoReady(true)} 
            onCanPlay={() => {
               if(autoPlay) videoRef.current?.play().catch(()=>{});
            }}
            className="w-full h-full object-contain bg-transparent pointer-events-none"
            loop={false}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPresenter;