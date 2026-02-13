import { ApiKeyInput } from './ApiKeyInput';

interface HeaderProps {
    apikey: string;
    onApiKeyChange: (key: string) => void;
}

export function Header({ apikey, onApiKeyChange }: HeaderProps) {
    return (
        <header className="text-center p-10">
            <h1>画像チェックツール</h1>
            <p className="mt-2 mb-5">AIが本文と画像を照らし合わせ、情報の相違や誤字などがないか調べます。</p>
            <ApiKeyInput apiKey={apikey} onApiKeyChange={onApiKeyChange} />
        </header>
    );
}