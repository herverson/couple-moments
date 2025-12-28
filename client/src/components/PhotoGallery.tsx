import { useState, memo, useCallback } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Photo {
  id: string;
  s3_url: string;
  description?: string;
  uploaded_at: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  coupleId: string;
  onPhotoAdded?: () => void;
  onPhotoDeleted?: () => void;
  isLoading?: boolean;
}

export const PhotoGallery = memo(function PhotoGallery({
  photos,
  coupleId,
  onPhotoAdded,
  onPhotoDeleted,
  isLoading = false,
}: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDescription("");
      setShowDialog(true);
    }
    e.target.value = ''; // Reset input
  }, []);

  const handlePhotoUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      // Import supabase
      const { supabase } = await import("@/lib/supabase");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload photos");
        return;
      }

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log("[DEBUG] Uploading file:", fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('couple-photos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("[DEBUG] Upload error:", uploadError);
        throw uploadError;
      }

      console.log("[DEBUG] Upload success:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('couple-photos')
        .getPublicUrl(uploadData.path);

      console.log("[DEBUG] Public URL:", publicUrl);

      // Save metadata to database
      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          couple_id: coupleId,
          uploaded_by_user_id: user.id,
          s3_key: uploadData.path,
          s3_url: publicUrl,
          description: description.trim() || null,
        })
        .select();

      if (dbError) {
        console.error("[DEBUG] Database error:", dbError);
        throw dbError;
      }

      console.log("[DEBUG] Photo saved to database:", photoData);

      toast.success("Photo uploaded successfully!");
      setShowDialog(false);
      setSelectedFile(null);
      setDescription("");
      onPhotoAdded?.();
    } catch (error) {
      console.error("[DEBUG] Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  }, [selectedFile, description, coupleId, onPhotoAdded]);

  const handlePhotoDelete = useCallback(async (photoId: string) => {
    try {
      setDeleting(photoId);
      
      const { supabase } = await import("@/lib/supabase");
      
      // Get photo info first
      const { data: photo } = await supabase
        .from('photos')
        .select('s3_url')
        .eq('id', photoId)
        .single();

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Try to delete from storage (optional, won't fail if already deleted)
      if (photo?.s3_url) {
        const pathMatch = photo.s3_url.match(/couple-photos\/(.+)$/);
        if (pathMatch) {
          await supabase.storage
            .from('couple-photos')
            .remove([pathMatch[1]]);
        }
      }

      toast.success("Photo deleted successfully!");
      onPhotoDeleted?.();
    } catch (error) {
      console.error("[DEBUG] Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  }, [onPhotoDeleted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Photo Gallery</h3>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <Button
                asChild
                disabled={uploading}
                className="cursor-pointer"
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </span>
              </Button>
            </label>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Photo 📸
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedFile && (
                <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Caption / Description
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Our first trip together ✈️"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-600 focus:border-rose-500 dark:focus:border-rose-400"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Add a special caption to this memory
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedFile(null);
                    setDescription("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePhotoUpload}
                  disabled={uploading || !selectedFile}
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photo"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
          <p className="text-gray-600 dark:text-gray-400">No photos yet. Upload your first memory!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
            >
              {/* Photo */}
              <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={photo.s3_url}
                  alt={photo.description || "Couple photo"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              {/* Photo Info */}
              <div className="p-4 space-y-2">
                {photo.description && (
                  <p className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
                    {photo.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(photo.uploaded_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePhotoDelete(photo.id)}
                    disabled={deleting === photo.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {deleting === photo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
