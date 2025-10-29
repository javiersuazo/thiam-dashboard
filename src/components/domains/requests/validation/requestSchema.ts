/**
 * Request Domain Validation
 *
 * Zod schemas for validating request data.
 * Used in forms and API calls.
 */

import { z } from 'zod'

/**
 * Location schema
 */
const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

/**
 * Request Form Schema
 * Validates create/edit request forms
 */
export const requestFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  eventDate: z
    .string()
    .refine((date) => new Date(date) > new Date(), {
      message: 'Event date must be in the future',
    }),

  guestCount: z
    .number()
    .min(1, 'Must have at least 1 guest')
    .max(10000, 'Maximum 10,000 guests'),

  eventType: z.enum(['corporate', 'wedding', 'birthday', 'conference', 'other']),

  dietaryRequirements: z.array(z.string()).optional(),

  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),

  location: locationSchema,
})

/**
 * Request Filter Schema
 * Validates filter params
 */
export const requestFilterSchema = z.object({
  status: z.array(z.enum(['draft', 'pending', 'active', 'completed', 'cancelled'])).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().uuid().optional(),
  minGuestCount: z.number().positive().optional(),
  maxGuestCount: z.number().positive().optional(),
  searchQuery: z.string().optional(),
})

/**
 * Request Update Schema
 * Partial version for updates
 */
export const requestUpdateSchema = requestFormSchema.partial()

// Export types inferred from schemas
export type RequestFormInput = z.infer<typeof requestFormSchema>
export type RequestFilterInput = z.infer<typeof requestFilterSchema>
export type RequestUpdateInput = z.infer<typeof requestUpdateSchema>
