import { useState } from 'react';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { MasterTextInput } from './components/MasterTextInput';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import type { ImageItem, CheckResult } from './types';
import { checkWithClaude } from './services/claudeApi';
import { checkWithOpenAI } from './services/openaiApi';
import { checkWithGemini } from './services/geminiApi';

function App() {
  const [aiProvider, setAIProvider] = useState<AIProvider>('claude');
  const [apiKey, setApiKey] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    console.log('handleCheck が呼ばれました');
    console.log('text:', text);
    console.log('images:', images);

    if (!text && images.length === 0){
      alert('本文と画像を入力してください');
      return
    }
    if (!text){
      alert('本文を入力してください');
      return
    }
    if (images.length === 0){
      alert('画像をアップロードしてください');
      return
    }
    if (!apiKey) {
      alert('APIキーを設定してください');
      return;
    }
  
    setIsChecking(true);
    setResults([]);

    /*
    // モックデータ
    setTimeout(() => {
      const mockResults: CheckResult[] = [
        {
          id: '1',
          type: '誤字',
          severity: 'high',
          description: '「こんにちわ」は「こんにちは」が正しいです',
          location: '2段落目',
        },
        {
          id: '2',
          type: '情報誤り',
          severity: 'medium',
          description: '日付が2025年となっていますが、現在は2026年です',
          imageIndex: 0,
        },
        {
          id: '3',
          type: 'レイアウト',
          severity: 'low',
          description: '画像の解像度が低く、ぼやけて見える可能性があります',
          imageIndex: 1,
        },
      ];

      setResults(mockResults);
      setIsChecking(false);
    }, 2000); 
    */
  
    try {
      const checkResults = await (async () => {
        switch (aiProvider) {
          case 'claude':
            return await checkWithClaude(text, images, apiKey);
          case 'openai':
            return await checkWithOpenAI(text, images, apiKey);
          case 'gemini':
            return await checkWithGemini(text, images, apiKey);
          default:
            throw new Error(`未対応のAIプロバイダー: ${aiProvider}`);
        }
      })();
      setResults(checkResults);
    } catch (error) {
      console.error('API Error:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div>
      <Header 
        apiKey={apiKey} 
        onApiKeyChange={setApiKey}
        aiProvider={aiProvider}
        onAiProviderChange={setAIProvider}
      />
      <div className="max-w-7xl mx-auto px-6">
        <main className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <MasterTextInput text={text} setText={setText} />
          </div>
          <div className="bg-white rounded-lg border p-6">
            <ImageUploader images={images} setImages={setImages} />
          </div>

          {/* チェックボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="px-6 py-3 text-white rounded-lg transition font-medium"
            >
              {isChecking ? 'チェック中…' : 'チェック開始'}
            </button>
          </div>

          {/* 結果表示 */}
          <ResultDisplay results={results} isChecking={isChecking} />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
