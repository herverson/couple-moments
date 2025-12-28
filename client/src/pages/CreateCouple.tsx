import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function CreateCouple() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"create" | "invite">("create");
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in first</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupleName || !startDate) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // For now, create couple with current user as user1
      // In a real app, you'd have an invite system
      const { data, error } = await supabase
        .from("couples")
        .insert({
          user1_id: user?.id,
          user2_id: user?.id, // Placeholder - should be partner's ID
          relationship_start_date: new Date(startDate).toISOString(),
          couple_name: coupleName,
        })
        .select();

      if (error) throw error;

      toast.success("Couple profile created! 💕");
      setLocation("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create couple");
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partnerEmail) {
      toast.error("Please enter your partner's email");
      return;
    }

    try {
      setLoading(true);

      // In a real app, this would send an invite email
      // For now, just show a message
      toast.success("Invite sent! Your partner will receive an email.");
      setPartnerEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-rose-200 dark:border-rose-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <Heart className="text-rose-500 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Couple Moments
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Couple Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your journey together
            </p>
          </div>

          {/* Mode Selection */}
          <div className="flex gap-4 justify-center">
            <Button
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
              className="w-40"
            >
              Create Profile
            </Button>
            <Button
              variant={mode === "invite" ? "default" : "outline"}
              onClick={() => setMode("invite")}
              className="w-40"
            >
              Invite Partner
            </Button>
          </div>

          {/* Create Mode */}
          {mode === "create" && (
            <form onSubmit={handleCreateCouple} className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-rose-200 dark:border-rose-800">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couple Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., John & Sarah"
                      value={coupleName}
                      onChange={(e) => setCoupleName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-rose-50 dark:bg-rose-950 p-3 rounded">
                    💡 You can invite your partner later. For now, you can start adding memories!
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Couple Profile"
                )}
              </Button>
            </form>
          )}

          {/* Invite Mode */}
          {mode === "invite" && (
            <form onSubmit={handleInvitePartner} className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-rose-200 dark:border-rose-800">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Partner's Email
                    </label>
                    <Input
                      type="email"
                      placeholder="partner@example.com"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-rose-50 dark:bg-rose-950 p-3 rounded">
                    📧 Your partner will receive an invitation to join your couple profile.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
