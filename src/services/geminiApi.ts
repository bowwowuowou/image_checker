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

【CSSルール】
- class="taglist" の ul 要素内の li 要素について：
  * class="tag" → グレー表示 = 「なし」を意味する
  * class="tag on" → 色付き表示 = 「あり」を意味する
- 画像内の表示色（グレー/色付き）と、このCSSクラスが一致しているか必ず確認してください

【チェック項目】
1. 誤字・脱字
2. 本文と画像の情報の一致
3. CSSの色情報に基づく状態判定（例: 緑=あり、グレー=なし）
4. レイアウトの崩れ
5. 画像内に使用されている写真は適切か

【ルール】
 - チェックは本文を正とし、画像の情報に誤りがないか確認する
 - 本文情報自体の正誤やHTML、CSSのレイアウト崩れは判定しない（画像の正誤やレイアウト崩れのみチェックする）
 - 画像内のチェックはグレー＝なし/その他の色（オレンジや緑など）＝ありで判定
 - HTMLに「noimage.png」がある箇所は、不一致としてエラーにしない(現在チェックしている画像が入る予定の箇所のため)
 - 画像は本文の一部を省略・簡略化して表示する場合があります。
    以下のケースはエラーとして報告しないでください：
    1. 本文に詳細情報があるが、画像では省略されている
      例：本文「ギフトバック（有料）」→ 画像「ギフトバック」
      → これは正常です。エラーにしないでください。
    2. 本文に補足説明があるが、画像では記載されていない
      例：本文に括弧書きや注釈があるが、画像にはない
      → これは正常です。エラーにしないでください。

【画像内のチェックマークについて】
- 各項目は「チェックマーク + 項目名」のペアになっています
- 必ず「項目名の直前にあるチェックマーク」を参照してください
- 横並びの場合、項目名とチェックマークの位置関係を正確に判断してください

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