import { useEffect, useState, useCallback } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { RelationshipTimer } from "@/components/RelationshipTimer";
import { PhotoGallery } from "@/components/PhotoGallery";
import { YoutubeGallery } from "@/components/YoutubeGallery";
import { RomanticPhrases } from "@/components/RomanticPhrases";
import { Button } from "@/components/ui/button";
import { Heart, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { coupleService, type Couple } from "@/services/coupleService";
import { photoService, type Photo } from "@/services/photoService";
import { videoService, type Video } from "@/services/videoService";

export default function HomeFirebase() {
  const { user, isAuthenticated, signInWithGoogle, signOut } = useFirebaseAuth();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [, setLocation] = useLocation();

  const fetchPhotos = useCallback(async (coupleId: string) => {
    try {
      setLoadingPhotos(true);
      const data = await photoService.getPhotosByCoupleId(coupleId);
      setPhotos(data);
    } catch (error) {
      toast.error("Erro ao carregar fotos");
      console.error(error);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  const fetchVideos = useCallback(async (coupleId: string) => {
    try {
      setLoadingVideos(true);
      const data = await videoService.getVideosByCoupleId(coupleId);
      setVideos(data);
    } catch (error) {
      toast.error("Erro ao carregar vídeos");
      console.error(error);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCoupleLoading(false);
      return;
    }

    const fetchUserCouple = async () => {
      try {
        setCoupleLoading(true);
        const coupleData = await coupleService.getCoupleByUserId(user.uid);

        if (coupleData) {
          setCouple(coupleData);
          await Promise.all([
            fetchPhotos(coupleData.id),
            fetchVideos(coupleData.id),
          ]);
        }
      } catch (error) {
        console.error("Error fetching couple:", error);
        toast.error("Erro ao buscar dados do casal");
      } finally {
        setCoupleLoading(false);
      }
    };

    fetchUserCouple();
  }, [user, isAuthenticated, fetchPhotos, fetchVideos]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setLocation("/");
  }, [signOut, setLocation]);

  const handlePhotoUploaded = useCallback(() => {
    if (couple) {
      fetchPhotos(couple.id);
    }
  }, [couple, fetchPhotos]);

  const handleVideoAdded = useCallback(() => {
    if (couple) {
      fetchVideos(couple.id);
    }
  }, [couple, fetchVideos]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="flex items-center justify-center">
            <Heart className="text-rose-500 mr-2" size={48} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Couple Moments
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Celebre sua história de amor juntos
          </p>
          <Button
            onClick={signInWithGoogle}
            size="lg"
            className="bg-rose-500 hover:bg-rose-600"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-rose-200 dark:border-rose-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="text-rose-500 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Couple Moments
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </div>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {coupleLoading ? (
          <div className="text-center py-12">Carregando perfil do casal...</div>
        ) : couple ? (
          <div className="space-y-12">
            {/* Welcome Section */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {couple.couple_name || "Bem-vindos"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Seu espaço privado para celebrar seu amor
              </p>
            </div>

            {/* Relationship Timer */}
            <section>
              <RelationshipTimer startDate={couple.relationship_start_date} />
            </section>

            {/* Romantic Phrases */}
            <section>
              <RomanticPhrases />
            </section>

            {/* Photo Gallery */}
            <section>
              <PhotoGallery
                photos={photos}
                coupleId={couple.id}
                onPhotoAdded={handlePhotoUploaded}
                onPhotoDeleted={handlePhotoUploaded}
                isLoading={loadingPhotos}
              />
            </section>

            {/* YouTube Gallery */}
            <section>
              <YoutubeGallery
                videos={videos}
                coupleId={couple.id}
                onVideoAdded={handleVideoAdded}
                onVideoDeleted={handleVideoAdded}
                isLoading={loadingVideos}
              />
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Nenhum perfil de casal encontrado. Crie um ou peça para seu parceiro convidá-lo.
            </p>
            <Button onClick={() => setLocation("/create-couple")} size="lg">
              Criar Perfil do Casal
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

