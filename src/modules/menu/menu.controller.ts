import { Request, Response, NextFunction } from 'express';
import { MenuService } from './menu.service';
import { ApiResponse } from '../../types/common.types';

export class MenuController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Menu module initialized (Live Supabase Data Layer)',
      timestamp: new Date().toISOString()
    });
  }

  public static async getCategories(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const categories = await MenuService.getCategories();
      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getItems(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.query.category_id as string | undefined;
      const search = req.query.search as string | undefined;
      const availableOnly = req.query.all === 'true' ? false : true;

      const items = await MenuService.getItems(categoryId, search, availableOnly);
      res.json({
        success: true,
        data: items,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getItemById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await MenuService.getItemById(id);
      if (!item) {
        res.status(404).json({
          success: false,
          message: `Menu item '${id}' not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }
      res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateItemAvailability(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      if (typeof isAvailable !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isAvailable must be a boolean',
          timestamp: new Date().toISOString()
        });
        return;
      }
      const updated = await MenuService.updateItemAvailability(id, isAvailable);
      res.json({
        success: true,
        message: 'Item availability updated successfully',
        data: updated,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createItem(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { name, category_id, base_price, is_veg, description, image_path, is_available } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Item name is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      if (!category_id) {
        res.status(400).json({
          success: false,
          message: 'Category is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      if (base_price === undefined || isNaN(Number(base_price)) || Number(base_price) < 0) {
        res.status(400).json({
          success: false,
          message: 'Valid base price is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const created = await MenuService.createItem({
        name,
        category_id,
        base_price: Number(base_price),
        is_veg: is_veg !== undefined ? Boolean(is_veg) : true,
        description,
        image_path,
        is_available: is_available !== undefined ? Boolean(is_available) : true
      });

      res.status(201).json({
        success: true,
        message: `Menu item '${created.name}' created successfully`,
        data: created,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateItem(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, category_id, base_price, is_veg, description, image_path, is_available } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (category_id !== undefined) updateData.category_id = category_id;
      if (base_price !== undefined) updateData.base_price = Number(base_price);
      if (is_veg !== undefined) updateData.is_veg = Boolean(is_veg);
      if (description !== undefined) updateData.description = description;
      if (image_path !== undefined) updateData.image_path = image_path;
      if (is_available !== undefined) updateData.is_available = Boolean(is_available);

      const updated = await MenuService.updateItem(id, updateData);
      res.json({
        success: true,
        message: `Menu item '${updated.name}' updated successfully`,
        data: updated,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createCategory(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { name, slug, display_order } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Category name is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const created = await MenuService.createCategory({
        name: name.trim(),
        slug,
        display_order: display_order ? Number(display_order) : undefined
      });

      res.status(201).json({
        success: true,
        message: `Category '${created.name}' created successfully`,
        data: created,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCategory(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug, display_order, is_active } = req.body;

      const updated = await MenuService.updateCategory(id, {
        name,
        slug,
        display_order: display_order !== undefined ? Number(display_order) : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined
      });

      res.json({
        success: true,
        message: `Category '${updated.name}' updated successfully`,
        data: updated,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
