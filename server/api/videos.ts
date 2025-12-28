import { Router, Request, Response } from "express";
import { supabase } from "../supabase";

interface AuthRequest extends Request {
  user?: { id: string };
}

const router = Router();

/**
 * Extract YouTube video metadata
 */
async function getYoutubeMetadata(videoId: string) {
  try {
    // For now, return basic metadata
    // In production, you'd use YouTube API
    return {
      videoId,
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch {
    return null;
  }
}

/**
 * Add a YouTube video
 * POST /api/videos/add
 */
router.post("/add", async (req: AuthRequest, res: Response) => {
  try {
    const { coupleId, videoId } = req.body;

    if (!coupleId || !videoId) {
      return res.status(400).json({ error: "Missing coupleId or videoId" });
    }

    // Get video metadata
    const metadata = await getYoutubeMetadata(videoId);

    // Save to database
    const { data, error } = await supabase
      .from("youtube_videos")
      .insert({
        couple_id: coupleId,
        added_by_user_id: req.user?.id || "anonymous",
        video_id: videoId,
        title: metadata?.title,
        thumbnail: metadata?.thumbnail,
      })
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, video: data?.[0] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to add video" });
  }
});

/**
 * Delete a YouTube video
 * DELETE /api/videos/:videoId
 */
router.delete("/:videoId", async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;

    // Get video metadata
    const { data: video, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check authorization
    if (video.added_by_user_id !== req.user?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("youtube_videos")
      .delete()
      .eq("id", videoId);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Delete failed" });
  }
});

export default router;
