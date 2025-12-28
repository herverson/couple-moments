import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Video {
  id: string;
  couple_id: string;
  video_id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  added_at: any;
}

const VIDEOS_COLLECTION = 'youtube_videos';

export const videoService = {
  /**
   * Get all videos for a couple
   */
  async getVideosByCoupleId(coupleId: string): Promise<Video[]> {
    try {
      const q = query(
        collection(db, VIDEOS_COLLECTION),
        where('couple_id', '==', coupleId),
        orderBy('added_at', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[];
    } catch (error) {
      console.error('Error getting videos:', error);
      throw error;
    }
  },

  /**
   * Add a YouTube video
   */
  async addVideo(
    coupleId: string,
    videoId: string,
    title?: string,
    description?: string
  ): Promise<Video> {
    try {
      const videoData = {
        couple_id: coupleId,
        video_id: videoId,
        title: title || null,
        description: description || null,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        added_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), videoData);

      return {
        id: docRef.id,
        ...videoData,
        added_at: new Date(),
      } as Video;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  },

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, VIDEOS_COLLECTION, videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },
};

