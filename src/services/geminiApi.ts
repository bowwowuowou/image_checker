import type { CheckResult } from '../types';

export async function checkWithGemini(
  text: string,
  images: { preview: string; file: File }[],
  apiKey: string
): Promise<CheckResult[]> {

  const imageParts = images.map((image) => ({
    inline_data: {
      mime_type: image.file.type,
      data: image.preview.split(',')[1]
    }
  }));

  const response = await fetch(
    `/gemini/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `以下の本文（HTML/CSS含む）と画像を比較して、誤字・情報誤り・レイアウト崩れをチェックしてください。

【本文・HTML・CSS】
${text}

【チェック項目】
1. 誤字・脱字
2. 本文と画像の情報の一致
3. CSSの色情報に基づく状態判定（例: 緑=あり、グレー=なし）
4. レイアウトの崩れ

結果は以下のJSON形式のみで返してください（説明文は不要）：
[
  {
    "type": "誤字" | "情報誤り" | "レイアウト",
    "severity": "high" | "medium" | "low",
    "description": "具体的な説明",
    "location": "場所（オプション）",
    "imageIndex": 画像番号（オプション、0から始まる）
  }
]

問題がない場合は空の配列 [] を返してください。
必ずJSON配列のみを返し、前後に説明文を含めないでください。`
              },
              ...imageParts
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 8000,  // ← 増やした
          temperature: 0.1
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;

  // JSON抽出（改善版）
  let jsonText = '';
  const codeBlockMatch = responseText.match(/```json\n([\s\S]*?)(\n```|$)/);
  const arrayMatch = responseText.match(/\[[\s\S]*/);

  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  } else if (arrayMatch) {
    jsonText = arrayMatch[0];
  } else {
    throw new Error('有効なJSON形式が見つかりません: ' + responseText);
  }

  // 末尾が不完全な場合は修復
  try {
    JSON.parse(jsonText);
  } catch {
    const lastComplete = jsonText.lastIndexOf('},');
    if (lastComplete !== -1) {
      jsonText = jsonText.substring(0, lastComplete + 1) + ']';
    } else {
      throw new Error('JSONの修復に失敗しました');
    }
  }

  const results = JSON.parse(jsonText);

  return results.map((result: any, index: number) => ({
    ...result,
    id: `result-${index}`
  }));
}