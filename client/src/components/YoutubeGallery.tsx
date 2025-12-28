import { useState, memo, useCallback } from "react";
import { Music, Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Video {
  id: string;
  video_id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  added_at: string;
}

interface YoutubeGalleryProps {
  videos: Video[];
  coupleId: string;
  onVideoAdded?: () => void;
  onVideoDeleted?: () => void;
  isLoading?: boolean;
}

export const YoutubeGallery = memo(function YoutubeGallery({
  videos,
  coupleId,
  onVideoAdded,
  onVideoDeleted,
  isLoading = false,
}: YoutubeGalleryProps) {
  const [showInput, setShowInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const extractVideoId = useCallback((url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }, []);

  const handleAddVideo = useCallback(async () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL or Video ID");
      return;
    }

    try {
      setAdding(true);
      
      const { supabase } = await import("@/lib/supabase");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add videos");
        return;
      }

      console.log("[DEBUG] Adding video:", videoId, "to couple:", coupleId);

      // Save to database
      const { data, error} = await supabase
        .from('youtube_videos')
        .insert({
          couple_id: coupleId,
          video_id: videoId,
          added_by_user_id: user.id, // IMPORTANTE: user que adicionou
          title: videoTitle.trim() || null,
          description: videoTitle.trim() || null,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        })
        .select();

      if (error) {
        console.error("[DEBUG] Database error:", error);
        throw error;
      }

      console.log("[DEBUG] Video saved:", data);

      toast.success("Video added successfully!");
      setYoutubeUrl("");
      setVideoTitle("");
      setShowInput(false);
      onVideoAdded?.();
    } catch (error) {
      console.error("[DEBUG] Add video error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add video");
    } finally {
      setAdding(false);
    }
  }, [coupleId, extractVideoId, onVideoAdded, youtubeUrl, videoTitle]);

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    try {
      setDeleting(videoId);
      
      const { supabase } = await import("@/lib/supabase");
      
      // Delete from database
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error("[DEBUG] Delete video error:", error);
        throw error;
      }

      toast.success("Video deleted successfully!");
      onVideoDeleted?.();
    } catch (error) {
      console.error("[DEBUG] Delete video error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    } finally {
      setDeleting(null);
    }
  }, [onVideoDeleted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Music className="text-rose-500 mr-2" size={24} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Our Playlist
          </h3>
        </div>
        <Button
          onClick={() => setShowInput(!showInput)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </div>

      {showInput && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-700 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              YouTube URL or Video ID *
            </label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !videoTitle && handleAddVideo()}
              className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-600 focus:border-rose-500 dark:focus:border-rose-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Title / Description
            </label>
            <Input
              placeholder="Ex: Our favorite song 🎵"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
              maxLength={200}
              className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-600 focus:border-rose-500 dark:focus:border-rose-400"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Add a special title to this memory
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setShowInput(false);
                setYoutubeUrl("");
                setVideoTitle("");
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVideo}
              disabled={adding || !youtubeUrl}
              className="flex-1 bg-rose-500 hover:bg-rose-600"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Video"
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
          <p className="text-gray-600 dark:text-gray-400">
            No videos yet. Add your favorite songs or memories!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
            >
              {/* Video Player */}
              <div className="relative w-full pt-[56.25%] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.video_id}`}
                  title={video.title || "YouTube video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              
              {/* Video Info */}
              <div className="p-4 space-y-2">
                {video.description && (
                  <p className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.description}
                  </p>
                )}
                {!video.description && video.title && video.title !== `YouTube Video ${video.video_id}` && (
                  <p className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(video.added_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVideo(video.id)}
                    disabled={deleting === video.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {deleting === video.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
