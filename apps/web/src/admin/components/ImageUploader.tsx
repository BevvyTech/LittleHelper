import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '@littlehelper/ui';
import { UploadProgress } from './UploadProgress.js';

interface ImageUploaderProps {
  onUpload: (file: File, previewUrl: string) => Promise<void> | void;
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image uploads are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB).');
      return;
    }

    setError(null);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    uploadFile(file, previewUrl);
  };

  const uploadFile = async (file: File, previewUrl: string) => {
    setIsUploading(true);
    setProgress(10);
    try {
      await onUpload(file, previewUrl);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 300);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="image-uploader__input"
        onChange={handleSelect}
      />

      <div
        className="image-uploader__dropzone"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="image-uploader__preview" />
        ) : (
          <div className="image-uploader__placeholder">
            <span className="image-uploader__icon">🖼️</span>
            <p>Drag & drop an image, or click to browse</p>
            <small>JPG/PNG up to 10MB</small>
          </div>
        )}
      </div>

      {isUploading && <UploadProgress progress={progress} />}
      {error && <div className="form-error">{error}</div>}

      <div className="image-uploader__actions">
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Select Image
        </Button>
      </div>
    </div>
  );
}
