// 型定義を作成

export interface ImageItem {
    id: string;
    file: File;
    preview: string;
  }
  
export interface CheckResult {
  id: string;
  type: '誤字' | '情報誤り' | 'レイアウト';
  severity: 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  imageIndex?: number;  // どの画像の問題か
  }