import type { CheckResult } from '../types';

interface ResultDisplayProps {
  results: CheckResult[];
  isChecking: boolean;
}

export function ResultDisplay({ results, isChecking }: ResultDisplayProps) {
  if (isChecking) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">チェック中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  // 重要度別に分類
  const highIssues = results.filter(r => r.severity === 'high');
  const mediumIssues = results.filter(r => r.severity === 'medium');
  const lowIssues = results.filter(r => r.severity === 'low');

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-bold mb-4">チェック結果</h2>
      
      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 font-medium">重大</p>
          <p className="text-2xl font-bold text-red-700">{highIssues.length}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">中程度</p>
          <p className="text-2xl font-bold text-yellow-700">{mediumIssues.length}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">軽微</p>
          <p className="text-2xl font-bold text-blue-700">{lowIssues.length}</p>
        </div>
      </div>

      {/* 問題一覧 */}
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className={`p-4 rounded-lg border-l-4 ${
              result.severity === 'high'
                ? 'bg-red-50 border-red-500'
                : result.severity === 'medium'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                    {result.type}
                  </span>
                  {result.location && (
                    <span className="text-xs">{result.location}</span>
                  )}
                  {result.imageIndex !== undefined && (
                    <span className="text-xs">
                      画像{result.imageIndex + 1}
                    </span>
                  )}
                </div>
                <p className="text-gray-800">{result.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}