import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { Course, CourseItem, MenuItem, PricingStrategy } from '../types'
import { DEFAULT_COURSES } from '../types'

interface UseMenuBuilderStateProps {
  initialName?: string
  initialCourses?: Course[]
  initialPricingStrategy?: PricingStrategy
  initialFixedPrice?: number
  initialIsActive?: boolean
  availableItems: MenuItem[]
}

export function useMenuBuilderState({
  initialName = 'Untitled Menu',
  initialCourses,
  initialPricingStrategy = 'sum-of-items',
  initialFixedPrice,
  initialIsActive = false,
  availableItems,
}: UseMenuBuilderStateProps) {
  const [name, setName] = useState(initialName)
  const [courses, setCourses] = useState<Course[]>(
    initialCourses ||
      DEFAULT_COURSES.map((course, index) => ({
        ...course,
        id: `course-${index}`,
        items: [],
      }))
  )
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>(initialPricingStrategy)
  const [fixedPriceCents, setFixedPriceCents] = useState<number | undefined>(initialFixedPrice)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [targetCourseId, setTargetCourseId] = useState<string>(courses[0]?.id || '')
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ courseId: string; itemId: string } | null>(null)

  const courseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const getCourseIdForCategory = useCallback(
    (category: string): string => {
      const categoryToCourse: { [key: string]: string } = {
        appetizers: courses.find((c) => c.name.toLowerCase().includes('appetizer'))?.id || courses[0]?.id,
        soups: courses.find((c) => c.name.toLowerCase().includes('soup'))?.id || courses[0]?.id,
        salads: courses.find((c) => c.name.toLowerCase().includes('salad'))?.id || courses[0]?.id,
        mains: courses.find((c) => c.name.toLowerCase().includes('main'))?.id || courses[2]?.id,
        sides: courses.find((c) => c.name.toLowerCase().includes('side'))?.id || courses[3]?.id,
        desserts: courses.find((c) => c.name.toLowerCase().includes('dessert'))?.id || courses[4]?.id,
        beverages: courses.find((c) => c.name.toLowerCase().includes('beverage'))?.id || courses[5]?.id,
      }

      return categoryToCourse[category.toLowerCase()] || targetCourseId || courses[0]?.id
    },
    [courses, targetCourseId]
  )

  const addItem = useCallback(
    (item: MenuItem) => {
      const destinationCourseId = getCourseIdForCategory(item.category)
      if (!destinationCourseId) return

      const rowId = `${destinationCourseId}-${item.id}`

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== destinationCourseId) return course

          const alreadyExists = course.items.some((ci) => ci.menuItemId === item.id)
          if (alreadyExists) {
            toast.info('Item already in this course')
            return course
          }

          const newItem: CourseItem = {
            menuItemId: item.id,
            position: course.items.length,
            priceCents: item.priceCents,
            isAvailable: item.isAvailable,
          }

          return {
            ...course,
            items: [...course.items, newItem],
          }
        })
      )

      setTargetCourseId(destinationCourseId)

      setTimeout(() => {
        courseRefs.current[destinationCourseId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedRow(rowId)
        setTimeout(() => setHighlightedRow(null), 1000)
      }, 50)

      const courseName = courses.find((c) => c.id === destinationCourseId)?.name || 'course'
      toast.success(`Added ${item.name} to ${courseName}`)

      return destinationCourseId
    },
    [courses, getCourseIdForCategory]
  )

  const removeItem = useCallback((courseId: string, menuItemId: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course
        return {
          ...course,
          items: course.items
            .filter((item) => item.menuItemId !== menuItemId)
            .map((item, index) => ({ ...item, position: index })),
        }
      })
    )
  }, [])

  const duplicateItem = useCallback(
    (courseId: string, menuItemId: string) => {
      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== courseId) return course

          const itemToDuplicate = course.items.find((item) => item.menuItemId === menuItemId)
          if (!itemToDuplicate) return course

          const newItem: CourseItem = {
            ...itemToDuplicate,
            position: course.items.length,
          }

          return {
            ...course,
            items: [...course.items, newItem],
          }
        })
      )

      const menuItem = availableItems.find((mi) => mi.id === menuItemId)
      const courseName = courses.find((c) => c.id === courseId)?.name || 'course'
      toast.success(`Duplicated ${menuItem?.name} in ${courseName}`)
    },
    [availableItems, courses]
  )

  const updateItemPrice = useCallback((courseId: string, menuItemId: string, newPriceCents: number) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course
        return {
          ...course,
          items: course.items.map((item) =>
            item.menuItemId === menuItemId ? { ...item, priceCents: newPriceCents } : item
          ),
        }
      })
    )
  }, [])

  const moveItemBetweenCourses = useCallback(
    (sourceCourseId: string, targetCourseId: string, menuItemId: string) => {
      if (sourceCourseId === targetCourseId) return

      const sourceCourse = courses.find((c) => c.id === sourceCourseId)
      const draggedCourseItem = sourceCourse?.items.find((i) => i.menuItemId === menuItemId)

      if (!draggedCourseItem) return

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id === sourceCourseId) {
            return {
              ...course,
              items: course.items
                .filter((item) => item.menuItemId !== menuItemId)
                .map((item, index) => ({ ...item, position: index })),
            }
          }

          if (course.id === targetCourseId) {
            const alreadyExists = course.items.some((ci) => ci.menuItemId === menuItemId)
            if (alreadyExists) {
              toast.info('Item already in this course')
              return course
            }

            return {
              ...course,
              items: [...course.items, { ...draggedCourseItem, position: course.items.length }],
            }
          }

          return course
        })
      )

      const targetCourseName = courses.find((c) => c.id === targetCourseId)?.name
      const menuItem = availableItems.find((mi) => mi.id === menuItemId)

      toast.success(`Moved ${menuItem?.name} to ${targetCourseName}`)
    },
    [courses, availableItems]
  )

  const getTotalItems = useCallback(() => {
    return courses.reduce((sum, course) => sum + course.items.length, 0)
  }, [courses])

  const getTotalPrice = useCallback(() => {
    if (pricingStrategy === 'fixed') {
      return fixedPriceCents || 0
    }

    return courses.reduce((total, course) => {
      return (
        total +
        course.items.reduce((courseTotal, item) => {
          const menuItem = availableItems.find((mi) => mi.id === item.menuItemId)
          return courseTotal + (item.priceCents || menuItem?.priceCents || 0)
        }, 0)
      )
    }, 0)
  }, [courses, pricingStrategy, fixedPriceCents, availableItems])

  const getCourseSubtotal = useCallback(
    (courseId: string) => {
      const course = courses.find((c) => c.id === courseId)
      if (!course) return 0
      return course.items.reduce((total, item) => {
        const menuItem = availableItems.find((mi) => mi.id === item.menuItemId)
        return total + (item.priceCents || menuItem?.priceCents || 0)
      }, 0)
    },
    [courses, availableItems]
  )

  return {
    name,
    setName,
    courses,
    setCourses,
    pricingStrategy,
    setPricingStrategy,
    fixedPriceCents,
    setFixedPriceCents,
    isActive,
    setIsActive,
    targetCourseId,
    setTargetCourseId,
    highlightedRow,
    setHighlightedRow,
    draggedItem,
    setDraggedItem,
    courseRefs,
    addItem,
    removeItem,
    duplicateItem,
    updateItemPrice,
    moveItemBetweenCourses,
    getTotalItems,
    getTotalPrice,
    getCourseSubtotal,
  }
}
