import { useEffect, useRef, useState } from 'react';
// hls.js is a peer dep of react-player so it's already installed
// We import it dynamically to avoid SSR issues
declare const Hls: any;

interface HlsVideoPlayerProps {
  /** Full URL to the HLS manifest or the base content path.
   *  If the URL does NOT already end with index.m3u8 the player
   *  appends nothing — pass the exact playlist URL. */
  src: string;
  /** JWT access token injected into every XHR request header */
  token: string;
  /** Called when the video has played to the end */
  onEnded?: () => void;
  height?: string;
}

export default function HlsVideoPlayer({
  src,
  token,
  onEnded,
  height = '500px',
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activeToken = token || localStorage.getItem('accessToken') || '';
    if (!src || !activeToken) return;
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    // Destroy any previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadHls = () => {
      // @ts-ignore — hls.js loaded via CDN script tag in index.html
      if (typeof window.Hls === 'undefined') {
        setError(
          'HLS.js library is not loaded. Check index.html for the CDN script tag.',
        );
        return;
      }
      const HlsLib = (window as any).Hls;

      if (HlsLib.isSupported()) {
        const hls = new HlsLib({
          // Mirror exactly what hls-player.html does:
          // Inject Authorization header on every XHR (manifest + segments)
          xhrSetup: (xhr: XMLHttpRequest, _url: string) => {
            xhr.setRequestHeader('Authorization', `Bearer ${activeToken}`);
          },
          // Reasonable buffering / timeout settings for a secure stream
          maxBufferLength: 30,
          maxMaxBufferLength: 120,
          manifestLoadingTimeOut: 15000,
          levelLoadingTimeOut: 15000,
          fragLoadingTimeOut: 30000,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(HlsLib.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          // video.play().catch(() => {
          //   // Auto-play may be blocked — user can click play manually, that's fine
          // });
        });

        hls.on(HlsLib.Events.ERROR, (_event: string, data: any) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            const code = data.response?.status;
            if (code === 403) {
              setError(
                'Brak dostępu (403) — token wygasł lub nie masz uprawnień do tego kursu.',
              );
            } else if (code === 404) {
              setError(
                'Nie znaleziono strumienia (404) — wideo nie zostało jeszcze przetworzone.',
              );
            } else {
              setError(
                `Błąd streamingu: ${data.details ?? 'nieznany'} (${code ?? 'CORS/Network'})`,
              );
            }
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS — no xhrSetup available; stream directly
        video.src = src;
        video.load();
        setIsLoading(false);
      } else {
        setError('Twoja przeglądarka nie obsługuje HLS (adaptive streaming).');
        setIsLoading(false);
      }
    };

    // hls.js is injected as a <script> in index.html; give React a tick to finish
    // painting before we touch the DOM video element
    const timer = setTimeout(loadHls, 0);

    return () => {
      clearTimeout(timer);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, token]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
      {/* Loading overlay */}
      {isLoading && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: '#a78bfa',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 10,
          }}>
          {/* Spinning ring */}
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid rgba(168,85,247,0.2)',
              borderTop: '3px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Ładowanie strumienia wideo…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '0.75rem',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 10,
          }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p
            style={{
              color: '#fca5a5',
              textAlign: 'center',
              fontSize: '0.95rem',
              maxWidth: '380px',
            }}>
            {error}
          </p>
        </div>
      )}

      {/* The actual HTML5 video element */}
      <video
        ref={videoRef}
        controls
        onEnded={onEnded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
