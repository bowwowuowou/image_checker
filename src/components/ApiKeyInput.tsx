import { useState } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [isEditing, setIsEditing] = useState(!apiKey);

  if (!isEditing && apiKey) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-green-600">✓ APIキー設定済み</span>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 text-white hover:underline rounded-full"
        >
          変更
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="Claude API キーを入力..."
        className="flex-1 px-7 py-3 border rounded-lg  bg-white"
      />
      {apiKey && (
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          保存
        </button>
      )}
    </div>
  );
}