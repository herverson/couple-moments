import { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/lib/supabase";
import { RelationshipTimer } from "@/components/RelationshipTimer";
import { CoupleMemories } from "@/components/CoupleMemories";
import { SpotifyGallery } from "@/components/SpotifyGallery";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, ArrowLeft, ChevronLeft, ChevronRight, Share2, User } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

// Helper function to format date as local (avoiding timezone issues)
function formatLocalDate(dateString: string, options?: { month?: 'short' | 'long' }): string {
  // Parse date as YYYY-MM-DD (local date, not UTC)
  const dateStr = dateString.split('T')[0]; // Get only YYYY-MM-DD part
  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local midnight
  
  return localDate.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: options?.month || 'short',
    year: 'numeric' 
  });
}

interface Photo {
  id: string;
  s3_url: string;
  description?: string;
  uploaded_at: string;
  photo_date?: string;
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
      toast.error("Falha ao carregar fotos");
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
        .eq("couple_id", cId);

      if (error) throw error;
      
      // Sort manually to ensure correct order
      // First by sort_order (if exists), then by added_at
      const sorted = (data || []).sort((a: any, b: any) => {
        // If both have sort_order, use it
        if (a.sort_order != null && b.sort_order != null) {
          return a.sort_order - b.sort_order;
        }
        // If only one has sort_order, prioritize it
        if (a.sort_order != null && b.sort_order == null) {
          return -1;
        }
        if (a.sort_order == null && b.sort_order != null) {
          return 1;
        }
        // If neither has sort_order, use added_at
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      });
      
      setVideos(sorted);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Falha ao carregar vídeos");
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    // Não bloqueia se não tiver UUID - só retorna silenciosamente
    if (!coupleUuid) {
      return;
    }

    const fetchCoupleByUuid = async () => {
      try {
        const { data, error } = await supabase
          .from("couples")
          .select("*")
          .eq("id", coupleUuid)
          .single();

        if (error) {
          console.error("[CouplePage] Error fetching couple:", error);
          return; // Não redireciona, só retorna
        }

        if (data) {
          setCoupleId(data.id);
          
          // Check if current user is owner (optional, doesn't block access)
          if (user && (data.user1_id === user.id || data.user2_id === user.id)) {
            setIsOwner(true);
          }
          
          await fetchPhotos(data.id);
          await fetchVideos(data.id);
        }
      } catch (error) {
        console.error("[CouplePage] Error:", error);
      }
    };

