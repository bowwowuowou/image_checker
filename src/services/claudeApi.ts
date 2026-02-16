import type { CheckResult } from '../types';

export async function checkWithClaude(
  text: string,
  images: { preview: string; file: File }[],
  apiKey: string
): Promise<CheckResult[]> {
  
  // 1. リクエストボディを構成
  const messages = [
    {
      role: 'user',
      content: [
        // テキスト部分
        {
          type: 'text',
          text: `以下の本文と画像を比較して、誤字・情報誤り・レイアウト崩れをチェックしてください。

【本文】
${text}

【チェック項目】
1. 誤字・脱字
2. 本文と画像の情報の一致
3. レイアウトの崩れ

結果は以下のJSON形式で返してください：
[
  {
    "type": "誤字" | "情報誤り" | "レイアウト",
    "severity": "high" | "medium" | "low",
    "description": "具体的な説明",
    "location": "場所（オプション）",
    "imageIndex": 画像番号（オプション、0から始まる）
  }
]`
        },
        // 画像部分（複数対応）
        ...images.map((image) => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.file.type,
            data: image.preview.split(',')[1] // "data:image/jpeg;base64," を除去
          }
        }))
      ]
    }
  ];

  // 2. API呼び出し
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: messages
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // 3. レスポンスをパース
  const data = await response.json();
  
  // Claude のレスポンスからテキストを取得
  const responseText = data.content
    .filter((item: any) => item.type === 'text')
    .map((item: any) => item.text)
    .join('');

  // 4. JSONをパース（Claudeが ```json ``` で囲む場合がある）
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('有効なJSON形式が見つかりません');
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  const results = JSON.parse(jsonText);

  // 5. IDを追加
  return results.map((result: any, index: number) => ({
    ...result,
    id: `result-${index}`
  }));
}