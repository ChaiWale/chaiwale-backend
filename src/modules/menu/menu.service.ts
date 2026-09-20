import { MenuRepository, CategoryRecord, MenuItemRecord } from './menu.repository';

export class MenuService {
  public static async getCategories(): Promise<CategoryRecord[]> {
    return MenuRepository.getCategories();
  }

  public static async getItems(categoryId?: string, search?: string, availableOnly = true): Promise<MenuItemRecord[]> {
    return MenuRepository.getItems(categoryId, search, availableOnly);
  }

  public static async getItemById(id: string): Promise<MenuItemRecord | null> {
    return MenuRepository.getItemById(id);
  }

  public static async updateItemAvailability(id: string, isAvailable: boolean): Promise<MenuItemRecord> {
    return MenuRepository.updateItemAvailability(id, isAvailable);
  }

  public static async createItem(input: {
    category_id: string;
    slug?: string;
    name: string;
    description?: string | null;
    base_price: number;
    is_veg?: boolean;
    is_egg?: boolean;
    spice_level?: string;
    tags?: string[];
    image_path?: string | null;
    is_available?: boolean;
    variants?: Array<{ name: string; price: number; is_available?: boolean }>;
  }): Promise<MenuItemRecord> {
    const slug =
      input.slug && input.slug.trim()
        ? input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
          '-' +
          Math.floor(1000 + Math.random() * 9000);

    return MenuRepository.createItem({
      category_id: input.category_id,
      slug,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      base_price: Number(input.base_price),
      is_veg: input.is_veg !== undefined ? input.is_veg : true,
      is_egg: input.is_egg !== undefined ? input.is_egg : false,
      spice_level: input.spice_level || 'NONE',
      tags: input.tags || [],
      image_path: input.image_path || null,
      is_available: input.is_available !== undefined ? input.is_available : true,
      variants: input.variants
    });
  }

  public static async updateItem(
    id: string,
    input: Partial<{
      category_id: string;
      slug: string;
      name: string;
      description: string | null;
      base_price: number;
      is_veg: boolean;
      is_egg: boolean;
      spice_level: string;
      tags: string[];
      image_path: string | null;
      is_available: boolean;
      variants: Array<{ id?: string; name: string; price: number; is_available?: boolean }>;
    }>
  ): Promise<MenuItemRecord> {
    const payload: any = { ...input };
    if (payload.base_price !== undefined) {
      payload.base_price = Number(payload.base_price);
    }
    if (payload.name) {
      payload.name = payload.name.trim();
    }
    return MenuRepository.updateItem(id, payload);
  }

  public static async createCategory(input: {
    name: string;
    slug?: string;
    display_order?: number;
  }): Promise<CategoryRecord> {
    const slug =
      input.slug && input.slug.trim()
        ? input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return MenuRepository.createCategory({
      name: input.name.trim(),
      slug,
      display_order: input.display_order
    });
  }

  public static async updateCategory(
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      display_order: number;
      is_active: boolean;
    }>
  ): Promise<CategoryRecord> {
    const payload = { ...input };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.slug) payload.slug = payload.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return MenuRepository.updateCategory(id, payload);
  }
}
