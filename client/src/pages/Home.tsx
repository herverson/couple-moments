import { useEffect, useState, useCallback, useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/lib/supabase";
import { PhotoGallery } from "@/components/PhotoGallery";
import { YoutubeGallery } from "@/components/YoutubeGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, LogOut, Mail, Lock, Eye, User, Settings, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation, Link } from "wouter";

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

export default function Home() {
  const { user, isAuthenticated, signOut } = useSupabaseAuth();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const { couple, loading: coupleLoading } = useCouple(coupleId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [, setLocation] = useLocation();
  
  // Login/Signup state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Failed to load videos");
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchUserCouple = async () => {
      try {
        console.log("[DEBUG] Fetching couple for user:", user.id);
        const { data, error } = await supabase
          .from("couples")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .limit(1)
          .single();

        console.log("[DEBUG] Couple query result:", { data, error });

        if (error && error.code !== "PGRST116") {
          console.error("[DEBUG] Error fetching couple:", error);
          throw error;
        }

        if (data) {
          console.log("[DEBUG] Couple found:", data);
          setCoupleId(data.id);
          await fetchPhotos(data.id);
          await fetchVideos(data.id);
        } else {
          console.log("[DEBUG] No couple found for user");
        }
      } catch (error) {
        console.error("Error fetching couple:", error);
        toast.error("Failed to load couple profile");
      }
    };

    fetchUserCouple();
  }, [user, isAuthenticated, fetchPhotos, fetchVideos]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setLocation("/");
  }, [signOut, setLocation]);

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Account created! Please check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLogin]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center">
              <Heart className="text-rose-500 mr-2" size={48} />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Couple Moments
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Celebrate your love story together
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-rose-200 dark:border-rose-800">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
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
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-xl shadow-md">
                <Heart className="text-white" size={24} fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Couple Moments
                </h1>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Painel Admin
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {couple && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation(`/couple/${couple.id}`);
                    setTimeout(() => {
                      if (!window.location.pathname.includes("/couple/")) {
                        window.location.href = `/couple/${couple.id}`;
                      }
                    }, 200);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Página
                </Button>
              )}
              
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950 rounded-lg border border-rose-200 dark:border-rose-800">
                  <User className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {coupleLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your couple profile...</p>
          </div>
        ) : couple ? (
          <div className="space-y-8">
            {/* Modern Admin Dashboard Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950 rounded-3xl shadow-xl p-8 border-2 border-rose-300 dark:border-rose-700">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 dark:bg-rose-900 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>
              
              <div className="relative text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform">
                  <Heart className="text-white w-10 h-10" fill="white" />
                </div>
                
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {couple.couple_name || "Bia & Herver"}
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Gerencie seu espaço romântico
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-rose-200 dark:border-rose-800">
                    <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                      {photos.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Fotos
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-rose-200 dark:border-rose-800">
                    <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                      {videos.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Vídeos
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-rose-200 dark:border-rose-800">
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-1">
                      {new Date(couple.relationship_start_date).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Início
                    </div>
                  </div>
                </div>

                {/* Quick Action */}
                {couple && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(`${window.location.origin}/couple/${couple.id}`);
                      toast.success("Link copiado! Compartilhe com quem você ama 💕");
                    }}
                    variant="outline"
                    className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar Link Público
                  </Button>
                )}
              </div>
            </div>

            {/* Management Sections */}
            <div className="grid gap-6">
              {/* Photo Management */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <PhotoGallery
                  photos={photos}
                  coupleId={coupleId!}
                  onPhotoAdded={() => coupleId && fetchPhotos(coupleId)}
                  onPhotoDeleted={() => coupleId && fetchPhotos(coupleId)}
                  isLoading={loadingPhotos}
                />
              </section>

              {/* Video Management */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <YoutubeGallery
                  videos={videos}
                  coupleId={coupleId!}
                  onVideoAdded={() => coupleId && fetchVideos(coupleId)}
                  onVideoDeleted={() => coupleId && fetchVideos(coupleId)}
                  isLoading={loadingVideos}
                />
              </section>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-rose-300 dark:border-rose-700">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <Heart className="text-rose-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Your Couple Profile
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start your journey together by creating a couple profile. Add your relationship start date, couple name, and begin sharing memories!
                </p>
                <Button
                  onClick={() => setLocation("/create-couple")}
                  size="lg"
                  className="w-full bg-rose-500 hover:bg-rose-600 h-12 text-lg"
                >
                  Create Couple Profile 💕
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
