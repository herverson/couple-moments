import { useEffect, useState, memo, useCallback, useMemo } from "react";
import { Heart, RefreshCw, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Phrase {
  id: string;
  phrase: string;
  category: string;
  author?: string;
}

interface RomanticPhrasesProps {
  showAddButton?: boolean;
}

export const RomanticPhrases = memo(function RomanticPhrases({ showAddButton = false }: RomanticPhrasesProps) {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Love");
  const [adding, setAdding] = useState(false);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(phrases.map((p) => p.category)));
    return ["All", ...uniqueCats];
  }, [phrases]);

  const fetchPhrases = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("romantic_phrases")
        .select("*");

      if (error) throw error;

      setPhrases(data || []);

      // Set random phrase
      if (data && data.length > 0) {
        setCurrentPhrase(data[Math.floor(Math.random() * data.length)]);
      }
    } catch (error) {
      toast.error("Failed to load phrases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    const filtered =
      category === "All"
        ? phrases
        : phrases.filter((p) => p.category === category);

    if (filtered.length > 0) {
      setCurrentPhrase(
        filtered[Math.floor(Math.random() * filtered.length)]
      );
    }
  }, [phrases]);

  const handleNextPhrase = useCallback(() => {
    const filtered =
      selectedCategory === "All"
        ? phrases
        : phrases.filter((p) => p.category === selectedCategory);

    if (filtered.length > 0) {
      setCurrentPhrase(
        filtered[Math.floor(Math.random() * filtered.length)]
      );
    }
  }, [phrases, selectedCategory]);

  const handleCopyPhrase = useCallback(() => {
    if (currentPhrase) {
      void navigator.clipboard.writeText(currentPhrase.phrase);
      toast.success("Phrase copied to clipboard!");
    }
  }, [currentPhrase]);

  const handleAddPhrase = useCallback(async () => {
    if (!newPhrase.trim()) {
      toast.error("Please enter a phrase");
      return;
    }

    try {
      setAdding(true);

      const { data, error } = await supabase
        .from('romantic_phrases')
        .insert({
          phrase: newPhrase.trim(),
          category: newCategory,
          author: newAuthor.trim() || null,
        })
        .select();

      if (error) throw error;

      toast.success("Phrase added successfully!");
      setNewPhrase("");
      setNewAuthor("");
      setNewCategory("Love");
      setShowDialog(false);
      
      // Reload phrases
      await fetchPhrases();
    } catch (error) {
      console.error("[DEBUG] Add phrase error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add phrase");
    } finally {
      setAdding(false);
    }
  }, [newPhrase, newCategory, newAuthor, fetchPhrases]);

  if (loading) {
    return <div className="text-center py-8">Loading phrases...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="text-rose-500 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Romantic Phrases
          </h2>
        </div>
        
        {showAddButton && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Phrase
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Your Own Phrase</DialogTitle>
              </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phrase *
                </label>
                <Textarea
                  placeholder="Enter a romantic phrase..."
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Input
                  type="text"
                  placeholder="Love, Romance, Appreciation..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Author (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Who said this?"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowDialog(false);
                    setNewPhrase("");
                    setNewAuthor("");
                    setNewCategory("Love");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPhrase}
                  disabled={adding || !newPhrase.trim()}
                  className="flex-1"
                >
                  {adding ? "Adding..." : "Add Phrase"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {currentPhrase && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-xl p-8 border border-rose-200 dark:border-rose-800 text-center">
          <p className="text-2xl font-serif italic text-gray-800 dark:text-gray-100 mb-4">
            "{currentPhrase.phrase}"
          </p>
          {currentPhrase.author && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              — {currentPhrase.author}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPhrase}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPhrase}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Next
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
});
