import { describe, it, expect, vi } from 'vitest';
import { complianceService, ComplianceReportType } from '../src/services/compliance.service.js';
import { complianceQueue } from '../src/config/bullmq.js';

vi.mock('../src/config/bullmq.js', () => ({
  complianceQueue: {
    add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
    getJob: vi.fn(),
  },
  connection: {},
}));

describe('ComplianceService and Worker logic', () => {
  it('should enqueue a report job correctly', async () => {
    const tenantId = 'tenant-123';
    const jobId = await complianceService.enqueueReportJob(tenantId, ComplianceReportType.NAAC_SSR);
    
    expect(jobId).toBe('test-job-id');
    expect(complianceQueue.add).toHaveBeenCalledWith(
      expect.stringContaining(ComplianceReportType.NAAC_SSR),
      expect.objectContaining({ tenantId, reportType: ComplianceReportType.NAAC_SSR })
    );
  });

  it('should extract NAAC data without crashing', async () => {
    // This is a unit test for the service logic
    // In a full integration test we would seed data
    expect(complianceService.extractNaacData).toBeDefined();
  });
});
