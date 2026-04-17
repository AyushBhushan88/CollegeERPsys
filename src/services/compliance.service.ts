import { Types } from 'mongoose';
import { complianceQueue } from '../config/bullmq.js';
import { analyticsService } from './analytics.service.js';
import { reportBuilderService } from './reportBuilder.service.js';

export enum ComplianceReportType {
  NAAC_SSR = 'NAAC_SSR',
  NBA_SAR = 'NBA_SAR'
}

export interface ComplianceJobData {
  tenantId: string;
  reportType: ComplianceReportType;
  filters?: any;
}

export class ComplianceService {
  /**
   * Extracts data for NAAC SSR Criterion 2 (Student Performance) and Criterion 5 (Student Support).
   */
  public async extractNaacData(tenantId: string, criteria: string[]) {
    const data: any = {};
    
    if (criteria.includes('C2')) {
      data.enrollment = await analyticsService.getEnrollmentAnalytics(tenantId);
      data.performance = await analyticsService.getAcademicAnalytics(tenantId);
    }
    
    if (criteria.includes('C5')) {
      data.fees = await analyticsService.getFeeAnalytics(tenantId);
      // Placeholder for scholarships/placements which would be in HR/SIS
    }
    
    return data;
  }

  /**
   * Extracts data for NBA SAR (CO-PO attainment, success rates).
   */
  public async extractNbaData(tenantId: string, criteria: string[]) {
    // NBA specifically focuses on outcome-based education (OBE)
    // We can use the reportBuilder to fetch specific attainment records
    const attainment = await reportBuilderService.executeReport({
      baseModel: 'MarkEntry',
      columns: [{ field: 'studentId' }, { field: 'courseId' }, { field: 'marks' }],
      filters: [],
      sort: []
    } as any, new Types.ObjectId(tenantId));
    
    return { attainment };
  }

  /**
   * Enqueues a compliance report generation job.
   */
  public async enqueueReportJob(tenantId: string, reportType: ComplianceReportType, filters?: any) {
    const job = await complianceQueue.add(`${reportType}-${tenantId}`, {
      tenantId,
      reportType,
      filters
    });
    return job.id;
  }
}

export const complianceService = new ComplianceService();
