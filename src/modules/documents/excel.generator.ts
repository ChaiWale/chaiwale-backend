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
}
