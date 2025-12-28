import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Couple {
  id: string;
  couple_name: string;
  user1_id: string;
  user2_id: string | null;
  relationship_start_date: string;
  invite_code: string;
  created_at: any;
}

const COUPLES_COLLECTION = 'couples';

export const coupleService = {
  /**
   * Get couple by user ID
   */
  async getCoupleByUserId(userId: string): Promise<Couple | null> {
    try {
      // Query for couples where user is either user1 or user2
      const q1 = query(
        collection(db, COUPLES_COLLECTION),
        where('user1_id', '==', userId)
      );
      const q2 = query(
        collection(db, COUPLES_COLLECTION),
        where('user2_id', '==', userId)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      if (!snapshot1.empty) {
        const doc = snapshot1.docs[0];
        return { id: doc.id, ...doc.data() } as Couple;
      }

      if (!snapshot2.empty) {
        const doc = snapshot2.docs[0];
        return { id: doc.id, ...doc.data() } as Couple;
      }

      return null;
    } catch (error) {
      console.error('Error getting couple:', error);
      throw error;
    }
  },

  /**
   * Create a new couple
   */
  async createCouple(data: {
    userId: string;
    coupleName: string;
    relationshipStartDate: string;
  }): Promise<Couple> {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const coupleRef = doc(collection(db, COUPLES_COLLECTION));

      const coupleData = {
        couple_name: data.coupleName,
        user1_id: data.userId,
        user2_id: null,
        relationship_start_date: data.relationshipStartDate,
        invite_code: inviteCode,
        created_at: serverTimestamp(),
      };

      await setDoc(coupleRef, coupleData);

      return {
        id: coupleRef.id,
        ...coupleData,
        created_at: new Date(),
      } as Couple;
    } catch (error) {
      console.error('Error creating couple:', error);
      throw error;
    }
  },

  /**
   * Join couple using invite code
   */
  async joinCouple(userId: string, inviteCode: string): Promise<Couple> {
    try {
      const q = query(
        collection(db, COUPLES_COLLECTION),
        where('invite_code', '==', inviteCode.toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Código de convite inválido');
      }

      const coupleDoc = snapshot.docs[0];
      const couple = coupleDoc.data() as Couple;

      if (couple.user2_id) {
        throw new Error('Este casal já está completo');
      }

      if (couple.user1_id === userId) {
        throw new Error('Você não pode usar seu próprio código de convite');
      }

      await updateDoc(doc(db, COUPLES_COLLECTION, coupleDoc.id), {
        user2_id: userId,
      });

      return {
        id: coupleDoc.id,
        ...couple,
        user2_id: userId,
      };
    } catch (error) {
      console.error('Error joining couple:', error);
      throw error;
    }
  },

  /**
   * Update couple information
   */
  async updateCouple(
    coupleId: string,
    data: Partial<Couple>
  ): Promise<void> {
    try {
      const coupleRef = doc(db, COUPLES_COLLECTION, coupleId);
      await updateDoc(coupleRef, data);
    } catch (error) {
      console.error('Error updating couple:', error);
      throw error;
    }
  },
};

