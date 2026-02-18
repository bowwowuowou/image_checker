import type { CheckResult } from '../types';

export async function checkWithOpenAI(
  text: string,
  images: { preview: string; file: File }[],
  apiKey: string
): Promise<CheckResult[]> {
  
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `以下の本文（HTML/CSS含む）と画像を比較して、誤字・情報誤り・レイアウト崩れをチェックしてください。

【本文・HTML・CSS】
${text}

【チェック項目】
1. 誤字・脱字
2. 本文と画像の情報の一致
3. CSSの色情報に基づく状態判定（例: 緑=あり、グレー=なし）
4. レイアウトの崩れ

結果は以下のJSON形式で返してください：
[
  {
    "type": "誤字" | "情報誤り" | "レイアウト",
    "severity": "high" | "medium" | "low",
    "description": "具体的な説明",
    "location": "場所（オプション）",
    "imageIndex": 画像番号（オプション、0から始まる）
  }
]

問題がない場合は空の配列 [] を返してください。`
        },
        ...images.map((image) => ({
          type: 'image_url',
          image_url: {
            url: image.preview
          }
        }))
      ]
    }
  ];

  const response = await fetch('/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content;

  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('有効なJSON形式が見つかりません: ' + responseText);
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  const results = JSON.parse(jsonText);

  return results.map((result: any, index: number) => ({
    ...result,
    id: `result-${index}`
  }));
}