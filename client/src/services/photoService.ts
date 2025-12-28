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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface Photo {
  id: string;
  couple_id: string;
  url: string;
  storage_path: string;
  description?: string;
  uploaded_at: any;
}

const PHOTOS_COLLECTION = 'photos';

export const photoService = {
  /**
   * Get all photos for a couple
   */
  async getPhotosByCoupleId(coupleId: string): Promise<Photo[]> {
    try {
      const q = query(
        collection(db, PHOTOS_COLLECTION),
        where('couple_id', '==', coupleId),
        orderBy('uploaded_at', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Photo[];
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  },

  /**
   * Upload a photo
   */
  async uploadPhoto(
    file: File,
    coupleId: string,
    description?: string
  ): Promise<Photo> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${coupleId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `photos/${filename}`);

      // Upload file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get download URL
      const url = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      const photoData = {
        couple_id: coupleId,
        url,
        storage_path: `photos/${filename}`,
        description: description || null,
        uploaded_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), photoData);

      return {
        id: docRef.id,
        ...photoData,
        uploaded_at: new Date(),
      } as Photo;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string, storagePath: string): Promise<void> {
    try {
      // Delete from Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },
};

