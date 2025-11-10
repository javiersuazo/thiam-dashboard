import { Cart, CartItem } from '../types/domain'

export interface ICartRepository {
  get(): Promise<Cart>

  add(item: CartItem): Promise<Cart>

  remove(productId: string): Promise<Cart>

  updateQuantity(productId: string, quantity: number): Promise<Cart>

  clear(): Promise<Cart>
}
