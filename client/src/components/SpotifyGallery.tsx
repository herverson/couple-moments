import { useState, useEffect, useCallback } from "react";
import { Music, Play, Pause, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SpotifyTrack {
  id: string;
  couple_id: string;
  spotify_url: string;
  title: string;
  artist: string;
  album_cover?: string;
  duration?: number;
  created_at: string;
}

interface SpotifyGalleryProps {
  coupleId: string;
  isAdmin?: boolean;
  onTrackAdded?: () => void;
  onTrackDeleted?: () => void;
  isLoading?: boolean;
}

export function SpotifyGallery({
  coupleId,
  isAdmin = false,
  onTrackAdded,
  onTrackDeleted,
  isLoading = false,
}: SpotifyGalleryProps) {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [spotifyIframeRef, setSpotifyIframeRef] = useState<HTMLIFrameElement | null>(null);

  // Fetch track from database
  const fetchTrack = useCallback(async () => {
    if (!coupleId) return;
    
    try {
      setLoading(true);
      const { supabase } = await import("@/lib/supabase");
      
      const { data, error } = await supabase
        .from("spotify_tracks")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setTrack(data || null);
    } catch (error) {
      console.error("[SpotifyGallery] Error fetching track:", error);
    } finally {
      setLoading(false);
    }
  }, [coupleId]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  // Extract Spotify track info from URL using oEmbed API
  const extractSpotifyInfo = async (url: string) => {
    // Extract track ID from URL
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error("URL do Spotify inválida");
    }

    const trackId = match[1];
    
    try {
      // Use Spotify oEmbed API to get track info
      const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar informações da música");
      }
      
      const data = await response.json();
      
      // Extract album cover - Spotify oEmbed provides thumbnail_url
      let albumCover = null;
      if (data.thumbnail_url) {
        // Spotify thumbnail is usually 640x640, we can use it directly
        // Sometimes it's in format: https://i.scdn.co/image/...
        albumCover = data.thumbnail_url;
        console.log("[SpotifyGallery] Album cover URL:", albumCover);
      }
      
      // Extract title and artist from title (format: "Song Name - Artist Name")
      const titleParts = data.title.split(' - ');
      const title = titleParts[0] || data.title;
      const artist = titleParts[1] || data.author || "Artista Desconhecido";
      
      console.log("[SpotifyGallery] Track info:", { title, artist, albumCover });
      
      return {
        title,
        artist,
        album_cover: albumCover,
        duration: null, // oEmbed doesn't provide duration
      };
    } catch (error) {
      console.error("[SpotifyGallery] Error fetching track info:", error);
      // Return null values if fetch fails
      throw new Error("Não foi possível buscar informações da música do Spotify");
    }
  };

  const handleAddTrack = useCallback(async () => {
    if (!spotifyUrl.trim()) return;

    try {
      setAdding(true);
      const { supabase } = await import("@/lib/supabase");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      // Extract track info
      const trackInfo = await extractSpotifyInfo(spotifyUrl);

      // Delete existing track first (only one track per couple)
      await supabase
        .from("spotify_tracks")
        .delete()
        .eq("couple_id", coupleId);

      // Insert new track
      const { data, error } = await supabase
        .from("spotify_tracks")
        .insert({
          couple_id: coupleId,
          spotify_url: spotifyUrl.trim(),
          title: trackInfo.title,
          artist: trackInfo.artist,
          album_cover: trackInfo.album_cover || null,
          duration: trackInfo.duration || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Música tema adicionada com sucesso!");
      setShowDialog(false);
      setSpotifyUrl("");
      setTrack(data);
      onTrackAdded?.();
    } catch (error) {
      console.error("[SpotifyGallery] Error adding track:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao adicionar música");
    } finally {
      setAdding(false);
    }
  }, [spotifyUrl, coupleId, onTrackAdded]);

  const handleDeleteTrack = useCallback(async (trackId: string) => {
    try {
      setDeleting(trackId);
      const { supabase } = await import("@/lib/supabase");
      
      const { error } = await supabase
        .from("spotify_tracks")
        .delete()
        .eq("id", trackId);

      if (error) throw error;

      toast.success("Música removida com sucesso!");
      setTrack(null);
      onTrackDeleted?.();
    } catch (error) {
      console.error("[SpotifyGallery] Error deleting track:", error);
      toast.error("Falha ao remover música");
    } finally {
      setDeleting(null);
    }
  }, [onTrackDeleted]);

  // Extract track ID for Spotify embed
  const getSpotifyTrackId = useCallback((url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (spotifyIframeRef) {
      // Try to control Spotify iframe (limited support)
      // Spotify embed doesn't fully support programmatic control
      // So we'll just toggle the visual state and let user click the iframe
      setIsPlaying((prev) => !prev);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [spotifyIframeRef]);

  // Use track from database, no default
  const displayTrack = track;

  // Simulate playback progress (since we can't control Spotify embed programmatically)
  useEffect(() => {
    if (!isPlaying || !track) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const maxTime = track.duration || 227;
        if (prev >= maxTime) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, track]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = displayTrack?.duration ? (currentTime / displayTrack.duration) * 100 : 0;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Don't show anything if no track
  if (!displayTrack) {
    return null;
  }

  const trackId = getSpotifyTrackId(displayTrack.spotify_url);

  // Don't show if no valid track ID
  if (!trackId) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Spotify Player Embed - Only one player */}
      <div className="rounded-2xl overflow-hidden shadow-lg bg-[#191414]">
        <iframe
          ref={(el) => setSpotifyIframeRef(el)}
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full"
          title="Spotify Player"
        />
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex items-center justify-end gap-2">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                {track ? "Alterar Música" : "Adicionar Música"}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {track ? "Alterar Música Tema" : "Adicionar Música Tema"} 🎵
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Link do Spotify
                  </label>
                  <Input
                    type="url"
                    placeholder="https://open.spotify.com/track/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Cole o link da música tema do Spotify
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setShowDialog(false);
                      setSpotifyUrl("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddTrack}
                    disabled={adding || !spotifyUrl.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {track ? "Alterando..." : "Adicionando..."}
                      </>
                    ) : (
                      track ? "Alterar Música" : "Adicionar Música"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {track && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTrack(track.id)}
              disabled={deleting === track.id}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {deleting === track.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

