import { cn } from '@/shared/lib/utils'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'

interface Column<T> {
  key: string
  header: string
  width?: number
  render?: (item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string
  className?: string
  headerClassName?: string
  rowClassName?: string
  cellClassName?: string
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
}: TableProps<T>) {
  const alignmentStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className={cn('min-w-full', className)}>
        <View className={cn('flex-row bg-muted border-b border-border', headerClassName)}>
          {columns.map((column) => (
            <View
              key={column.key}
              className={cn('px-4 py-3', cellClassName)}
              style={{ width: column.width ?? 120 }}
            >
              <Text
                className={cn(
                  'text-sm font-semibold text-muted-foreground',
                  alignmentStyles[column.align ?? 'left'],
                )}
              >
                {column.header}
              </Text>
            </View>
          ))}
        </View>

        {data.map((item, index) => (
          <View
            key={keyExtractor(item, index)}
            className={cn(
              'flex-row border-b border-border',
              index % 2 === 0 ? 'bg-background' : 'bg-muted/30',
              rowClassName,
            )}
          >
            {columns.map((column) => (
              <View
                key={column.key}
                className={cn('px-4 py-3 justify-center', cellClassName)}
                style={{ width: column.width ?? 120 }}
              >
                {column.render ? (
                  column.render(item, index)
                ) : (
                  <Text
                    className={cn(
                      'text-sm text-foreground',
                      alignmentStyles[column.align ?? 'left'],
                    )}
                  >
                    {String((item as Record<string, unknown>)[column.key] ?? '')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {data.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground">No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
