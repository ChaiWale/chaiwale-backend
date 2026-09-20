import { getSupabaseClient, getSupabaseAdminClient } from '../../config/supabase.config';

export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItemVariantRecord {
  id?: string;
  menu_item_id?: string;
  name: string;
  price: number;
  is_available?: boolean;
  created_at?: string;
}

export interface MenuItemRecord {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  is_veg: boolean;
  is_egg?: boolean;
  spice_level?: string;
  tags?: string[];
  image_path: string | null;
  is_available: boolean;
  variants?: MenuItemVariantRecord[];
  created_at?: string;
  updated_at?: string;
}

export class MenuRepository {
  /**
   * Fetch all active menu categories ordered by display_order from Supabase
   */
  public static async getCategories(): Promise<CategoryRecord[]> {
    const client = getSupabaseClient() || getSupabaseAdminClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await client
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching categories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch menu items from Supabase with optional category, search filtering and variants
   */
  public static async getItems(categoryId?: string, search?: string, availableOnly = true): Promise<MenuItemRecord[]> {
    const client = getSupabaseClient() || getSupabaseAdminClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    let query = client.from('menu_items').select('*, variants:menu_item_variants(*)');

    if (availableOnly) {
      query = query.eq('is_available', true);
    }

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    query = query.order('name', { ascending: true }).limit(100);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Database error fetching items: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      ...item,
      variants: Array.isArray(item.variants) ? item.variants : []
    }));
  }

  /**
   * Fetch single item by ID or slug with variants
   */
  public static async getItemById(id: string): Promise<MenuItemRecord | null> {
    const client = getSupabaseClient() || getSupabaseAdminClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await client
      .from('menu_items')
      .select('*, variants:menu_item_variants(*)')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching item ${id}: ${error.message}`);
    }

    if (!data) return null;
    return {
      ...data,
      variants: Array.isArray(data.variants) ? data.variants : []
    };
  }

  /**
   * Update item availability (Admin operation)
   */
  public static async updateItemAvailability(id: string, isAvailable: boolean): Promise<MenuItemRecord> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const { data, error } = await admin
      .from('menu_items')
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, variants:menu_item_variants(*)')
      .single();

    if (error) {
      throw new Error(`Database error updating item availability: ${error.message}`);
    }

    return {
      ...data,
      variants: Array.isArray(data.variants) ? data.variants : []
    };
  }

  /**
   * Create a new menu item with optional variants (Admin operation)
   */
  public static async createItem(input: {
    category_id: string;
    slug: string;
    name: string;
    description?: string | null;
    base_price: number;
    is_veg: boolean;
    is_egg?: boolean;
    spice_level?: string;
    tags?: string[];
    image_path?: string | null;
    is_available?: boolean;
    variants?: Array<{ name: string; price: number; is_available?: boolean }>;
  }): Promise<MenuItemRecord> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const insertPayload: Record<string, any> = {
      category_id: input.category_id,
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      base_price: input.base_price,
      is_veg: input.is_veg !== undefined ? input.is_veg : true,
      is_egg: input.is_egg !== undefined ? input.is_egg : false,
      spice_level: input.spice_level || 'NONE',
      tags: input.tags || [],
      image_path: input.image_path || null,
      is_available: input.is_available !== undefined ? input.is_available : true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await admin
      .from('menu_items')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error creating menu item: ${error.message}`);
    }

    let insertedVariants: MenuItemVariantRecord[] = [];
    if (input.variants && input.variants.length > 0) {
      const variantRows = input.variants.map((v) => ({
        menu_item_id: data.id,
        name: v.name.trim(),
        price: Number(v.price),
        is_available: v.is_available !== undefined ? v.is_available : true
      }));

      const { data: vData, error: vError } = await admin
        .from('menu_item_variants')
        .insert(variantRows)
        .select();

      if (!vError && vData) {
        insertedVariants = vData;
      }
    }

    return {
      ...data,
      variants: insertedVariants
    };
  }

  /**
   * Update menu item details and sync variants (Admin operation)
   */
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
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const { variants, ...fieldsToUpdate } = input;

    const updatePayload: Record<string, any> = {
      ...fieldsToUpdate,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await admin
      .from('menu_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error updating menu item: ${error.message}`);
    }

    // Sync variants if explicitly provided
    if (variants !== undefined) {
      // 1. Delete existing variants
      await admin.from('menu_item_variants').delete().eq('menu_item_id', id);

      // 2. Insert new variants if any
      if (variants.length > 0) {
        const variantRows = variants.map((v) => ({
          menu_item_id: id,
          name: v.name.trim(),
          price: Number(v.price),
          is_available: v.is_available !== undefined ? v.is_available : true
        }));
        await admin.from('menu_item_variants').insert(variantRows);
      }
    }

    // Fetch fresh item with variants
    const fresh = await this.getItemById(id);
    return fresh || data;
  }

  /**
   * Create a new menu category (Admin operation)
   */
  public static async createCategory(input: {
    name: string;
    slug: string;
    display_order?: number;
  }): Promise<CategoryRecord> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const { data, error } = await admin
      .from('menu_categories')
      .insert({
        name: input.name,
        slug: input.slug,
        display_order: input.display_order ?? 99,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error creating category: ${error.message}`);
    }

    return data;
  }

  /**
   * Update category details (Admin operation)
   */
  public static async updateCategory(
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      display_order: number;
      is_active: boolean;
    }>
  ): Promise<CategoryRecord> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const { data, error } = await admin
      .from('menu_categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error updating category: ${error.message}`);
    }

    return data;
  }
}

