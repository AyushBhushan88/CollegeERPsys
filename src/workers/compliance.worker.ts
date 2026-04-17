import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.js';
import { complianceService, ComplianceReportType, ComplianceJobData } from '../services/compliance.service.js';
import { minioClient } from '../config/minio.js';
import ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { Readable } from 'stream';

// Basic PDF font mapping - in production these would be in a /fonts directory
const fonts = {
  Roboto: {
    normal: 'Helvetica', // Standard PDF fonts as fallback
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

export const complianceWorker = new Worker<ComplianceJobData>(
  'compliance-generation',
  async (job: Job<ComplianceJobData>) => {
    const { tenantId, reportType, filters } = job.data;
    const bucketName = 'compliance-reports';

    try {
      // 1. Fetch data for the report
      let data;
      if (reportType === ComplianceReportType.NAAC_SSR) {
        data = await complianceService.extractNaacData(tenantId, filters?.criteria || ['C2', 'C5']);
      } else {
        data = await complianceService.extractNbaData(tenantId, filters?.criteria || ['SAR']);
      }

      // 2. Generate report file based on type
      let buffer: Buffer;
      let contentType: string;
      let fileName: string;

      if (reportType === ComplianceReportType.NAAC_SSR) {
        // Generate XLSX for NAAC
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Enrollment');
        sheet.columns = [
          { header: 'Branch', key: 'branch', width: 20 },
          { header: 'Count', key: 'count', width: 10 }
        ];
        data.enrollment.forEach((e: any) => sheet.addRow(e));
        
        buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `NAAC_SSR_${tenantId}_${Date.now()}.xlsx`;
      } else {
        // Generate PDF for NBA SAR
        const printer = new PdfPrinter(fonts);
        const docDefinition = {
          content: [
            { text: `NBA SAR Report for ${tenantId}`, style: 'header' },
            { text: `Generated on: ${new Date().toLocaleDateString()}` },
            { text: 'Attainment Data:', style: 'subheader' },
            {
              table: {
                body: [
                  ['Course ID', 'Marks'],
                  ...data.attainment.map((a: any) => [a.courseId, a.marks])
                ]
              }
            }
          ],
          styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
          }
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        
        // Wait for PDF generation
        const chunks: any[] = [];
        buffer = await new Promise((resolve, reject) => {
          pdfDoc.on('data', (chunk) => chunks.push(chunk));
          pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
          pdfDoc.on('error', (err) => reject(err));
          pdfDoc.end();
        });

        contentType = 'application/json'; // Actually PDF, but we upload to MinIO
        fileName = `NBA_SAR_${tenantId}_${Date.now()}.pdf`;
      }

      // 3. Upload to MinIO
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
        'Content-Type': contentType,
        'x-amz-meta-tenant-id': tenantId
      });

      // 4. Update job with MinIO key
      await job.updateProgress(100);
      return { minioKey: fileName };

    } catch (error) {
      console.error('Job failure:', error);
      throw error;
    }
  },
  { connection }
);

export default complianceWorker;
