'use client'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 10, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 px-4 py-3 border-b border-gray-100 dark:border-white/[0.05]"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1"
              style={{ minWidth: colIndex === 0 ? '50px' : '100px' }}
            >
              <div
                className={`h-4 bg-gray-200 dark:bg-gray-800 rounded ${
                  colIndex === 0 ? 'w-8' : 'w-full'
                }`}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
