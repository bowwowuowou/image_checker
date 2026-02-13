import { useState } from 'react';

interface MasterTextInputProps {
    text: string; // textは文字列型
    setText: (text: string) => void;
}

export function MasterTextInput({ text, setText }: MasterTextInputProps) {
    const [isLoading, setIsLoading] = useState(false);

    // HTML/CSSを読み込む
    const handleLoadHtmlCss = async () => {
        setIsLoading(true);
        try {
        // クリップボード から取得
        const clipboardText = await navigator.clipboard.readText();
        
        if (!clipboardText) {
            alert('クリップボードが空です');
            return;
        }

        //JSONパース
        const data = JSON.parse(clipboardText);

        if(!data.html || !data.css){
            alert('拡張機能で先にページを取得してください');
            return;
        }

        const { html, css, url, title } = data;
      
        // フォーマットして本文欄に入力
        const formattedText = `
            【取得元】
            タイトル: ${title}
            URL: ${url}

            【HTML】
            ${html}

            【計算済みCSS】
            ${css}
            `.trim();

            setText(formattedText);
            alert('HTML/CSSを読み込みました！');

            } catch (error) {
            console.error('Error:', error);
            alert('HTML/CSSの読み込みに失敗しました');
            } finally {
            setIsLoading(false);
            }
        };

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2>本文</h2>
                <button
                    onClick={handleLoadHtmlCss}
                    disabled={isLoading}
                    className="px-4 py-2 mb-5 text-white bg-geyser border-2 border-geyser hover:bg-white hover:text-geyser rounded-lg transition text-sm"
                >
                    {isLoading ? (
                        '読み込み中...'
                    ) : (
                        <div className="-translate-y-0.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5 mr-2 inline-block -translate-y-0.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                />
                            </svg>
                            HTML/CSS を読み込み
                        </div>
                    )}
                </button>
            </div>
            
            <textarea
                value={text} // textareaはtextの値(のちのちsetTextで更新される)を表示する
                onChange = {(e) => setText(e.target.value)}
                // onChangeイベント=ユーザーがvalue={text}の値を変更時即座に実行する
                // e.target.value = value={text}の値
                // onChange(ユーザーによる入力)が起こったら{(e) => setText(e.target.value)}が実行される
                // useStateがe.target.value(ユーザーによる入力)になる
                placeholder = "記事本文を入力、またはHTML/CSSをアップロード"
                rows = {10}
                style={{ 
                    width: '100%',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    padding: '15px'
                 }}
            />
        </div>
    );
}