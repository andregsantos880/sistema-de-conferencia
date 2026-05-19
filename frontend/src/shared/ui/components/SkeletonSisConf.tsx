/**
 * Skeletons básicos do SisConf — independente do shadcn/ui Skeleton, evitando conflito de nomes.
 */
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />;
}

export function SkeletonLinhasTabela({ linhas = 5, colunas = 4 }: { linhas?: number; colunas?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: colunas }).map((_, j) => (
            <SkeletonBlock key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
