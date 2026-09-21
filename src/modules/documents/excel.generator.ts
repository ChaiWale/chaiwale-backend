import ExcelJS from 'exceljs';

export class ExcelGenerator {
  /**
   * Generate Sales Report Excel Workbook (.xlsx)
   */
  public static async generateSalesReport(invoices: any[], title = 'Sales Report'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Chaiwale POS & Billing Engine';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Sales Summary', {
      views: [{ showGridLines: true }]
    });

    // Title Block
    sheet.mergeCells('A1:L1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `CHAIWALE — ${title.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6F432A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 30;

    // Headers
    const headers = [
      'Invoice #',
      'Date',
      'Type',
      'Client / Customer',
      'Department',
      'Payment Mode',
      'Subtotal (Rs.)',
      'Tax 5% (Rs.)',
      'Discount (Rs.)',
      'Grand Total (Rs.)',
      'Paid (Rs.)',
      'Outstanding (Rs.)',
      'Status'
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8A5333' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Data Rows
    invoices.forEach((inv) => {
      const clientName = inv.corporate_clients?.company_name || inv.orders?.customer_name || 'Direct Sale';
      const row = sheet.addRow([
        inv.invoice_number,
        new Date(inv.issued_at || Date.now()).toLocaleDateString('en-IN'),
        inv.invoice_type,
        clientName,
        inv.department || '—',
        inv.orders?.payment_mode || 'DIRECT',
        Number(inv.subtotal),
        Number(inv.tax_amount),
        Number(inv.discount_amount || 0),
        Number(inv.grand_total),
        Number(inv.paid_amount || 0),
        Number(inv.outstanding_amount || 0),
        inv.status
      ]);

      row.height = 20;
      row.getCell(7).numFmt = '₹#,##0.00';
      row.getCell(8).numFmt = '₹#,##0.00';
      row.getCell(9).numFmt = '₹#,##0.00';
      row.getCell(10).numFmt = '₹#,##0.00';
      row.getCell(11).numFmt = '₹#,##0.00';
      row.getCell(12).numFmt = '₹#,##0.00';

      // Status Styling
      const statusCell = row.getCell(13);
      if (inv.status === 'PAID') {
        statusCell.font = { color: { argb: 'FF10B981' }, bold: true };
      } else if (inv.status === 'PARTIALLY_PAID') {
        statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFEF4444' }, bold: true };
      }
    });

    // Auto-fit column widths
    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLength) maxLength = val.length;
      });
      column.width = Math.max(maxLength + 3, 12);
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Generate Staff Attendance Excel Register (.xlsx)
   */
  public static async generateAttendanceReport(
    records: any[],
    month: number,
    year: number
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Chaiwale HR & Operations';
    const sheet = workbook.addWorksheet(`Attendance-${month}-${year}`, {
      views: [{ showGridLines: true }]
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    // Title Row
    sheet.mergeCells(1, 1, 1, daysInMonth + 6);
    const titleCell = sheet.getCell('A1');
    titleCell.value = `CHAIWALE STAFF ATTENDANCE REGISTER — ${month}/${year}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6F432A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 28;

    // Headers: Employee Name, Day 1..N, Present, Absent, Leave, HalfDay, Total
    const headerCols = ['Employee Name'];
    for (let d = 1; d <= daysInMonth; d++) {
      headerCols.push(String(d));
    }
    headerCols.push('Present (P)', 'Absent (A)', 'Leave (L)', 'Half Day (HD)', 'Payable Days');

    const headerRow = sheet.addRow(headerCols);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8A5333' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Map records by staff_name -> date -> status
    const staffMap = new Map<string, Map<number, string>>();
    records.forEach((rec) => {
      const name = rec.staff_name;
      if (!staffMap.has(name)) staffMap.set(name, new Map());
      const dayNum = parseInt(rec.date.split('-')[2], 10);
      staffMap.get(name)!.set(dayNum, rec.status);
    });

    // Default employees if none found in month
    if (staffMap.size === 0) {
      staffMap.set('Sunil Kumar (Store Lead)', new Map());
      staffMap.set('Ramesh Sharma (Head Chef)', new Map());
      staffMap.set('Amit Verma (Operations Staff)', new Map());
    }

    staffMap.forEach((days, staffName) => {
      let pCount = 0;
      let aCount = 0;
      let lCount = 0;
      let hdCount = 0;

      const rowData: any[] = [staffName];

      for (let d = 1; d <= daysInMonth; d++) {
        const st = days.get(d) || 'P'; // Default P for demo roster
        rowData.push(st);
        if (st === 'P') pCount++;
        else if (st === 'A') aCount++;
        else if (st === 'L') lCount++;
        else if (st === 'HD') hdCount++;
      }

      const payableDays = pCount + lCount + hdCount * 0.5;
      rowData.push(pCount, aCount, lCount, hdCount, payableDays);

      const r = sheet.addRow(rowData);
      r.height = 20;

      // Colorize day cells
      for (let d = 1; d <= daysInMonth; d++) {
        const c = r.getCell(d + 1);
        c.alignment = { vertical: 'middle', horizontal: 'center' };
        if (c.value === 'P') c.font = { color: { argb: 'FF10B981' }, bold: true };
        else if (c.value === 'A') c.font = { color: { argb: 'FFEF4444' }, bold: true };
        else if (c.value === 'L') c.font = { color: { argb: 'FFF59E0B' }, bold: true };
        else if (c.value === 'HD') c.font = { color: { argb: 'FF8B5CF6' }, bold: true };
      }
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  private static cleanExcelText(val: any): string {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/₹/g, 'Rs. ')
      .replace(/•/g, '-')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[^\x20-\x7E\r\n\t]/g, '')
      .trim();
  }

  /**
   * Generate Full Date-wise Khata & Customer Ledger Workbook (.xlsx)
   */
  public static async generateKhataDatewiseReport(data: {
    title?: string;
    startDate?: string;
    endDate?: string;
    dailySummaries: {
      date: string;
      customersCount: number;
      consumptionTotal: number;
      paymentsTotal: number;
      netChange: number;
    }[];
    entries: {
      id?: string;
      date: string;
      office_name: string;
      company_name?: string;
      phone?: string;
      building?: string;
      item_name: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
      notes?: string;
    }[];
    payments: {
      id?: string;
      date: string;
      office_name: string;
      phone?: string;
      building?: string;
      amount: number;
      payment_mode: string;
      notes?: string;
    }[];
    customerBalances: {
      office_id: string;
      office_name: string;
      company_name?: string;
      phone?: string;
      building?: string;
      periodConsumption: number;
      periodPayments: number;
      currentBalanceDue: number;
      client_pin?: string;
    }[];
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Chaiwale POS & Khata Engine';
    workbook.created = new Date();

    const rangeLabel = data.startDate && data.endDate
      ? `${data.startDate} to ${data.endDate}`
      : data.startDate
      ? `From ${data.startDate}`
      : 'All Time';

    // ─────────────────────────────────────────────────────────────
    // SHEET 1: Daily Date-wise Overview
    // ─────────────────────────────────────────────────────────────
    const sheet1 = workbook.addWorksheet('Daily Overview', {
      views: [{ showGridLines: true }]
    });

    sheet1.mergeCells('A1:E1');
    const tCell1 = sheet1.getCell('A1');
    tCell1.value = `CHAIWALE — KHATA DAILY OVERVIEW (${rangeLabel.toUpperCase()})`;
    tCell1.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC85A17' } };
    tCell1.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet1.getRow(1).height = 30;

    const s1Headers = [
      'Date',
      'Active Customers',
      'Total Consumption (Rs.)',
      'Payments Received (Rs.)',
      'Net Balance Added (Rs.)'
    ];
    const s1HeaderRow = sheet1.addRow(s1Headers);
    s1HeaderRow.height = 24;
    s1HeaderRow.eachCell((c) => {
      c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let s1TotalCons = 0;
    let s1TotalPay = 0;

    data.dailySummaries.forEach((day) => {
      s1TotalCons += day.consumptionTotal;
      s1TotalPay += day.paymentsTotal;
      const r = sheet1.addRow([
        day.date,
        day.customersCount,
        Number(day.consumptionTotal),
        Number(day.paymentsTotal),
        Number(day.netChange)
      ]);
      r.height = 20;
      r.getCell(1).alignment = { horizontal: 'center' };
      r.getCell(2).alignment = { horizontal: 'center' };
      r.getCell(3).numFmt = '#,##0.00';
      r.getCell(4).numFmt = '#,##0.00';
      r.getCell(5).numFmt = '#,##0.00';

      if (day.netChange > 0) {
        r.getCell(5).font = { color: { argb: 'FFDC2626' }, bold: true };
      } else if (day.netChange < 0) {
        r.getCell(5).font = { color: { argb: 'FF16A34A' }, bold: true };
      }
    });

    // Summary Total Row for Sheet 1
    const s1TotalRow = sheet1.addRow([
      'TOTAL',
      '—',
      Number(s1TotalCons),
      Number(s1TotalPay),
      Number(s1TotalCons - s1TotalPay)
    ]);
    s1TotalRow.height = 24;
    s1TotalRow.eachCell((c) => {
      c.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    });
    s1TotalRow.getCell(3).numFmt = '#,##0.00';
    s1TotalRow.getCell(4).numFmt = '#,##0.00';
    s1TotalRow.getCell(5).numFmt = '#,##0.00';

    sheet1.columns.forEach((col) => {
      col.width = 24;
    });

    // ─────────────────────────────────────────────────────────────
    // SHEET 2: Date-wise Itemized Consumption (Chai, Food, Tobacco, Drinks)
    // ─────────────────────────────────────────────────────────────
    const sheet2 = workbook.addWorksheet('Itemized Consumption', {
      views: [{ showGridLines: true }]
    });

    sheet2.mergeCells('A1:I1');
    const tCell2 = sheet2.getCell('A1');
    tCell2.value = `CHAIWALE — ITEMIZED KHATA CONSUMPTION (${rangeLabel.toUpperCase()})`;
    tCell2.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6F432A' } };
    tCell2.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet2.getRow(1).height = 30;

    const s2Headers = [
      'Date',
      'Customer / Office Name',
      'Building / Location',
      'Mobile Phone',
      'Item Description',
      'Qty',
      'Rate (Rs.)',
      'Total Amount (Rs.)',
      'Notes / Bill Ref'
    ];
    const s2HeaderRow = sheet2.addRow(s2Headers);
    s2HeaderRow.height = 24;
    s2HeaderRow.eachCell((c) => {
      c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.entries.forEach((ent) => {
      const r = sheet2.addRow([
        ent.date,
        this.cleanExcelText(ent.office_name),
        this.cleanExcelText(ent.building || ent.company_name || '—'),
        this.cleanExcelText(ent.phone || '—'),
        this.cleanExcelText(ent.item_name),
        Number(ent.quantity),
        Number(ent.unit_price),
        Number(ent.total_amount),
        this.cleanExcelText(ent.notes || 'Counter Khata')
      ]);
      r.height = 20;
      r.getCell(1).alignment = { horizontal: 'center' };
      r.getCell(6).alignment = { horizontal: 'center' };
      r.getCell(7).numFmt = '#,##0.00';
      r.getCell(8).numFmt = '#,##0.00';
    });

    sheet2.columns = [
      { width: 14 },
      { width: 28 },
      { width: 22 },
      { width: 16 },
      { width: 26 },
      { width: 10 },
      { width: 14 },
      { width: 18 },
      { width: 24 }
    ];

    // ─────────────────────────────────────────────────────────────
    // SHEET 3: Date-wise Payments Collected
    // ─────────────────────────────────────────────────────────────
    const sheet3 = workbook.addWorksheet('Payments Collected', {
      views: [{ showGridLines: true }]
    });

    sheet3.mergeCells('A1:G1');
    const tCell3 = sheet3.getCell('A1');
    tCell3.value = `CHAIWALE — KHATA PAYMENTS RECEIVED (${rangeLabel.toUpperCase()})`;
    tCell3.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    tCell3.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet3.getRow(1).height = 30;

    const s3Headers = [
      'Date',
      'Customer / Office Name',
      'Building / Location',
      'Mobile Phone',
      'Amount Paid (Rs.)',
      'Payment Mode',
      'UTR / Notes'
    ];
    const s3HeaderRow = sheet3.addRow(s3Headers);
    s3HeaderRow.height = 24;
    s3HeaderRow.eachCell((c) => {
      c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF14532D' } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.payments.forEach((pay) => {
      const r = sheet3.addRow([
        pay.date,
        this.cleanExcelText(pay.office_name),
        this.cleanExcelText(pay.building || '—'),
        this.cleanExcelText(pay.phone || '—'),
        Number(pay.amount),
        this.cleanExcelText(pay.payment_mode),
        this.cleanExcelText(pay.notes || 'Khata Settlement')
      ]);
      r.height = 20;
      r.getCell(1).alignment = { horizontal: 'center' };
      r.getCell(5).numFmt = '#,##0.00';
      r.getCell(5).font = { color: { argb: 'FF15803D' }, bold: true };
      r.getCell(6).alignment = { horizontal: 'center' };
    });

    sheet3.columns = [
      { width: 14 },
      { width: 28 },
      { width: 22 },
      { width: 16 },
      { width: 18 },
      { width: 16 },
      { width: 26 }
    ];

    // ─────────────────────────────────────────────────────────────
    // SHEET 4: Customer Overdue Balances & PIN Directory
    // ─────────────────────────────────────────────────────────────
    const sheet4 = workbook.addWorksheet('Customer Overdue Balances', {
      views: [{ showGridLines: true }]
    });

    sheet4.mergeCells('A1:H1');
    const tCell4 = sheet4.getCell('A1');
    tCell4.value = `CHAIWALE — CUSTOMER OVERDUE BALANCES & PIN DIRECTORY`;
    tCell4.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    tCell4.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet4.getRow(1).height = 30;

    const s4Headers = [
      'Customer / Office Name',
      'Building / Location',
      'Mobile Phone',
      'Period Consumption (Rs.)',
      'Period Paid (Rs.)',
      'Total Overdue Balance (Rs.)',
      'Account Status',
      '4-Digit PIN'
    ];
    const s4HeaderRow = sheet4.addRow(s4Headers);
    s4HeaderRow.height = 24;
    s4HeaderRow.eachCell((c) => {
      c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.customerBalances.forEach((cust) => {
      const isDue = cust.currentBalanceDue > 0;
      const r = sheet4.addRow([
        this.cleanExcelText(cust.office_name),
        this.cleanExcelText(cust.building || cust.company_name || '—'),
        this.cleanExcelText(cust.phone || '—'),
        Number(cust.periodConsumption),
        Number(cust.periodPayments),
        Number(cust.currentBalanceDue),
        isDue ? 'OVERDUE' : 'CLEAR',
        this.cleanExcelText(cust.client_pin || '----')
      ]);
      r.height = 20;
      r.getCell(4).numFmt = '#,##0.00';
      r.getCell(5).numFmt = '#,##0.00';
      r.getCell(6).numFmt = '#,##0.00';
      r.getCell(7).alignment = { horizontal: 'center' };
      r.getCell(8).alignment = { horizontal: 'center' };

      if (isDue) {
        r.getCell(6).font = { color: { argb: 'FFDC2626' }, bold: true };
        r.getCell(7).font = { color: { argb: 'FFDC2626' }, bold: true };
      } else {
        r.getCell(6).font = { color: { argb: 'FF16A34A' }, bold: true };
        r.getCell(7).font = { color: { argb: 'FF16A34A' }, bold: true };
      }
    });

    sheet4.columns = [
      { width: 28 },
      { width: 24 },
      { width: 16 },
      { width: 22 },
      { width: 18 },
      { width: 24 },
      { width: 16 },
      { width: 14 }
    ];

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }
}

