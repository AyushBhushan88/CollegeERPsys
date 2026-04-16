import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CRSService } from '../src/services/crs.service.js';
import { Course, CourseType } from '../src/models/Course.js';
import { Syllabus, SyllabusStatus } from '../src/models/Syllabus.js';
import { Outcome, OutcomeType } from '../src/models/Outcome.js';
import { OBEMapping } from '../src/models/OBEMapping.js';
import { CourseRegistration, RegistrationStatus } from '../src/models/CourseRegistration.js';
import mongoose from 'mongoose';

vi.mock('../src/models/Course.js', () => {
  class MockCourse {
    constructor(data: any) {
      Object.assign(this, data);
    }
    save = vi.fn().mockImplementation(function() { return Promise.resolve(this); });
    static findById = vi.fn();
    static find = vi.fn();
    static findByIdAndUpdate = vi.fn();
  }
  return {
    Course: MockCourse,
    CourseType: {
      CORE: 'CORE',
      ELECTIVE: 'ELECTIVE',
      OPEN: 'OPEN',
    }
  };
});

vi.mock('../src/models/Syllabus.js', () => {
  class MockSyllabus {
    constructor(data: any) {
      Object.assign(this, data);
    }
    save = vi.fn().mockImplementation(function() { return Promise.resolve(this); });
    static findOne = vi.fn();
    static find = vi.fn();
    static findById = vi.fn();
    static updateMany = vi.fn();
  }
  return {
    Syllabus: MockSyllabus,
    SyllabusStatus: {
      DRAFT: 'DRAFT',
      ACTIVE: 'ACTIVE',
      ARCHIVED: 'ARCHIVED',
    }
  };
});

vi.mock('../src/models/Outcome.js', () => {
  class MockOutcome {
    constructor(data: any) {
      Object.assign(this, data);
    }
    save = vi.fn().mockImplementation(function() { return Promise.resolve(this); });
    static findById = vi.fn();
    static find = vi.fn();
  }
  return {
    Outcome: MockOutcome,
    OutcomeType: {
      CO: 'CO',
      PO: 'PO',
      PSO: 'PSO',
    }
  };
});

vi.mock('../src/models/OBEMapping.js', () => {
  class MockOBEMapping {
    constructor(data: any) {
      Object.assign(this, data);
    }
    static findOneAndUpdate = vi.fn();
    static find = vi.fn();
  }
  return {
    OBEMapping: MockOBEMapping,
  };
});

vi.mock('../src/models/CourseRegistration.js', () => {
  class MockCourseRegistration {
    constructor(data: any) {
      Object.assign(this, data);
    }
    save = vi.fn().mockImplementation(function() { return Promise.resolve(this); });
    static find = vi.fn();
    static findByIdAndUpdate = vi.fn();
  }
  return {
    CourseRegistration: MockCourseRegistration,
    RegistrationStatus: {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      WITHDRAWN: 'WITHDRAWN',
    }
  };
});

