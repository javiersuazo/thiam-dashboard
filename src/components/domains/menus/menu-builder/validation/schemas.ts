import { z } from 'zod'

export const courseItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  position: z.number().int().min(0),
  priceCents: z.number().int().min(0, 'Price must be positive'),
  isAvailable: z.boolean().default(true),
})

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Course name is required').max(100, 'Course name too long'),
  icon: z.string().optional(),
  position: z.number().int().min(0).optional(),
  items: z.array(courseItemSchema).default([]),
})

export const menuBuilderSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Menu name is required').max(200, 'Menu name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
  courses: z
    .array(courseSchema)
    .min(1, 'At least one course is required')
    .refine((courses) => courses.some((c) => c.items.length > 0), {
      message: 'At least one course must have items',
    }),
  isActive: z.boolean().default(false),
  pricingStrategy: z.enum(['fixed', 'sum-of-items']).default('sum-of-items'),
  fixedPriceCents: z.number().int().min(0).optional(),
})
  .refine(
    (data) => {
      if (data.pricingStrategy === 'fixed') {
        return data.fixedPriceCents !== undefined && data.fixedPriceCents > 0
      }
      return true
    },
    {
      message: 'Fixed price is required when using fixed pricing strategy',
      path: ['fixedPriceCents'],
    }
  )

export const menuMetadataSchema = z.object({
  name: z.string().min(1, 'Menu name is required').max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  leadTime: z.string().regex(/^\d+$/, 'Lead time must be a number'),
  cities: z.string().min(1, 'At least one city is required'),
  capacity: z.string().regex(/^\d+$/, 'Capacity must be a number'),
  tags: z.array(z.string()).max(10),
})

export type CourseItemInput = z.infer<typeof courseItemSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type MenuBuilderInput = z.infer<typeof menuBuilderSchema>
export type MenuMetadataInput = z.infer<typeof menuMetadataSchema>
