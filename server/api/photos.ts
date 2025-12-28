import { Router, Request, Response } from "express";
import { supabase } from "../supabase";

interface AuthRequest extends Request {
  user?: { id: string };
}

const router = Router();

/**
 * Upload a photo to Supabase Storage
 * POST /api/photos/upload
 */
router.post("/upload", async (req: AuthRequest, res: Response) => {
  try {
    const { file, coupleId } = req.body;

    if (!file || !coupleId) {
      return res.status(400).json({ error: "Missing file or coupleId" });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file, "base64");
    const fileName = `${coupleId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("couple-photos")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("couple-photos")
      .getPublicUrl(data.path);

    // Save metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from("photos")
      .insert({
        couple_id: coupleId,
        uploaded_by_user_id: req.user?.id,
        s3_key: data.path,
        s3_url: publicUrlData.publicUrl,
      })
      .select();

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    res.json({ success: true, photo: photoData?.[0] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Upload failed" });
  }
});

/**
 * Delete a photo
 * DELETE /api/photos/:photoId
 */
router.delete("/:photoId", async (req: AuthRequest, res: Response) => {
  try {
    const { photoId } = req.params;

    // Get photo metadata
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Check authorization
    if (photo.uploaded_by_user_id !== req.user?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("couple-photos")
      .remove([photo.s3_key]);

    if (storageError) {
      return res.status(500).json({ error: storageError.message });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photoId);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Delete failed" });
  }
});

export default router;
