import { ApiKeyInput } from './ApiKeyInput';

interface HeaderProps {
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    aiProvider: string;
    onAiProviderChange: (provider: string) => void;
}

export function Header({ apiKey, onApiKeyChange, aiProvider, onAiProviderChange }: HeaderProps) {
    return (
        <header className="text-center p-10">
            <h1>画像チェックツール</h1>
            <p className="mt-2 mb-5">AIが本文と画像を照らし合わせ、情報の相違や誤字などがないか調べます。</p>
            
            {/* AI選択 */}
            <div className="flex justify-center gap-4 mb-4">
                <select
                value={aiProvider}
                onChange={(e) => onAiProviderChange(e.target.value)}
                className="px-3 py-2 border rounded-lg"
                >
                <option value="claude">Claude</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="gemini">Gemini</option>
                </select>
            </div>
            
            <ApiKeyInput apiKey={apiKey} onApiKeyChange={onApiKeyChange} />
        </header>
    );
}