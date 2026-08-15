'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useToast } from './Toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  aspect?: string;
  className?: string;
}

export function ImageUpload({ images, onChange, max = 6, aspect = 'aspect-square', className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { error } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = max - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        if (file.size > 5 * 1024 * 1024) {
          error('Image too large', 'Maximum file size is 5MB.');
          continue;
        }
        const result = await api.upload(file);
        uploaded.push(result.url);
      }
      onChange([...images, ...uploaded].slice(0, max));
    } catch {
      error('Upload failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={img} className={cn('relative rounded-xl overflow-hidden border border-border group', aspect)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-black/70 text-white">
                Cover
              </span>
            )}
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors bg-muted/30',
              aspect
            )}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-medium">Add image</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
