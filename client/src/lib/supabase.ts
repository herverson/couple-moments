import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload photo to Supabase Storage
 */
export async function uploadPhoto(
  coupleId: string,
  file: File
): Promise<{ path: string; url: string } | null> {
  const fileName = `${coupleId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("couple-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading photo:", error);
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("couple-photos")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  };
}

/**
 * Delete photo from Supabase Storage
 */
export async function deletePhotoFile(filePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from("couple-photos")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting photo:", error);
    return false;
  }

  return true;
}

/**
 * Get all photos for a couple
 */
export async function getPhotos(coupleId: string) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all YouTube videos for a couple
 */
export async function getYoutubeVideos(coupleId: string) {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching videos:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all romantic phrases
 */
export async function getRomanticPhrases() {
  const { data, error } = await supabase
    .from("romantic_phrases")
    .select("*");

  if (error) {
    console.error("Error fetching phrases:", error);
    return [];
  }

  return data || [];
}

/**
 * Get couple info
 */
export async function getCouple(coupleId: string) {
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("id", coupleId)
    .single();

  if (error) {
    console.error("Error fetching couple:", error);
    return null;
  }

  return data;
}
