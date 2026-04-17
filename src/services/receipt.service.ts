import QRCode from 'qrcode';
import PdfPrinter from 'pdfmake';
import { Payment, PaymentStatus } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { FeeDemand } from '../models/FeeDemand.js';
import { Tenant } from '../models/Tenant.js';
import { TDocumentDefinitions } from 'pdfmake/interfaces.js';

export class ReceiptService {
  async generateReceipt(paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== PaymentStatus.SUCCESS) {
      throw new Error('Payment not found or not successful');
    }

    const [student, demand, tenant] = await Promise.all([
      Student.findById(payment.studentId),
      FeeDemand.findById(payment.demandId),
      Tenant.findById(payment.tenantId),
    ]);

    if (!student || !demand || !tenant) {
      throw new Error('Associated data not found');
    }

    const qrCodeUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-payment/${payment._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: tenant.name, style: 'header', alignment: 'center' },
        { text: 'FEE RECEIPT', style: 'subheader', alignment: 'center', margin: [0, 10, 0, 20] },
        {
          columns: [
            [
              { text: `Student Name: ${student.name}`, margin: [0, 2] },
              { text: `Admission No: ${student.admissionNumber}`, margin: [0, 2] },
              { text: `Branch: ${student.branch}`, margin: [0, 2] },
              { text: `Batch: ${student.batch}`, margin: [0, 2] },
            ],
            [
              { text: `Receipt No: ${payment._id}`, alignment: 'right', margin: [0, 2] },
              { text: `Date: ${payment.createdAt.toLocaleDateString()}`, alignment: 'right', margin: [0, 2] },
              { text: `Transaction ID: ${payment.transactionId}`, alignment: 'right', margin: [0, 2] },
            ]
          ]
        },
        { text: '', margin: [0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Description', bold: true, fillColor: '#eeeeee' },
                { text: 'Amount', bold: true, fillColor: '#eeeeee' }
              ],
              ...demand.items.map(item => [item.name, item.amount.toFixed(2)]),
              [
                { text: 'Total Amount', bold: true },
                { text: demand.totalAmount.toFixed(2), bold: true }
              ],
              [
                { text: 'Amount Paid', bold: true },
                { text: payment.amount.toFixed(2), bold: true }
              ],
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: '', margin: [0, 20] },
        {
          columns: [
            {
              image: qrCodeDataUrl,
              width: 80
            },
            {
              stack: [
                { text: 'Scan to verify this receipt', fontSize: 10, margin: [0, 10] },
                { text: 'This is a computer generated receipt and does not require a physical signature.', fontSize: 8, italics: true, margin: [0, 20] }
              ]
            }
          ]
        }
      ],
      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 14, bold: true, color: '#333333' }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    };

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    // @ts-ignore - PdfPrinter type might be slightly different in ESM
    const printer = new PdfPrinter(fonts);
    return printer.createPdfKitDocument(docDefinition);
  }
}

export const receiptService = new ReceiptService();
