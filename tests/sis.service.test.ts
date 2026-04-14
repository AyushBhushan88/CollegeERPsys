import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SISService } from '../src/services/sis.service.js';
import { Student, StudentStatus } from '../src/models/Student.js';
import { Faculty } from '../src/models/Faculty.js';
import { User } from '../src/models/User.js';
import mongoose from 'mongoose';

vi.mock('../src/models/Student.js');
vi.mock('../src/models/Faculty.js');
vi.mock('../src/models/User.js');
vi.mock('../src/middleware/tenant.js', () => ({
  getTenantId: vi.fn().mockReturnValue('tenant123')
}));

describe('SISService', () => {
  let sisService: SISService;

  beforeEach(() => {
    sisService = new SISService();
    vi.clearAllMocks();
  });

  describe('createStudent', () => {
    it('should create a student profile and link to user', async () => {
      const studentData = {
        userId: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        admissionNumber: 'ADM001',
        enrollmentNumber: 'ENR001',
        dob: new Date(),
        gender: 'Male',
        category: 'General',
        contactInfo: { email: 'john@example.com', phone: '1234567890' },
        address: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
        guardianDetails: { name: 'Jane Doe', relationship: 'Mother', contact: '0987654321' },
        branch: 'CSE',
        section: 'A',
        batch: '2023',
        yearOfAdmission: 2023,
      };

      const mockStudent = { ...studentData, _id: new mongoose.Types.ObjectId(), save: vi.fn() };
      
      // We need to mock the constructor of Student
      (Student as any).mockImplementation(() => mockStudent);
      (User.findByIdAndUpdate as any).mockResolvedValue({});

      const result = await sisService.createStudent(studentData as any);

      expect(Student).toHaveBeenCalledWith(studentData);
      expect(mockStudent.save).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(studentData.userId, {
        profileId: mockStudent._id,
        profileModel: 'Student'
      });
      expect(result).toBe(mockStudent);
    });
  });

  describe('updateStudent', () => {
    it('should update student and record status history if status changed', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      const updateData = { status: StudentStatus.ACTIVE };
      const existingStudent = { _id: studentId, status: StudentStatus.ADMISSION };

      (Student.findById as any).mockResolvedValue(existingStudent);
      (Student.findByIdAndUpdate as any).mockResolvedValue({ ...existingStudent, status: StudentStatus.ACTIVE });

      const result = await sisService.updateStudent(studentId, updateData);

      expect(Student.findById).toHaveBeenCalledWith(studentId);
      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        studentId,
        expect.objectContaining({
          status: StudentStatus.ACTIVE,
          $push: {
            statusHistory: expect.objectContaining({
              status: StudentStatus.ACTIVE,
              remarks: 'Status updated via service'
            })
          }
        }),
        { new: true }
      );
    });
  });

  describe('searchStudents', () => {
    it('should filter students based on query parameters', async () => {
      const query = { name: 'John', branch: 'CSE' };
      (Student.find as any).mockResolvedValue([{ name: 'John', branch: 'CSE' }]);

      const result = await sisService.searchStudents(query);

      expect(Student.find).toHaveBeenCalledWith({
        name: { $regex: 'John', $options: 'i' },
        branch: 'CSE'
      });
      expect(result).toHaveLength(1);
    });
  });
  
  describe('createFaculty', () => {
    it('should create a faculty profile and link to user', async () => {
      const facultyData = {
        userId: new mongoose.Types.ObjectId(),
        name: 'Dr. Smith',
        department: 'CSE',
        designation: 'Professor',
        qualifications: [],
        experience: [],
        publications: [],
        contactInfo: { email: 'smith@example.com', phone: '1234567890' }
      };

      const mockFaculty = { ...facultyData, _id: new mongoose.Types.ObjectId(), save: vi.fn() };
      
      (Faculty as any).mockImplementation(() => mockFaculty);
      (User.findByIdAndUpdate as any).mockResolvedValue({});

      const result = await sisService.createFaculty(facultyData as any);

      expect(Faculty).toHaveBeenCalledWith(facultyData);
      expect(mockFaculty.save).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(facultyData.userId, {
        profileId: mockFaculty._id,
        profileModel: 'Faculty'
      });
      expect(result).toBe(mockFaculty);
    });
  });

  describe('searchFaculty', () => {
    it('should filter faculty based on query parameters', async () => {
      const query = { name: 'Smith', department: 'CSE' };
      (Faculty.find as any).mockResolvedValue([{ name: 'Smith', department: 'CSE' }]);

      const result = await sisService.searchFaculty(query);

      expect(Faculty.find).toHaveBeenCalledWith({
        name: { $regex: 'Smith', $options: 'i' },
        department: 'CSE'
      });
      expect(result).toHaveLength(1);
    });
  });
});
