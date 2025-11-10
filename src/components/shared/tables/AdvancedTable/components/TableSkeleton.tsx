'use client'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 10, columns = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr
          key={rowIdx}
          className="border-b border-gray-100 dark:border-white/[0.05] animate-pulse"
          style={{
            animationDelay: `${rowIdx * 50}ms`,
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td
              key={colIdx}
              className="px-4 py-4 border border-gray-100 dark:border-white/[0.05]"
            >
              <div
                className="h-4 rounded bg-gray-200 dark:bg-gray-800"
                style={{
                  width:
                    colIdx === 0
                      ? '60px'
                      : colIdx === 1
                        ? '75%'
                        : colIdx === columns - 1
                          ? '40px'
                          : '50%',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
