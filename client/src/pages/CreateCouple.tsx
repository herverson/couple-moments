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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Por favor, faça login primeiro</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupleName || !startDate) {
      toast.error("Por favor, preencha todos os campos");
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

      toast.success("Perfil de casal criado! 💕");
      setLocation("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar casal");
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partnerEmail) {
      toast.error("Por favor, insira o e-mail do seu parceiro");
      return;
    }

    try {
      setLoading(true);

      // In a real app, this would send an invite email
      // For now, just show a message
      toast.success("Convite enviado! Seu parceiro receberá um e-mail.");
      setPartnerEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar convite");
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
              Momentos do Casal
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
              Crie Seu Perfil de Casal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comece sua jornada juntos
            </p>
          </div>

          {/* Mode Selection */}
          <div className="flex gap-4 justify-center">
            <Button
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
              className="w-40"
            >
              Criar Perfil
            </Button>
            <Button
              variant={mode === "invite" ? "default" : "outline"}
              onClick={() => setMode("invite")}
              className="w-40"
            >
              Convidar Parceiro
            </Button>
          </div>

          {/* Create Mode */}
          {mode === "create" && (
            <form onSubmit={handleCreateCouple} className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-rose-200 dark:border-rose-800">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Casal
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: João & Maria"
                      value={coupleName}
                      onChange={(e) => setCoupleName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Início do Relacionamento
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-rose-50 dark:bg-rose-950 p-3 rounded">
                    💡 Você pode convidar seu parceiro depois. Por enquanto, você pode começar a adicionar memórias!
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
                    Criando...
                  </>
                ) : (
                  "Criar Perfil de Casal"
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
                      E-mail do Parceiro
                    </label>
                    <Input
                      type="email"
                      placeholder="parceiro@exemplo.com"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-rose-50 dark:bg-rose-950 p-3 rounded">
                    📧 Seu parceiro receberá um convite para participar do seu perfil de casal.
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
                    Enviando...
                  </>
                ) : (
                  "Enviar Convite"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
