import { Request, Response, NextFunction } from 'express';
import { KhataRepository } from './khata.repository';
import { ApiResponse } from '../../types/common.types';

export class KhataController {
  public static async getOffices(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const offices = await KhataRepository.getOffices();
      res.json({
        success: true,
        data: offices,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createOffice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { name, phone, company_name, floor_unit, notes, client_pin } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Office or Client name is required', timestamp: new Date().toISOString() });
        return;
      }
      if (!phone || !phone.trim()) {
        res.status(400).json({ success: false, message: 'Mobile or WhatsApp number is required', timestamp: new Date().toISOString() });
        return;
      }
      const office = await KhataRepository.createOffice({ name, phone, company_name, floor_unit, notes, client_pin });
      res.status(201).json({ success: true, message: `Office account '${office.name}' created successfully (PIN: ${office.client_pin})`, data: office, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  public static async addEntry(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { office_id, date, item_name, quantity, unit_price, notes } = req.body;
      if (!office_id) { res.status(400).json({ success: false, message: 'Office ID is required', timestamp: new Date().toISOString() }); return; }
      if (!item_name || !item_name.trim()) { res.status(400).json({ success: false, message: 'Item name is required', timestamp: new Date().toISOString() }); return; }
      if (!quantity || Number(quantity) <= 0) { res.status(400).json({ success: false, message: 'Valid quantity is required', timestamp: new Date().toISOString() }); return; }
      if (unit_price === undefined || Number(unit_price) < 0) { res.status(400).json({ success: false, message: 'Valid unit price is required', timestamp: new Date().toISOString() }); return; }
      const entry = await KhataRepository.addEntry({ office_id, date: date || new Date().toISOString().split('T')[0], item_name, quantity: Number(quantity), unit_price: Number(unit_price), notes });
      res.status(201).json({ success: true, message: `Added ${entry.quantity}x ${entry.item_name} to Khata`, data: entry, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteEntry(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await KhataRepository.deleteEntry(id);
      if (!deleted) { res.status(404).json({ success: false, message: `Entry with id '${id}' not found`, timestamp: new Date().toISOString() }); return; }
      res.json({ success: true, message: 'Khata entry deleted successfully', timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  public static async addPayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { office_id, date, amount, payment_mode, notes } = req.body;
      if (!office_id) { res.status(400).json({ success: false, message: 'Office ID is required', timestamp: new Date().toISOString() }); return; }
      if (!amount || Number(amount) <= 0) { res.status(400).json({ success: false, message: 'Valid payment amount is required', timestamp: new Date().toISOString() }); return; }
      const payment = await KhataRepository.addPayment({ office_id, date: date || new Date().toISOString().split('T')[0], amount: Number(amount), payment_mode: payment_mode || 'CASH', notes });
      res.status(201).json({ success: true, message: `Payment of ₹${payment.amount} recorded`, data: payment, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  public static async getOfficeStatement(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { officeId } = req.params;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const statement = await KhataRepository.getOfficeStatement(officeId, startDate, endDate);
      res.json({ success: true, data: statement, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUBLIC — Customer bill self-lookup using phone number + PIN
   * No authentication required. Only shows balance due and recent entries.
   */
  public static async customerLookup(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { phone, pin } = req.body as { phone?: string; pin?: string };
      if (!phone || !pin) {
        res.status(400).json({ success: false, message: 'Phone number and PIN are required', timestamp: new Date().toISOString() });
        return;
      }
      const result = await KhataRepository.customerLookup(phone.trim(), pin.trim().toUpperCase());
      if (!result) {
        res.status(404).json({ success: false, message: 'No account found. Please check your phone number and PIN.', timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  /**
   * ADMIN — Set or regenerate a client PIN for an office account
   */
  public static async setClientPin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { pin } = req.body as { pin?: string };
      // If no pin provided, generate one
      const clientPin = pin ? pin.trim().toUpperCase() : KhataController.generatePin();
      const updated = await KhataRepository.setClientPin(id, clientPin);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Office account not found', timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, message: `Client PIN set to ${clientPin}`, data: { pin: clientPin }, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  /**
   * ADMIN — Update office details
   */
  public static async updateOffice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, company_name, floor_unit, notes } = req.body;
      const updated = await KhataRepository.updateOffice(id, { name, phone, company_name, floor_unit, notes });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Office account not found', timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, message: 'Office details updated successfully', data: updated, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  /**
   * ADMIN — Delete office account
   */
  public static async deleteOffice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await KhataRepository.deleteOffice(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Office account not found', timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, message: 'Office account and records deleted successfully', timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  /**
   * ADMIN — Delete a payment entry
   */
  public static async deletePayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await KhataRepository.deletePayment(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Payment record not found', timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, message: 'Payment entry removed successfully', timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  private static generatePin(): string {
    // 4-digit numerical PIN (1000 - 9999)
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

