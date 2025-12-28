import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, couples, photos, youtubeVideos, romanticPhrases } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Couple Management
 */
export async function createCouple(
  user1Id: number,
  user2Id: number,
  relationshipStartDate: Date,
  coupleName?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(couples).values({
    user1Id,
    user2Id,
    relationshipStartDate,
    coupleName,
  });

  return result;
}

export async function getCoupleByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(couples)
    .where(
      eq(couples.user1Id, userId) || eq(couples.user2Id, userId)
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCoupleById(coupleId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(couples)
    .where(eq(couples.id, coupleId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Photo Management
 */
export async function addPhoto(
  coupleId: number,
  uploadedByUserId: number,
  s3Key: string,
  s3Url: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(photos).values({
    coupleId,
    uploadedByUserId,
    s3Key,
    s3Url,
    description,
  });

  return result;
}

export async function getPhotosByCoupleId(coupleId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(photos)
    .where(eq(photos.coupleId, coupleId))
    .orderBy(photos.uploadedAt);

  return result;
}

export async function deletePhoto(photoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(photos).where(eq(photos.id, photoId));
}

/**
 * YouTube Video Management
 */
export async function addYoutubeVideo(
  coupleId: number,
  addedByUserId: number,
  videoId: string,
  title?: string,
  description?: string,
  thumbnail?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(youtubeVideos).values({
    coupleId,
    addedByUserId,
    videoId,
    title,
    description,
    thumbnail,
  });

  return result;
}

export async function getYoutubeVideosByCoupleId(coupleId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(youtubeVideos)
    .where(eq(youtubeVideos.coupleId, coupleId))
    .orderBy(youtubeVideos.addedAt);

  return result;
}

export async function deleteYoutubeVideo(videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(youtubeVideos).where(eq(youtubeVideos.id, videoId));
}

/**
 * Romantic Phrases Management
 */
export async function getRomanticPhrasesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(romanticPhrases)
    .where(eq(romanticPhrases.category, category));

  return result;
}

export async function getAllRomanticPhrases() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(romanticPhrases);

  return result;
}

export async function getRandomRomanticPhrase() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(romanticPhrases)
    .orderBy(sql`RAND()`)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function seedRomanticPhrases() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
    await db.insert(romanticPhrases).values(phrase).onDuplicateKeyUpdate({
      set: phrase,
    });
  }
}

// TODO: add feature queries here as your schema grows.
