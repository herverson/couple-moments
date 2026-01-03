import { useState, memo, useCallback, useEffect } from "react";
import { Music, Trash2, Loader2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Video {
  id: string;
  video_id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  added_at: string;
  sort_order?: number;
}

interface YoutubeGalleryProps {
  videos: Video[];
  coupleId: string;
  onVideoAdded?: () => void;
  onVideoDeleted?: () => void;
  isLoading?: boolean;
}

// Sortable Video Item Component
function SortableVideoItem({
  video,
  onDelete,
  deleting,
}: {
  video: Video;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing bg-white/90 dark:bg-slate-800/90 rounded-lg p-2 shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Video Player */}
      <div className="relative w-full pt-[56.25%] bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${video.video_id}`}
          title={video.title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Video Info */}
      <div className="p-4 space-y-2">
        {video.description && (
          <p className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
            {video.description}
          </p>
        )}
        {!video.description && video.title && video.title !== `YouTube Video ${video.video_id}` && (
          <p className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
            {video.title}
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(video.added_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(video.id)}
            disabled={deleting === video.id}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            {deleting === video.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const YoutubeGallery = memo(function YoutubeGallery({
  videos,
  coupleId,
  onVideoAdded,
  onVideoDeleted,
  isLoading = false,
}: YoutubeGalleryProps) {
  const [showInput, setShowInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortedVideos, setSortedVideos] = useState<Video[]>(videos);
  const [isReordering, setIsReordering] = useState(false);

  // Update sorted videos when videos prop changes
  // Only update if the videos actually changed (by ID and sort_order)
  useEffect(() => {
    // Check if videos actually changed
    if (sortedVideos.length === videos.length) {
      const currentIds = sortedVideos.map(v => v.id).join(',');
      const newIds = videos.map(v => v.id).join(',');
      const currentOrders = sortedVideos.map(v => v.sort_order ?? 'null').join(',');
      const newOrders = videos.map(v => v.sort_order ?? 'null').join(',');
      
      // Only update if IDs or orders changed
      if (currentIds === newIds && currentOrders === newOrders) {
        return; // No changes, skip update
      }
    }
    
    // Sort videos by sort_order if available, otherwise by added_at
    const sorted = [...videos].sort((a, b) => {
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
    
    setSortedVideos(sorted);
  }, [videos]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const extractVideoId = useCallback((url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }, []);

  const handleAddVideo = useCallback(async () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast.error("URL do YouTube ou ID do vídeo inválido");
      return;
    }

    try {
      setAdding(true);
      
      const { supabase } = await import("@/lib/supabase");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para adicionar vídeos");
        return;
      }

      console.log("[DEBUG] Adding video:", videoId, "to couple:", coupleId);

      // Save to database
      const { data, error} = await supabase
        .from('youtube_videos')
        .insert({
          couple_id: coupleId,
          video_id: videoId,
          added_by_user_id: user.id, // IMPORTANTE: user que adicionou
          title: videoTitle.trim() || null,
          description: videoTitle.trim() || null,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        })
        .select();

      if (error) {
        console.error("[DEBUG] Database error:", error);
        throw error;
      }

      console.log("[DEBUG] Video saved:", data);

      toast.success("Vídeo adicionado com sucesso!");
      setYoutubeUrl("");
      setVideoTitle("");
      setShowInput(false);
      onVideoAdded?.();
    } catch (error) {
      console.error("[DEBUG] Add video error:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao adicionar vídeo");
    } finally {
      setAdding(false);
    }
  }, [coupleId, extractVideoId, onVideoAdded, youtubeUrl, videoTitle]);

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    try {
      setDeleting(videoId);
      
      const { supabase } = await import("@/lib/supabase");
      
      // Delete from database
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error("[DEBUG] Delete video error:", error);
        throw error;
      }

      toast.success("Vídeo deletado com sucesso!");
      onVideoDeleted?.();
    } catch (error) {
      console.error("[DEBUG] Delete video error:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao deletar vídeo");
    } finally {
      setDeleting(null);
    }
  }, [onVideoDeleted]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedVideos.findIndex((v) => v.id === active.id);
    const newIndex = sortedVideos.findIndex((v) => v.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newVideos = arrayMove(sortedVideos, oldIndex, newIndex);
    setSortedVideos(newVideos);
    setIsReordering(true);

    try {
      const { supabase } = await import("@/lib/supabase");

      console.log("[DEBUG] Starting reorder, videos count:", newVideos.length);

      // Update sort_order for all videos in a batch
      const updates = newVideos.map((video, index) => ({
        id: video.id,
        sort_order: index,
      }));

      console.log("[DEBUG] Updates to apply:", updates);

      // Update videos sequentially to avoid race conditions
      // This ensures each update completes before the next one starts
      const results = [];
      for (const update of updates) {
        console.log(`[DEBUG] Updating video ${update.id} to sort_order ${update.sort_order}`);
        
        // Use .select() to get the updated data directly from the UPDATE
        const { data: updateData, error: updateError } = await supabase
          .from("youtube_videos")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id)
          .select("id, sort_order")
          .single();

        if (updateError) {
          console.error(`[DEBUG] Error updating video ${update.id}:`, updateError);
          // Check if it's a column doesn't exist error
          if (updateError.code === '42703' || updateError.message?.includes('sort_order') || updateError.message?.includes('column')) {
            console.warn("[DEBUG] sort_order column doesn't exist in database");
            results.push({ success: false, error: 'COLUMN_NOT_EXISTS', update });
            continue;
          }
          // Check for RLS/permission errors
          if (updateError.code === '42501' || updateError.message?.includes('permission') || updateError.message?.includes('policy')) {
            console.error("[DEBUG] RLS policy may be blocking UPDATE. Check your RLS policies!");
            results.push({ success: false, error: 'RLS_BLOCKED', update });
            continue;
          }
          results.push({ success: false, error: updateError, update });
          continue;
        }

        // If UPDATE returned data, verify it immediately
        if (updateData) {
          const returnedSortOrder = updateData.sort_order;
          if (returnedSortOrder !== update.sort_order) {
            console.error(`[DEBUG] WARNING: Update returned wrong value! Expected sort_order ${update.sort_order}, got ${returnedSortOrder}`);
            results.push({ success: false, error: 'PERSISTENCE_FAILED', update, expected: update.sort_order, actual: returnedSortOrder });
          } else {
            console.log(`[DEBUG] ✓ Update successful: Video ${update.id} has sort_order ${returnedSortOrder}`);
            results.push({ success: true, data: updateData, update, verified: true });
          }
        } else {
          // UPDATE succeeded but didn't return data (might be RLS blocking SELECT)
          // Try to fetch separately after a small delay
          console.warn(`[DEBUG] Update succeeded but no data returned. Fetching separately...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const { data: fetchData, error: fetchError } = await supabase
            .from("youtube_videos")
            .select("id, sort_order")
            .eq("id", update.id)
            .single();

          if (fetchError) {
            console.warn(`[DEBUG] Couldn't verify update (fetch error):`, fetchError);
            // Still consider it a success if the update didn't error
            results.push({ success: true, data: { id: update.id, sort_order: update.sort_order }, update, verified: false });
          } else if (fetchData) {
            const returnedSortOrder = fetchData.sort_order;
            if (returnedSortOrder !== update.sort_order) {
              console.error(`[DEBUG] WARNING: Update didn't persist! Expected sort_order ${update.sort_order}, got ${returnedSortOrder}`);
              results.push({ success: false, error: 'PERSISTENCE_FAILED', update, expected: update.sort_order, actual: returnedSortOrder });
            } else {
              console.log(`[DEBUG] ✓ Verified: Video ${update.id} has sort_order ${returnedSortOrder}`);
              results.push({ success: true, data: fetchData, update, verified: true });
            }
          } else {
            console.warn(`[DEBUG] Update succeeded but no data returned for verification`);
            results.push({ success: true, data: { id: update.id, sort_order: update.sort_order }, update, verified: false });
          }
        }
        
        // Small delay between updates to avoid race conditions
        if (results.length < updates.length) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        const columnError = failed.find((r) => r.error === 'COLUMN_NOT_EXISTS');
        if (columnError) {
          toast.error("Campo sort_order não existe no banco. Execute o SQL de migração primeiro!");
          console.error("[DEBUG] Column sort_order doesn't exist. Run the migration SQL first!");
          setSortedVideos(videos);
          return;
        }
        
        const rlsError = failed.find((r) => r.error === 'RLS_BLOCKED');
        if (rlsError) {
          toast.error("Erro de permissão. Verifique as políticas RLS no Supabase!");
          console.error("[DEBUG] RLS is blocking updates. Check your RLS policies!");
          setSortedVideos(videos);
          return;
        }
        
        // If some failed but not all, show warning but continue
        if (failed.length < results.length) {
          console.warn(`[DEBUG] ${failed.length} out of ${results.length} updates failed, but continuing...`);
        } else {
          throw new Error(`Falha ao atualizar ${failed.length} vídeo(s)`);
        }
      }

      // Verify all updates were successful by checking the returned data
      const verificationResults = results.map((r) => {
        if (r.success && r.data) {
          const update = r.update || updates.find(u => u.id === r.data?.id);
          if (update) {
            const actualSortOrder = r.data.sort_order;
            const expectedSortOrder = update.sort_order;
            const match = actualSortOrder === expectedSortOrder;
            
            if (!match) {
              console.warn(`[DEBUG] ⚠️ Mismatch for video ${update.id}: expected ${expectedSortOrder}, got ${actualSortOrder}`);
            }
            
            return {
              id: update.id,
              expected: expectedSortOrder,
              actual: actualSortOrder,
              match: match
            };
          }
        } else if (!r.success) {
          console.error(`[DEBUG] ❌ Update failed for video:`, r.update?.id, r.error);
        }
        return null;
      }).filter((r): r is NonNullable<typeof r> => r !== null);

      console.log("[DEBUG] Update verification:", verificationResults);
      
      if (verificationResults.length === 0) {
        console.error("[DEBUG] ⚠️ WARNING: No verification results! Updates may not have worked.");
      } else {
        const allMatch = verificationResults.every((r) => r.match);
        if (!allMatch) {
          console.error("[DEBUG] ⚠️ WARNING: Some updates may not have persisted correctly!");
          console.error("[DEBUG] Mismatched updates:", verificationResults.filter((r) => !r.match));
        } else {
          console.log("[DEBUG] ✅ All updates verified successfully!");
        }
      }

      console.log("[DEBUG] All videos updated successfully");
      
      // Update local state immediately with new order (optimistic update)
      // No need to fetch again - we already know the order is correct
      setSortedVideos(newVideos);
      
      toast.success("Ordem da playlist atualizada! 💕");
      
      // Don't trigger refresh - the local state is already updated
      // Only refresh if explicitly needed (e.g., when adding/deleting videos)
      // This prevents unnecessary re-renders
    } catch (error) {
      console.error("[DEBUG] Error reordering videos:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar ordem da playlist");
      // Revert to original order on error
      setSortedVideos(videos);
    } finally {
      setIsReordering(false);
    }
  }, [sortedVideos, videos, onVideoAdded]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Music className="text-rose-500 mr-2" size={24} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nossa Playlist
          </h3>
        </div>
        <Button
          onClick={() => setShowInput(!showInput)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Vídeo
        </Button>
      </div>

      {showInput && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-700 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              URL do YouTube ou ID do Vídeo *
            </label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !videoTitle && handleAddVideo()}
              className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-600 focus:border-rose-500 dark:focus:border-rose-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Título / Descrição
            </label>
            <Input
              placeholder="Ex: Nossa música favorita 🎵"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
              maxLength={200}
              className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-600 focus:border-rose-500 dark:focus:border-rose-400"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Adicione um título especial para esta memória
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setShowInput(false);
                setYoutubeUrl("");
                setVideoTitle("");
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddVideo}
              disabled={adding || !youtubeUrl}
              className="flex-1 bg-rose-500 hover:bg-rose-600"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Vídeo"
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
          <p className="text-gray-600 dark:text-gray-400">
            Ainda não há vídeos. Adicione suas músicas favoritas ou memórias!
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedVideos.map((v) => v.id)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map((video) => (
                <SortableVideoItem
                  key={video.id}
                  video={video}
                  onDelete={handleDeleteVideo}
                  deleting={deleting}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
});
