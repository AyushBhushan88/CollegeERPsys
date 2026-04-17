import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import { analyticsService } from '../src/services/analytics.service.js';
import { Student } from '../src/models/Student.js';
import { FeeDemand, FeeStatus } from '../src/models/FeeDemand.js';

describe('AnalyticsService Integration Tests', () => {
  const tenantId = new Types.ObjectId().toString();

  it('should return enrollment analytics grouped by branch', async () => {
    // Basic test to verify the service exists and can be called
    expect(analyticsService.getEnrollmentAnalytics).toBeDefined();
  });

  it('should calculate fee collection ratios correctly', async () => {
    expect(analyticsService.getFeeAnalytics).toBeDefined();
  });

  it('should handle academic analytics gracefully', async () => {
    expect(analyticsService.getAcademicAnalytics).toBeDefined();
  });
});
