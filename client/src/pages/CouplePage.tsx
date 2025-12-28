import { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/lib/supabase";
import { RelationshipTimer } from "@/components/RelationshipTimer";
import { RomanticPhrases } from "@/components/RomanticPhrases";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, ArrowLeft, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

interface Photo {
  id: string;
  s3_url: string;
  description?: string;
  uploaded_at: string;
}

interface Video {
  id: string;
  video_id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  added_at: string;
}

export default function CouplePage() {
  const [, params] = useRoute("/couple/:id");
  const coupleUuid = params?.id;
  
  const { user, isAuthenticated, signOut } = useSupabaseAuth();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const { couple, loading: coupleLoading } = useCouple(coupleId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [, setLocation] = useLocation();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  const fetchPhotos = useCallback(async (cId: string) => {
    try {
      setLoadingPhotos(true);
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("couple_id", cId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error loading photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  const fetchVideos = useCallback(async (cId: string) => {
    try {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("couple_id", cId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    console.log("[CouplePage] UUID from URL:", coupleUuid);
    
    if (!coupleUuid) {
      console.log("[CouplePage] No UUID provided");
      toast.error("Invalid couple link");
      setLocation("/");
      return;
    }

    const fetchCoupleByUuid = async () => {
      try {
        console.log("[CouplePage] Fetching couple by UUID:", coupleUuid);
        
        const { data, error } = await supabase
          .from("couples")
          .select("*")
          .eq("id", coupleUuid)
          .single();

        if (error) {
          console.error("[CouplePage] Error fetching couple:", error);
          if (error.code === "PGRST116") {
            toast.error("Couple not found");
            setLocation("/");
          }
          throw error;
        }

        if (data) {
          console.log("[CouplePage] Couple found:", data);
          setCoupleId(data.id);
          
          // Check if current user is owner
          if (user && (data.user1_id === user.id || data.user2_id === user.id)) {
            setIsOwner(true);
            console.log("[CouplePage] User is owner");
          }
          
          await fetchPhotos(data.id);
          await fetchVideos(data.id);
        }
      } catch (error) {
        console.error("[CouplePage] Error:", error);
      }
    };

    fetchCoupleByUuid();
  }, [coupleUuid, user, setLocation, fetchPhotos, fetchVideos]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setLocation("/");
  }, [signOut, setLocation]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado! Compartilhe com quem você ama 💕");
  }, []);

  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (photos.length === 0) return;
    
    const interval = setInterval(() => {
      nextPhoto();
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length, nextPhoto]);

  if (coupleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading couple profile...</p>
        </div>
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center py-12">
          <Heart className="text-rose-300 mx-auto mb-4" size={64} />
          <p className="text-xl text-gray-600 dark:text-gray-400">Couple not found</p>
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
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Heart className="text-rose-500 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {couple.couple_name || "Couple Moments"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleShare}
              className="bg-rose-50 hover:bg-rose-100 border-rose-300"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            {isOwner && user && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              {couple.couple_name || "Welcome"}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your private space to celebrate your love 💕
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

          {/* Photo Carousel + Gallery */}
          <section>
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <Heart className="text-rose-500 mr-2" size={32} fill="currentColor" />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ❤️ Nossas Memórias ❤️
                </h3>
                <Heart className="text-rose-500 ml-2" size={32} fill="currentColor" />
              </div>

              {loadingPhotos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando memórias...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700">
                  <Heart className="mx-auto text-rose-300 dark:text-rose-700 mb-4" size={64} />
                  <p className="text-xl text-gray-600 dark:text-gray-400">Nenhuma foto ainda</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Suas memórias aparecerão aqui</p>
                </div>
              ) : (
                <>
                  {/* Featured Carousel */}
                  <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-3xl shadow-2xl border-4 border-rose-200 dark:border-rose-800 p-4 space-y-4">
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
                      <img
                        src={photos[currentPhotoIndex].s3_url}
                        alt={photos[currentPhotoIndex].description || "Foto do casal"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Caption BELOW image (not overlaying) */}
                    {photos[currentPhotoIndex].description && (
                      <div className="text-center px-4 py-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {photos[currentPhotoIndex].description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(photos[currentPhotoIndex].uploaded_at).toLocaleDateString('pt-BR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Dots Indicator */}
                    {photos.length > 1 && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentPhotoIndex 
                                ? 'w-8 bg-white' 
                                : 'w-2 bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to photo ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Photo Grid - All Photos */}
                  {photos.length > 1 && (
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                        Todas as Fotos ({photos.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${
                              index === currentPhotoIndex 
                                ? 'ring-4 ring-rose-500 shadow-lg scale-105' 
                                : 'ring-2 ring-gray-200 dark:ring-gray-700'
                            }`}
                          >
                            <img
                              src={photo.s3_url}
                              alt={photo.description || `Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* YouTube Playlist */}
          <section>
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <Heart className="text-rose-500 mr-2" size={32} fill="currentColor" />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ❤️ Nossa Trilha Sonora ❤️
                </h3>
                <Heart className="text-rose-500 ml-2" size={32} fill="currentColor" />
              </div>

              {loadingVideos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando playlist...</p>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700">
                  <Heart className="mx-auto text-rose-300 dark:text-rose-700 mb-4" size={64} />
                  <p className="text-xl text-gray-600 dark:text-gray-400">Nenhum vídeo ainda</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Sua trilha sonora aparecerá aqui</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700"
                    >
                      {/* Video Number Badge */}
                      <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>

                      {/* Video Player */}
                      <div className="relative w-full pt-[56.25%] bg-black">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${video.video_id}`}
                          title={video.title || video.description || "YouTube video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
                        {(video.description || video.title) && (
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {video.description || video.title}
                          </h4>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(video.added_at).toLocaleDateString('pt-BR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="text-rose-500 font-medium">
                            ♫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