    fetchCoupleByUuid();
  }, [coupleUuid, user, fetchPhotos, fetchVideos]);

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
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil do casal...</p>
        </div>
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center py-12">
          <Heart className="text-rose-300 mx-auto mb-4" size={64} />
          <p className="text-xl text-gray-600 dark:text-gray-400">Casal não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b-2 border-rose-300 dark:border-rose-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="hover:bg-rose-50 dark:hover:bg-rose-950 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-xl shadow-md">
                <Heart className="text-white" size={24} fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {couple.couple_name || "Momentos do Casal"}
                </h1>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Nosso Espaço Romântico
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleShare}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                size="sm"
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>

              {isOwner && user && (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950 rounded-lg border border-rose-200 dark:border-rose-800">
                    <User className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Spotify Music Theme */}
          <section>
            <SpotifyGallery
              coupleId={couple.id}
              isAdmin={isOwner}
              onTrackAdded={() => {}}
              onTrackDeleted={() => {}}
            />
          </section>
          {/* Modern Welcome Banner */}

          {/* Relationship Timer */}
          <section>
            <RelationshipTimer startDate={couple.relationship_start_date} />
          </section>

          {/* Couple Memories / Memorable Phrases */}
          <section>
            <CoupleMemories coupleId={couple.id} isAdmin={isOwner} />
          </section>

          {/* Photo Carousel + Gallery */}
          <section>
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <Heart
                  className="text-rose-500 mr-2"
                  size={32}
                  fill="currentColor"
                />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nossas memórias
                </h3>
                <Heart
                  className="text-rose-500 ml-2"
                  size={32}
                  fill="currentColor"
                />
              </div>

              {loadingPhotos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Carregando memórias...
                  </p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700">
                  <Heart
                    className="mx-auto text-rose-300 dark:text-rose-700 mb-4"
                    size={64}
                  />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Nenhuma foto ainda
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Suas memórias aparecerão aqui
                  </p>
                </div>
              ) : (
                <>
                  {/* Modern Story-Style Carousel */}
                  <div className="max-w-2xl mx-auto">
                    <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
                      {/* Story Progress Bars */}
                      {photos.length > 1 && (
                        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
                          {photos.map((_, index) => (
                            <div
                              key={index}
                              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                            >
                              <div
                                className={`h-full bg-white rounded-full transition-all duration-300 ${
                                  index === currentPhotoIndex
                                    ? "w-full"
                                    : index < currentPhotoIndex
                                      ? "w-full"
                                      : "w-0"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Image - Full Screen Style */}
                      <div className="relative w-full aspect-[9/16] max-h-[70vh] bg-gradient-to-b from-black/50 to-black">
                        <img
                          src={photos[currentPhotoIndex].s3_url}
                          alt={
                            photos[currentPhotoIndex].description ||
                            "Foto do casal"
                          }
                          className="w-full h-full object-cover pointer-events-none"
                        />

                        {/* Gradient Overlay for Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

                        {/* Content Over Image */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                          {/* Top Info */}
                          <div className="flex items-center justify-between pt-8">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <Heart
                                  className="text-white"
                                  size={20}
                                  fill="white"
                                />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg drop-shadow-lg">
                                  {couple.couple_name}
                                </p>
                                <p className="text-white/80 text-sm drop-shadow-lg">
                                  {photos[currentPhotoIndex].photo_date
                                    ? formatLocalDate(
                                        photos[currentPhotoIndex].photo_date
                                      )
                                    : formatLocalDate(
                                        photos[currentPhotoIndex].uploaded_at
                                      )}
                                </p>
                              </div>
                            </div>
                            <div className="text-white/80 text-sm font-medium drop-shadow-lg">
                              {currentPhotoIndex + 1}/{photos.length}
                            </div>
                          </div>

                          {/* Bottom Caption */}
                          {photos[currentPhotoIndex].description && (
                            <div className="space-y-2 pb-4">
                              <p className="text-white text-2xl font-bold drop-shadow-2xl leading-tight">
                                {photos[currentPhotoIndex].description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Navigation Areas (Tap zones like Instagram Stories) */}
                        {photos.length > 1 && (
                          <>
                            <button
                              onClick={prevPhoto}
                              className="absolute left-0 top-0 bottom-0 w-1/3 z-10 focus:outline-none active:bg-white/10 transition-colors"
                              aria-label="Foto anterior"
                            />
                            <button
                              onClick={nextPhoto}
                              className="absolute right-0 top-0 bottom-0 w-1/3 z-10 focus:outline-none active:bg-white/10 transition-colors"
                              aria-label="Próxima foto"
                            />
                          </>
                        )}

                        {/* Arrow Indicators (visible on hover) */}
                        {photos.length > 1 && (
                          <>
                            <button
                              onClick={prevPhoto}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 shadow-xl transition-all hover:scale-110 opacity-0 hover:opacity-100 z-20"
                              aria-label="Foto anterior"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={nextPhoto}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 shadow-xl transition-all hover:scale-110 opacity-0 hover:opacity-100 z-20"
                              aria-label="Próxima foto"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Grid Below */}
                  {photos.length > 1 && (
                    <div className="max-w-4xl mx-auto">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                        Todas as Fotos ({photos.length})
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`relative aspect-square rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                              index === currentPhotoIndex
                                ? "ring-4 ring-rose-500 shadow-xl scale-105"
                                : "ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-rose-300"
                            }`}
                          >
                            <img
                              src={photo.s3_url}
                              alt={photo.description || "Miniatura"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {index === currentPhotoIndex && (
                              <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                                <Heart
                                  className="text-white w-8 h-8"
                                  fill="white"
                                />
                              </div>
                            )}
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
                <Heart
                  className="text-rose-500 mr-2"
                  size={32}
                  fill="currentColor"
                />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nossa trilha sonora
                </h3>
                <Heart
                  className="text-rose-500 ml-2"
                  size={32}
                  fill="currentColor"
                />
              </div>

              {loadingVideos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Carregando playlist...
                  </p>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700">
                  <Heart
                    className="mx-auto text-rose-300 dark:text-rose-700 mb-4"
                    size={64}
                  />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Nenhum vídeo ainda
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Sua trilha sonora aparecerá aqui
                  </p>
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
                          title={
                            video.title || video.description || "YouTube video"
                          }
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
                            {formatLocalDate(video.added_at, { month: "long" })}
                          </span>
                          <span className="text-rose-500 font-medium">♫</span>
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
