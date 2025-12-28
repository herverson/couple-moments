import { useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { toast } from 'sonner';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signOut,
  };
}