describe('CRSService', () => {
  let crsService: CRSService;

  beforeEach(() => {
    crsService = new CRSService();
    vi.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a course profile', async () => {
      const courseData = {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 4,
        type: CourseType.CORE,
        department: 'CSE',
        prerequisites: [],
      };

      const result = await crsService.createCourse(courseData as any);

      expect(result).toBeDefined();
      expect(result.code).toBe(courseData.code);
    });
  });

  describe('updateSyllabus', () => {
    it('should create a new syllabus version', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      const syllabusData = {
        units: [
          { title: 'Unit 1', description: 'Basics' },
          { title: 'Unit 2', description: 'Advanced' }
        ]
      };

      (Syllabus.findOne as any).mockReturnValue({
        sort: vi.fn().mockResolvedValue({ version: 1 })
      });

      const result = await crsService.updateSyllabus(courseId, syllabusData as any);

      expect(Syllabus.findOne).toHaveBeenCalledWith({ courseId });
      expect(result.version).toBe(2);
      expect(result.status).toBe(SyllabusStatus.DRAFT);
    });

    it('should start with version 1 if no syllabus exists', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      const syllabusData = { units: [] };

      (Syllabus.findOne as any).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null)
      });

      const result = await crsService.updateSyllabus(courseId, syllabusData as any);

      expect(result.version).toBe(1);
    });
  });

  describe('activateSyllabus', () => {
    it('should archive old active syllabus and activate new one', async () => {
      const syllabusId = new mongoose.Types.ObjectId().toString();
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const mockSyllabus = new Syllabus({ 
        _id: syllabusId, 
        courseId, 
        status: SyllabusStatus.DRAFT
      });
      mockSyllabus.save = vi.fn().mockResolvedValue(mockSyllabus);

      (Syllabus.findById as any).mockResolvedValue(mockSyllabus);
      (Syllabus.updateMany as any).mockResolvedValue({ acknowledged: true });

      const result = await crsService.activateSyllabus(syllabusId);

      expect(Syllabus.findById).toHaveBeenCalledWith(syllabusId);
      expect(Syllabus.updateMany).toHaveBeenCalledWith(
        { courseId, status: SyllabusStatus.ACTIVE },
        { status: SyllabusStatus.ARCHIVED }
      );
      expect(result.status).toBe(SyllabusStatus.ACTIVE);
      expect(mockSyllabus.save).toHaveBeenCalled();
    });
  });

  describe('OBE Engine', () => {
    it('should create an outcome', async () => {
      const outcomeData = {
        type: OutcomeType.CO,
        code: 'CO1',
        description: 'Understand basics',
        tenantId: new mongoose.Types.ObjectId().toString()
      };

      const result = await crsService.createOutcome(outcomeData as any);
      expect(result.code).toBe('CO1');
    });

    it('should create or update a mapping', async () => {
      const mappingData = {
        sourceId: new mongoose.Types.ObjectId().toString(),
        targetId: new mongoose.Types.ObjectId().toString(),
        weight: 3,
        tenantId: new mongoose.Types.ObjectId().toString()
      };

      (Outcome.findById as any).mockResolvedValue({ _id: 'some-id' });
      (OBEMapping.findOneAndUpdate as any).mockResolvedValue(mappingData);

      const result = await crsService.createMapping(mappingData as any);
      expect(result.weight).toBe(3);
      expect(OBEMapping.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should retrieve mapping matrix', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      (Outcome.find as any)
        .mockResolvedValueOnce([{ _id: 'co1', type: OutcomeType.CO }]) // COs
        .mockResolvedValueOnce([{ _id: 'po1', type: OutcomeType.PO }]); // Targets

      (OBEMapping.find as any).mockResolvedValue([{ sourceId: 'co1', targetId: 'po1', weight: 3 }]);

      const result = await crsService.getMappingMatrix(courseId);
      expect(result.cos).toHaveLength(1);
      expect(result.targets).toHaveLength(1);
      expect(result.mappings).toHaveLength(1);
    });
  });

  describe('Course Registration', () => {
    it('should register a student if prerequisites are met', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      const prereqId = new mongoose.Types.ObjectId().toString();
      const studentId = new mongoose.Types.ObjectId().toString();
      const tenantId = new mongoose.Types.ObjectId().toString();

      (Course.findById as any).mockResolvedValue({
        _id: courseId,
        prerequisites: [prereqId]
      });

      (CourseRegistration.find as any).mockResolvedValue([{
        courseId: prereqId,
        status: RegistrationStatus.APPROVED
      }]);

      const result = await crsService.registerStudentForCourse({
        studentId: studentId as any,
        courseId: courseId as any,
        semester: 'S24',
        tenantId: tenantId as any
      });

      expect(result.status).toBe(RegistrationStatus.PENDING);
    });

    it('should throw error if prerequisites are NOT met', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      const prereqId = new mongoose.Types.ObjectId().toString();
      const studentId = new mongoose.Types.ObjectId().toString();

      (Course.findById as any).mockResolvedValue({
        _id: courseId,
        prerequisites: [prereqId]
      });

      (CourseRegistration.find as any).mockResolvedValue([]); // No completed prereqs

      await expect(crsService.registerStudentForCourse({
        studentId: studentId as any,
        courseId: courseId as any,
        semester: 'S24'
      })).rejects.toThrow('Prerequisites not met');
    });
  });
});
