export function MatchRowSkeleton() {
  return (
    <div className="p-4 border-t border-border animate-pulse">
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="w-16 h-4 bg-bg-surface rounded" />
        <div className="w-12 h-4 bg-bg-surface rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-12 h-12 rounded-full bg-bg-surface" />
          <div className="w-20 h-4 bg-bg-surface rounded" />
        </div>
        <div className="flex flex-col items-center justify-center w-1/3 gap-2">
          <div className="w-16 h-6 bg-bg-surface rounded" />
          <div className="w-12 h-3 bg-bg-surface rounded-full" />
          <div className="w-16 h-3 bg-bg-surface rounded" />
        </div>
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-12 h-12 rounded-full bg-bg-surface" />
          <div className="w-20 h-4 bg-bg-surface rounded" />
        </div>
      </div>
    </div>
  )
}

export function TeamCardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-surface shrink-0" />
        <div className="flex-1">
          <div className="w-24 h-4 bg-bg-surface rounded mb-2" />
          <div className="w-16 h-3 bg-bg-surface rounded" />
        </div>
      </div>
    </div>
  )
}

export function StandingsRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border animate-pulse">
      <div className="w-6 h-6 bg-bg-surface rounded text-center text-xs" />
      <div className="w-8 h-8 rounded-full bg-bg-surface" />
      <div className="flex-1">
        <div className="w-24 h-4 bg-bg-surface rounded mb-1" />
        <div className="w-12 h-3 bg-bg-surface rounded" />
      </div>
      <div className="w-8 h-4 bg-bg-surface rounded" />
      <div className="w-8 h-4 bg-bg-surface rounded" />
      <div className="w-8 h-4 bg-bg-surface rounded" />
      <div className="w-8 h-4 bg-bg-surface rounded" />
    </div>
  )
}

export function ScorerRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border animate-pulse">
      <div className="w-6 h-6 bg-bg-surface rounded-full text-center text-xs" />
      <div className="w-10 h-10 rounded-full bg-bg-surface" />
      <div className="flex-1">
        <div className="w-28 h-4 bg-bg-surface rounded mb-1" />
        <div className="w-16 h-3 bg-bg-surface rounded" />
      </div>
      <div className="w-8 h-6 bg-bg-surface rounded" />
    </div>
  )
}
