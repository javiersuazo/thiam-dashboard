import type { MenuItem, MenuBuilder, Course, CourseItem } from '../types'
import type { MenuBuilderResponse } from '../api/menuBuilder.service'

type ApiMenuItem = Record<string, unknown>
type ApiCourse = Record<string, unknown>
type ApiCourseItem = Record<string, unknown>
type ApiMenuRequest = Record<string, unknown>

export const menuBuilderAdapter = {
  toMenuItem(apiItem: ApiMenuItem): MenuItem {
    return {
      id: apiItem.id as string,
      name: apiItem.name as string,
      description: (apiItem.description as string | null | undefined) || undefined,
      category: apiItem.category as string,
      dietaryTags: (apiItem.dietaryTags as string[] | null | undefined) || undefined,
      ingredients: (apiItem.ingredients as string[] | null | undefined) || undefined,
      priceCents: apiItem.priceCents as number,
      currency: apiItem.currency as string,
      imageUrl: (apiItem.imageUrl as string | null | undefined) || undefined,
      isAvailable: apiItem.isAvailable as boolean,
    }
  },

  toMenuItems(apiItems: ApiMenuItem[]): MenuItem[] {
    return apiItems.map(item => this.toMenuItem(item))
  },

  toCourse(apiCourse: ApiCourse): Course {
    return {
      id: apiCourse.id as string,
      name: apiCourse.name as string,
      icon: apiCourse.icon as string,
      position: apiCourse.position as number,
      items: (apiCourse.items as ApiCourseItem[]).map((item) => this.toCourseItem(item)),
      isCollapsed: false,
    }
  },

  toCourseItem(apiItem: ApiCourseItem): CourseItem {
    return {
      menuItemId: apiItem.menuItemId as string,
      position: apiItem.position as number,
      priceCents: apiItem.priceCents as number,
      isAvailable: apiItem.isAvailable as boolean,
    }
  },

  toMenuBuilder(apiMenu: MenuBuilderResponse): MenuBuilder {
    return {
      id: apiMenu.id,
      name: apiMenu.name,
      description: apiMenu.description || undefined,
      imageUrl: apiMenu.imageUrl || undefined,
      availableFrom: apiMenu.availableFrom || undefined,
      availableTo: apiMenu.availableTo || undefined,
      tags: apiMenu.tags || undefined,
      courses: apiMenu.courses.map(course => this.toCourse(course)),
      isActive: apiMenu.isActive,
      pricingStrategy: apiMenu.pricingStrategy,
      fixedPriceCents: apiMenu.fixedPriceCents || undefined,
    }
  },

  toMenuBuilders(apiMenus: MenuBuilderResponse[]): MenuBuilder[] {
    return apiMenus.map(menu => this.toMenuBuilder(menu))
  },

  fromMenuBuilder(menu: MenuBuilder): ApiMenuRequest {
    return {
      id: menu.id,
      name: menu.name,
      description: menu.description || null,
      imageUrl: menu.imageUrl || null,
      availableFrom: menu.availableFrom || null,
      availableTo: menu.availableTo || null,
      tags: menu.tags || null,
      courses: menu.courses.map(course => this.fromCourse(course)),
      isActive: menu.isActive,
      pricingStrategy: menu.pricingStrategy || 'sum-of-items',
      fixedPriceCents: menu.fixedPriceCents || null,
    }
  },

  fromCourse(course: Course): ApiCourse {
    return {
      id: course.id,
      name: course.name,
      icon: course.icon,
      items: course.items.map(item => this.fromCourseItem(item)),
    }
  },

  fromCourseItem(item: CourseItem): ApiCourseItem {
    return {
      menuItemId: item.menuItemId,
      position: item.position,
      priceCents: item.priceCents || 0,
      isAvailable: item.isAvailable,
    }
  },
}
