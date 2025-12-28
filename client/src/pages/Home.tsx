import { useEffect, useState, useCallback, useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/lib/supabase";
import { PhotoGallery } from "@/components/PhotoGallery";
import { YoutubeGallery } from "@/components/YoutubeGallery";
import { RomanticPhrases } from "@/components/RomanticPhrases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, LogOut, Mail, Lock, Eye } from "lucide-react";
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
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-rose-200 dark:border-rose-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="text-rose-500 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Couple Moments - Admin
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {couple && (
              <>
                {/* Primary button with JavaScript navigation */}
                <Button
                  variant="default"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("[DEBUG] Button clicked!");
                    console.log("[DEBUG] Current location:", window.location.href);
                    console.log("[DEBUG] Attempting to navigate to /couple/" + couple.id);
                    
                    // Try wouter first
                    setLocation(`/couple/${couple.id}`);
                    
                    // Fallback after 200ms if wouter doesn't work
                    setTimeout(() => {
                      if (!window.location.pathname.includes("/couple/")) {
                        console.log("[DEBUG] wouter didn't work, using native navigation");
                        window.location.href = `/couple/${couple.id}`;
                      }
                    }, 200);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Couple Page
                </Button>
              </>
            )}
            {user && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
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
            {/* Admin Dashboard Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border-2 border-rose-300 dark:border-rose-700">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <Heart className="text-rose-500 w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {couple.couple_name || "Admin Dashboard"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Manage your couple's content here. Add photos, videos, and romantic phrases. 
                  When you're ready to view the beautiful page, click "View Couple Page" above.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Photos</p>
                    <p className="text-2xl font-bold text-rose-600">{photos.length}</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
                    <p className="text-2xl font-bold text-rose-600">{videos.length}</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(couple.relationship_start_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
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

              {/* Phrases Management */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <RomanticPhrases showAddButton={true} />
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
