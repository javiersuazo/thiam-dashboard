import { z } from 'zod'

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  currency: z.string().default('EUR'),
  category: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  availability: z.enum(['available', 'unavailable', 'limited']),
  stock: z.number().int().nonnegative().optional(),
  minOrder: z.number().int().positive().optional(),
  maxOrder: z.number().int().positive().optional(),
  preparationTime: z.string().optional(),
  catererId: z.string(),
  catererName: z.string(),
  catererLogo: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
})

export const cartItemSchema = z.object({
  product: productSchema,
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
})

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export const commonFieldSchemas = {
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' }),
  text: z.string().min(1, { message: 'This field is required' }),
  textarea: z.string().min(1, { message: 'This field is required' }),
  number: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Invalid time format' }),
  checkbox: z.boolean(),
  select: z.string().min(1, { message: 'Please select an option' }),
  radio: z.string().min(1, { message: 'Please select an option' }),
}

export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  additionalInfo: z.string().optional(),
})

export function buildFieldValidation(type: string, required: boolean = false, customSchema?: z.ZodType) {
  if (customSchema) return customSchema

  const baseSchema = commonFieldSchemas[type as keyof typeof commonFieldSchemas] || commonFieldSchemas.text

  if (!required && 'optional' in baseSchema) {
    return (baseSchema as any).optional()
  }

  return baseSchema
}
