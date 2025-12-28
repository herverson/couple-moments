import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Couple Management
 */
export async function createCouple(
  user1Id: string,
  user2Id: string,
  relationshipStartDate: Date,
  coupleName?: string
) {
  const { data, error } = await supabase
    .from("couples")
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      relationship_start_date: relationshipStartDate.toISOString(),
      couple_name: coupleName,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function getCoupleByUserId(userId: string) {
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function getCoupleById(coupleId: string) {
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("id", coupleId)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function updateCoupleName(coupleId: string, coupleName: string) {
  const { data, error } = await supabase
    .from("couples")
    .update({ couple_name: coupleName })
    .eq("id", coupleId)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Photo Management
 */
export async function addPhoto(
  coupleId: string,
  uploadedByUserId: string,
  s3Key: string,
  s3Url: string,
  description?: string
) {
  const { data, error } = await supabase
    .from("photos")
    .insert({
      couple_id: coupleId,
      uploaded_by_user_id: uploadedByUserId,
      s3_key: s3Key,
      s3_url: s3Url,
      description,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function getPhotosByCoupleId(coupleId: string) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deletePhoto(photoId: string) {
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (error) throw error;
}

/**
 * YouTube Video Management
 */
export async function addYoutubeVideo(
  coupleId: string,
  addedByUserId: string,
  videoId: string,
  title?: string,
  description?: string,
  thumbnail?: string
) {
  const { data, error } = await supabase
    .from("youtube_videos")
    .insert({
      couple_id: coupleId,
      added_by_user_id: addedByUserId,
      video_id: videoId,
      title,
      description,
      thumbnail,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function getYoutubeVideosByCoupleId(coupleId: string) {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("added_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteYoutubeVideo(videoId: string) {
  const { error } = await supabase
    .from("youtube_videos")
    .delete()
    .eq("id", videoId);

  if (error) throw error;
}

/**
 * Romantic Phrases Management
 */
export async function getRomanticPhrasesByCategory(category: string) {
  const { data, error } = await supabase
    .from("romantic_phrases")
    .select("*")
    .eq("category", category);

  if (error) throw error;
  return data || [];
}

export async function getAllRomanticPhrases() {
  const { data, error } = await supabase
    .from("romantic_phrases")
    .select("*");

  if (error) throw error;
  return data || [];
}

export async function getRandomRomanticPhrase() {
  const { data, error } = await supabase
    .from("romantic_phrases")
    .select("*")
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

export async function seedRomanticPhrases() {
  const phrases = [
    { phrase: "You are my greatest adventure.", category: "Love", author: "Unknown" },
    { phrase: "In your eyes, I found my home.", category: "Love", author: "Unknown" },
    { phrase: "Every moment with you is a gift.", category: "Appreciation", author: "Unknown" },
    { phrase: "You make my heart skip a beat.", category: "Romance", author: "Unknown" },
    { phrase: "I love you more than words can say.", category: "Love", author: "Unknown" },
    { phrase: "You are my favorite hello and my hardest goodbye.", category: "Love", author: "Unknown" },
    { phrase: "With you, I found my soulmate.", category: "Love", author: "Unknown" },
    { phrase: "You are the best decision I ever made.", category: "Appreciation", author: "Unknown" },
    { phrase: "Forever is not long enough with you.", category: "Romance", author: "Unknown" },
    { phrase: "You complete me.", category: "Love", author: "Jerry Maguire" },
    { phrase: "I would find you in any lifetime.", category: "Romance", author: "Unknown" },
    { phrase: "You are my today and all of my tomorrows.", category: "Love", author: "Leo Christopher" },
    { phrase: "My heart knew you before my mind did.", category: "Love", author: "Unknown" },
    { phrase: "You are my favorite notification.", category: "Appreciation", author: "Unknown" },
    { phrase: "I fall in love with you every single day.", category: "Romance", author: "Unknown" },
  ];

  for (const phrase of phrases) {
    const { error } = await supabase
      .from("romantic_phrases")
      .insert(phrase)
      .select();

    if (error && error.code !== "23505") {
      // 23505 is unique violation, which is fine for seeding
      console.error("Error seeding phrase:", error);
    }
  }
}
