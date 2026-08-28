import { useEffect, useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Music, 
  Radio, 
  LogIn, 
  Volume2,
  RefreshCw
} from 'lucide-react';

function SpotifyWidget() {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const pollTimerRef = useRef(null);

  const fetchCurrentTrack = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/spotify/current-track`);
      
      if (res.status === 401) {
        setTrack({ error: "not_authenticated" });
        setIsPlaying(false);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (data && data.name) {
        setTrack(data);
        setIsPlaying(true);
      } else {
        setTrack(null);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Error Fetching Track:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayback = async (action) => {
    setActionLoading(true);
    const method = action === 'play' || action === 'pause' ? 'PUT' : 'POST';

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/spotify/${action}`, {
        method: method,
      });
      
      if (action === 'play') setIsPlaying(true);
      if (action === 'pause') setIsPlaying(false);

      // Delay slightly for Spotify server state to sync
      setTimeout(() => {
        fetchCurrentTrack();
        setActionLoading(false);
      }, 600);
    } catch (error) {
      console.error(`Network Error on ${action}:`, error);
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTrack();

    // Periodic check every 12 seconds to keep track in sync
    pollTimerRef.current = setInterval(() => {
      fetchCurrentTrack();
    }, 12000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  return (
    <div className="spotify-deck-container">
      {/* Header with Live Status */}
      <div className="spotify-header-badge">
        <div className="card-title-group">
          <Music size={18} color="var(--color-spotify)" />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Spotify Focus</span>
        </div>

        {track?.name ? (
          <div className="spotify-status-tag">
            <span className="live-dot" style={{ background: "var(--color-spotify)", boxShadow: "0 0 6px var(--color-spotify)" }}></span>
            <span>Now Playing</span>
          </div>
        ) : track?.error === "not_authenticated" ? (
          <div className="spotify-status-tag disconnected">
            <span>Auth Required</span>
          </div>
        ) : (
          <div className="spotify-status-tag disconnected">
            <span>Idle</span>
          </div>
        )}
      </div>

      {/* Main Track Display */}
      {loading ? (
        <div className="spotify-login-box">
          <RefreshCw size={24} className="spin-icon" color="var(--text-muted)" />
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Syncing Spotify player...</span>
        </div>
      ) : track?.error === "not_authenticated" ? (
        <div className="spotify-login-box">
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Connect your Spotify account to control study music directly from your dashboard.
          </p>
          <a
            href={`${import.meta.env.VITE_API_URL}/login`}
            className="btn-spotify"
          >
            <LogIn size={16} /> Connect Spotify
          </a>
        </div>
      ) : track?.name ? (
        <>
          <div className="spotify-media-card">
            <div className="album-art-wrap">
              {track.albumArt ? (
                <img src={track.albumArt} alt={track.name} className="album-art-img" />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--bg-input)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Music size={28} color="var(--text-muted)" />
                </div>
              )}
            </div>

            <div className="track-meta">
              <div className="track-title" title={track.name}>
                {track.name}
              </div>
              <div className="track-artist" title={track.artist}>
                {track.artist}
              </div>

              {/* Animated Waveform Bars */}
              <div className="waveform-bars">
                <span className="waveform-bar" style={{ animationPlayState: isPlaying ? "running" : "paused" }}></span>
                <span className="waveform-bar" style={{ animationPlayState: isPlaying ? "running" : "paused" }}></span>
                <span className="waveform-bar" style={{ animationPlayState: isPlaying ? "running" : "paused" }}></span>
                <span className="waveform-bar" style={{ animationPlayState: isPlaying ? "running" : "paused" }}></span>
              </div>
            </div>
          </div>

          {/* Media Playback Controls */}
          <div className="playback-controls-bar">
            <button
              className="control-btn"
              onClick={() => handlePlayback("previous")}
              title="Previous Track"
              disabled={actionLoading}
            >
              <SkipBack size={16} />
            </button>

            {isPlaying ? (
              <button
                className="control-btn play-pause-btn"
                onClick={() => handlePlayback("pause")}
                title="Pause"
                disabled={actionLoading}
              >
                <Pause size={20} />
              </button>
            ) : (
              <button
                className="control-btn play-pause-btn"
                onClick={() => handlePlayback("play")}
                title="Play"
                disabled={actionLoading}
              >
                <Play size={20} style={{ marginLeft: "2px" }} />
              </button>
            )}

            <button
              className="control-btn"
              onClick={() => handlePlayback("next")}
              title="Next Track"
              disabled={actionLoading}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="spotify-login-box">
          <Radio size={28} color="var(--text-muted)" />
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            No active playback on Spotify.
          </p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Start playing a playlist on any device to control it here.
          </span>
          <button
            className="btn-secondary"
            onClick={fetchCurrentTrack}
            style={{ marginTop: "6px" }}
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
        </div>
      )}
    </div>
  );
}

export default SpotifyWidget;