// src/components/ImageUploader.tsx
import { useState, useRef } from 'react';
import type { ImageItem } from '../types';

interface ImageUploaderProps {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

export function ImageUploader({ images, setImages }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ファイルを追加する共通関数
  const addImages = (files: FileList) => {
    const validFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );
  
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') return;
      
        const newImage: ImageItem = {
          id: crypto.randomUUID(),
          file,
          preview: reader.result
        };
      
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { // input要素で発生したchangeイベント
    const files = e.target.files;
    if (!files) return;
    addImages(files);
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // ドラッグ離脱
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // ドロップ
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files) return;
    addImages(files);
  };

  // 削除
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div>
      <div 
        style={{
          display: 'flex'
        }}
        >
        <h2>画像をアップロード</h2>
        <p className='mt-[5px] ml-[10px]'>{images.length}枚の画像</p>
      </div>
      {/* ドロップゾーン */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '3px dashed #007bff' : '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: isDragging ? '#f0f8ff' : '#f9f9f9',
          cursor: 'pointer',
          transition: 'all 0.3s',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => inputRef.current?.click()}
      >
        {images.length === 0 ? (      // lemgth === 0 は 画像が0枚の時
          <div
            style={{
              width: '100%',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              画像をドラッグ&ドロップ
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>または</p>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#b6dcef',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                margin: '0 auto'
              }}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              ファイルを選択
            </button>
          </div>
        ) : (
          // プレビュー表示（横スクロール）
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '10px',
              width: '100%'
            }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                style={{
                  minWidth: '150px',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '5px',
                  position: 'relative',
                  background: '#fff',
                  flexShrink: 0
                }}
              >
                <img
                  src={image.preview}
                  alt={image.file.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    lineHeight: '24px',
                    textAlign: 'center',
                    textShadow: '0 0 2px rgba(121, 121, 121, 0.8)', 
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}