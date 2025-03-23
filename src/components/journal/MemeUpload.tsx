import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface MemeUploadProps {
  moodEntryId: string;
  onMemeUploaded: () => void;
}

export function MemeUpload({ moodEntryId, onMemeUploaded }: MemeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${moodEntryId}/${fileName}`;

      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const memesBucketExists = buckets?.some(bucket => bucket.name === 'memes');

      if (!memesBucketExists) {
        toast({
          title: "Storage error",
          description: "Meme storage is not configured properly",
          variant: "destructive"
        });
        return;
      }

      const { error: uploadError, data } = await supabase.storage
        .from('memes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      if (!data) {
        throw new Error('Upload failed');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('memes')
        .insert({
          mood_entry_id: moodEntryId,
          url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Meme uploaded successfully",
      });

      onMemeUploaded();
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading meme:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your meme",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: 'none' }}
        id="meme-upload"
      />
      <label htmlFor="meme-upload">
        <Button
          variant="outline"
          className="cursor-pointer w-full"
          disabled={uploading}
          asChild
        >
          <span>
            {uploading ? 'Uploading...' : '📸 Upload Meme'}
          </span>
        </Button>
      </label>
    </div>
  );
}