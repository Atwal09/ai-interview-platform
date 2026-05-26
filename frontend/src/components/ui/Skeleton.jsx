const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
  className = '',
  count = 1,
}) => {
  const bars = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {bars.map((i) => (
        <div
          key={i}
          className={`
            shimmer
            ${width}
            ${height}
            ${rounded}
            ${count > 1 ? 'mb-2' : ''}
            ${className}
          `}
        />
      ))}
    </>
  )
}

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="shimmer w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <div className="shimmer w-3/4 h-4 rounded-lg mb-2" />
        <div className="shimmer w-1/2 h-3 rounded-lg" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="shimmer w-full h-3 rounded" />
      <div className="shimmer w-5/6 h-3 rounded" />
      <div className="shimmer w-4/6 h-3 rounded" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="shimmer h-4 rounded-lg" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-4 py-3 border-b border-white/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="shimmer h-3 rounded-lg" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonStat = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="shimmer w-10 h-10 rounded-xl" />
      <div className="shimmer w-16 h-5 rounded-lg" />
    </div>
    <div className="shimmer w-24 h-8 rounded-lg mb-2" />
    <div className="shimmer w-32 h-3 rounded-lg" />
  </div>
)

export default Skeleton
