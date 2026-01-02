import { useEffect, useState } from "react";
import { Heart, Plus, Trash2, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Memory {
  id: string;
  couple_id: string;
  phrase: string;
  created_at: string;
}

interface CoupleMemoriesProps {
  coupleId: string;
  isAdmin?: boolean; // Show management buttons
}

export function CoupleMemories({ coupleId, isAdmin = false }: CoupleMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [adding, setAdding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("couple_memories")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMemories(data || []);
      
      // Set random phrase on first load
      if (data && data.length > 0 && currentIndex === 0) {
        setCurrentIndex(Math.floor(Math.random() * data.length));
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast.error("Falha ao carregar frases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coupleId) {
      fetchMemories();
    }
  }, [coupleId]);

  const handleAddMemory = async () => {
    if (!newPhrase.trim()) {
      toast.error("Digite uma frase");
      return;
    }

    try {
      setAdding(true);
      const { error } = await supabase
        .from("couple_memories")
        .insert({
          couple_id: coupleId,
          phrase: newPhrase.trim(),
        });

      if (error) throw error;

      toast.success("Frase adicionada! 💕");
      setNewPhrase("");
      setShowDialog(false);
      fetchMemories();
    } catch (error) {
      console.error("Error adding memory:", error);
      toast.error("Falha ao adicionar frase");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("couple_memories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Frase removida");
      fetchMemories();
      
      // Adjust current index if needed
      if (currentIndex >= memories.length - 1) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Falha ao remover frase");
    }
  };

  const handleNextPhrase = () => {
    if (memories.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }
  };

  const handlePrevPhrase = () => {
    if (memories.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando frases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        

        {isAdmin && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Frase
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Frase Marcante</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frase *
                  </label>
                  <Textarea
                    placeholder="Digite uma frase especial do casal..."
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newPhrase.length}/500 caracteres
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowDialog(false);
                      setNewPhrase("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddMemory}
                    disabled={adding || !newPhrase.trim()}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                  >
                    {adding ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700">
          <Quote className="mx-auto text-rose-300 dark:text-rose-700 mb-4" size={64} />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Nenhuma frase marcante ainda
          </p>
          {isAdmin && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Adicione frases especiais que marcaram a história do casal
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Phrase Display */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950 rounded-3xl p-8 border-2 border-rose-300 dark:border-rose-700 shadow-xl">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 dark:bg-rose-900 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>

            {/* Progress Dots (if multiple phrases) */}
            {memories.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {memories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'w-8 bg-rose-500' 
                        : 'w-2 bg-rose-300 hover:bg-rose-400'
                    }`}
                    aria-label={`Ir para frase ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="relative text-center space-y-4">
              <Quote className="mx-auto text-rose-500 mb-4" size={48} fill="currentColor" />
              
              <p className="text-2xl md:text-3xl font-serif italic text-gray-900 dark:text-white leading-relaxed">
                "{memories[currentIndex].phrase}"
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(memories[currentIndex].created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              {/* Counter (if multiple phrases) */}
              {memories.length > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {currentIndex + 1} de {memories.length}
                </p>
              )}

              {/* Admin Controls - Only visible for admin */}
              {isAdmin && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMemory(memories[currentIndex].id)}
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Arrows (visible on hover, for both admin and public) */}
            {memories.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhrase}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  aria-label="Frase anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhrase}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  aria-label="Próxima frase"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Tap Zones (mobile friendly - like Instagram Stories) */}
                <button
                  onClick={handlePrevPhrase}
                  className="absolute left-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none active:bg-white/10 transition-colors md:hidden"
                  aria-label="Frase anterior"
                />
                <button
                  onClick={handleNextPhrase}
                  className="absolute right-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none active:bg-white/10 transition-colors md:hidden"
                  aria-label="Próxima frase"
                />
              </>
            )}
          </div>

          {/* All Phrases List (Admin Only) */}
          {isAdmin && memories.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Todas as Frases ({memories.length})
              </h3>
              <div className="grid gap-2">
                {memories.map((memory, index) => (
                  <button
                    key={memory.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`text-left p-4 rounded-lg transition-all ${
                      index === currentIndex
                        ? 'bg-rose-100 dark:bg-rose-950 border-2 border-rose-500'
                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700'
                    }`}
                  >
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      "{memory.phrase}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(memory.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

