import React, { useId, useState, useEffect, useRef, useCallback } from "react";

interface VideoPresenterProps {
  src: string;
  className?: string;
  autoPlay?: boolean; // (opcional) mantido, mas default = true
}

/** Extrai ID do Vimeo com segurança */
function getVimeoId(input: string | undefined): string {
  if (!input) return "";
  const m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m?.[1]) return m[1];
  if (/^\d+$/.test(input)) return input;
  return "";
}

/** Storage seguro (sessionStorage -> fallback memória) */
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
      // ignore
    }
    memoryStorage[key] = value;
  },
};

const VideoPresenter: React.FC<VideoPresenterProps> = ({ src, className, autoPlay = true }) => {
  const filterId = useId().replace(/:/g, "");
  const SESSION_KEY = "lfnm_presenter_intro_played_v5";

  const [isScanning, setIsScanning] = useState(false);
  const [isTransparent] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // refs
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isAnimatingRef = useRef(false);
  const pendingPlayRef = useRef(false);

  const vimeoId = getVimeoId(src);
  const isVimeo = !!vimeoId;
  const isYoutube = !!src && (src.includes("youtube.com") || src.includes("youtu.be"));

  // ✅ Vimeo embed: autoplay + muted + playsinline + sem loop
  const embedUrl = isVimeo
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&playsinline=1&background=1&loop=0&autopause=1&transparent=1`
    : "";

  /** Tenta executar play/replay com tentativas (para esperar SDK/ready) */
  const runPlayWithRetry = useCallback(
    async (resetToStart: boolean) => {
      const maxTries = 16;
      const waitMs = 250;

      for (let i = 0; i < maxTries; i++) {
        // Vimeo
        if (isVimeo && playerRef.current) {
          try {
            if (resetToStart) {
              await playerRef.current.pause().catch(() => {});
              await playerRef.current.setCurrentTime(0).catch(() => {});
            }
            await playerRef.current.play().catch(() => {});
            return true;
          } catch {
            // continua tentando
          }
        }

        // HTML5 video
        if (!isVimeo && videoRef.current) {
          try {
            if (resetToStart) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
            await videoRef.current.play();
            return true;
          } catch {
            // continua tentando
          }
        }

        await new Promise((r) => setTimeout(r, waitMs));
      }

      return false;
    },
    [isVimeo]
  );

  /** Dispara a “animação” + play 1x (sem mouse) */
  const triggerAnimation = useCallback(
    async (isInitial = false) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      setIsScanning(false);

      // Pequeno delay para efeito visual (mantive sua lógica)
      setTimeout(async () => {
        setIsScanning(true);

        // play/replay com retry (garante que roda mesmo se o player demorar)
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

  // ====== Init Vimeo Player (API) ======
  useEffect(() => {
    if (!isVimeo || !embedUrl) return;

    let disposed = false;

    // fallback: se SDK demorar, ainda mostramos o vídeo (sem ficar invisível)
    const safetyTimer = setTimeout(() => setIsVideoReady(true), 2500);

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
          setIsVideoReady(true);

          // tenta autoplay imediato quando carregar
          if (autoPlay) {
            await player.play().catch(() => {});
          }

          // se já tinha um play pendente, dispara agora
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            triggerAnimation(false);
          }
        });

        player.on("play", () => {
          setTimeout(() => setIsVideoReady(true), 200);
        });

        player.on("ended", async () => {
          try {
            await player.pause();
          } catch {}
        });
      } catch (e) {
        console.warn("Vimeo Player SDK failed to load:", e);
        setIsVideoReady(true);
      }
    })();

    return () => {
      disposed = true;
      clearTimeout(safetyTimer);
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [embedUrl, isVimeo, autoPlay, triggerAnimation]);

  // ====== Autoplay ao carregar + Replay a cada 60s ======
  useEffect(() => {
    if (!src) return;

    const hasPlayed = safeStorage.getItem(SESSION_KEY);

    const start = async () => {
      // Se for Vimeo e ainda não carregou o SDK/player, marca pendente
      if (isVimeo && !playerRef.current) {
        pendingPlayRef.current = true;
        return;
      }

      // Primeira vez na sessão: toca ao carregar
      if (!hasPlayed && autoPlay) {
        await triggerAnimation(true);
      } else if (autoPlay) {
        // mesmo já tendo tocado, garante pelo menos 1 play inicial (sem reset agressivo)
        await runPlayWithRetry(false);
      }
    };

    start();

    const intervalId = window.setInterval(() => {
      // replay a cada 60s
      triggerAnimation(false);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [src, isVimeo, autoPlay, triggerAnimation, runPlayWithRetry]);

  if (!src) return null;

  // Chroma matrix - Verde/Chroma Key
  const matrixChroma = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.6 -3.2 1.6 1.0 0";

  return (
    <div
      className={`relative transition-opacity duration-1000 bg-transparent ${
        isVideoReady ? "opacity-100" : "opacity-0"
      } ${className || ""}`}
      // ✅ REMOVIDO: nenhuma interação com mouse
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
          // CORTE DE 30% NA PARTE INFERIOR
          clipPath: "inset(0 0 30% 0)",
        }}
      >
        {isVimeo ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            style={{ backgroundColor: "transparent" }}
            allow="autoplay; fullscreen; picture-in-picture"
            title="Presenter"
          />
        ) : isYoutube ? (
          <iframe
            src={`https://www.youtube.com/embed/${
              src.includes("v=") ? src.split("v=")[1]?.split("&")[0] : src.split("/").pop()
            }?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&loop=0`}
            className="w-full h-full border-0 pointer-events-none bg-transparent"
            style={{ backgroundColor: "transparent" }}
            onLoad={() => setIsVideoReady(true)}
            allow="autoplay; fullscreen"
            title="Presenter"
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setIsVideoReady(true)}
            className="w-full h-full object-contain bg-transparent pointer-events-none"
            loop={false}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPresenter;
