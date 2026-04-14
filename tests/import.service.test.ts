import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportService } from '../src/services/import.service';
import { User } from '../src/models/User';
import { Student } from '../src/models/Student';
import mongoose from 'mongoose';

vi.mock('../src/models/User');
vi.mock('../src/models/Student');

describe('ImportService', () => {
  let importService: ImportService;
  const tenantId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
    importService = new ImportService();

    // Mock mongoose session
    const mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });

  describe('importStudents', () => {
    it('should successfully import valid students', async () => {
      const validData = [
        {
          name: 'John Doe',
          dob: '2000-01-01',
          gender: 'Male',
          category: 'General',
          email: 'john@example.com',
          phone: '1234567890',
          street: '123 St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          guardianName: 'Jane Doe',
          guardianRelationship: 'Mother',
          guardianContact: '0987654321',
          admissionNumber: 'ADM001',
          enrollmentNumber: 'ENR001',
          branch: 'CS',
          section: 'A',
          batch: '2024',
          yearOfAdmission: 2024,
        }
      ];

      const userMock = { _id: new mongoose.Types.ObjectId(), save: vi.fn().mockResolvedValue({}) };
      (User.create as any).mockResolvedValue([userMock]);
      (Student.create as any).mockResolvedValue([{ _id: new mongoose.Types.ObjectId() }]);

      const result = await importService.importStudents(validData, tenantId);

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(User.create).toHaveBeenCalled();
      expect(Student.create).toHaveBeenCalled();
      expect(userMock.save).toHaveBeenCalled();
    });

    it('should report errors for invalid data', async () => {
      const invalidData = [
        {
          name: 'J', // too short
          email: 'not-an-email',
          // missing fields
        }
      ];

      const result = await importService.importStudents(invalidData as any, tenantId);

      expect(result.successCount).toBe(0);
      expect(result.failCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(1);
    });
  });
});
