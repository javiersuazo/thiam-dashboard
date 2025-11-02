import { ICartRepository } from '../repositories/ICartRepository'
import { Cart, CartItem, Product } from '../types/domain'

export class CartService {
  constructor(private readonly repository: ICartRepository) {}

  async getCart(): Promise<Cart> {
    return this.repository.get()
  }

  async addToCart(product: Product, quantity: number = 1): Promise<Cart> {
    const validQuantity = Math.max(product.minOrder || 1, quantity)

    const item: CartItem = {
      product,
      quantity: validQuantity,
      subtotal: product.price * validQuantity,
    }

    return this.repository.add(item)
  }

  async removeFromCart(productId: string): Promise<Cart> {
    return this.repository.remove(productId)
  }

  async updateQuantity(productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) {
      return this.repository.remove(productId)
    }

    return this.repository.updateQuantity(productId, quantity)
  }

  async clearCart(): Promise<Cart> {
    return this.repository.clear()
  }

  async getItemCount(): Promise<number> {
    const cart = await this.repository.get()
    return cart.itemCount
  }

  async getTotal(): Promise<number> {
    const cart = await this.repository.get()
    return cart.total
  }

  isProductInCart(cart: Cart, productId: string): boolean {
    return cart.items.some((item) => item.product.id === productId)
  }

  getProductQuantity(cart: Cart, productId: string): number {
    const item = cart.items.find((item) => item.product.id === productId)
    return item?.quantity || 0
  }
}
