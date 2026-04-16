import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ttService } from '../src/services/tt.service.js';
import { Room } from '../src/models/Room.js';
import { TimetableEntry } from '../src/models/TimetableEntry.js';
import { Faculty } from '../src/models/Faculty.js';
import { Substitution } from '../src/models/Substitution.js';
import mongoose from 'mongoose';

vi.mock('../src/models/Room.js');
vi.mock('../src/models/TimetableEntry.js');
vi.mock('../src/models/Faculty.js');
vi.mock('../src/models/Substitution.js');

describe('ttService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room', async () => {
      const roomData = { name: 'Room 101', type: 'Theory', capacity: 60, location: 'Block A' };
      const tenantId = 'tenant123';
      (Room.create as any).mockResolvedValue({ ...roomData, tenantId, _id: new mongoose.Types.ObjectId() });

      const result = await ttService.createRoom(tenantId, roomData as any);
      expect(Room.create).toHaveBeenCalledWith({ ...roomData, tenantId });
      expect(result.name).toBe('Room 101');
    });
  });

  describe('createTimetableEntry', () => {
    const tenantId = 'tenant123';
    const entryData = {
      dayOfWeek: 1,
      slotIndex: 1,
      roomId: new mongoose.Types.ObjectId(),
      facultyId: new mongoose.Types.ObjectId(),
      courseId: new mongoose.Types.ObjectId(),
      sectionId: 'Section A'
    };

    it('should create a timetable entry if no conflicts exist', async () => {
      (TimetableEntry.find as any).mockResolvedValue([]);
      (TimetableEntry.create as any).mockResolvedValue({ ...entryData, tenantId, _id: new mongoose.Types.ObjectId() });

      const result = await ttService.createTimetableEntry(tenantId, entryData as any);
      expect(TimetableEntry.find).toHaveBeenCalled();
      expect(TimetableEntry.create).toHaveBeenCalledWith({ ...entryData, tenantId });
      expect(result.sectionId).toBe('Section A');
    });

    it('should throw error if room is occupied', async () => {
      (TimetableEntry.find as any).mockResolvedValue([{ 
          roomId: entryData.roomId,
          dayOfWeek: 1,
          slotIndex: 1
      }]);

      await expect(ttService.createTimetableEntry(tenantId, entryData as any))
        .rejects.toThrow('Room is already occupied for this slot');
    });

    it('should throw error if faculty is busy', async () => {
      (TimetableEntry.find as any).mockResolvedValue([{ 
          facultyId: entryData.facultyId,
          dayOfWeek: 1,
          slotIndex: 1
      }]);

      await expect(ttService.createTimetableEntry(tenantId, entryData as any))
        .rejects.toThrow('Faculty is already assigned to another class for this slot');
    });

    it('should throw error if section has another class', async () => {
      (TimetableEntry.find as any).mockResolvedValue([{ 
          sectionId: entryData.sectionId,
          dayOfWeek: 1,
          slotIndex: 1
      }]);

      await expect(ttService.createTimetableEntry(tenantId, entryData as any))
        .rejects.toThrow('Section already has a class scheduled for this slot');
    });
  });

  describe('getFreeFaculty', () => {
    it('should return faculty who are not busy during a slot', async () => {
      const tenantId = 'tenant123';
      const faculty1 = { _id: new mongoose.Types.ObjectId(), department: 'CS' };
      const faculty2 = { _id: new mongoose.Types.ObjectId(), department: 'CS' };
      
      (Faculty.find as any).mockResolvedValue([faculty1, faculty2]);
      (TimetableEntry.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue([{ facultyId: faculty1._id }])
      });

      const result = await ttService.getFreeFaculty(tenantId, 1, 1, 'CS');
      expect(Faculty.find).toHaveBeenCalledWith({ tenantId, department: 'CS' });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe(faculty2._id);
    });
  });

  describe('createSubstitutionRequest', () => {
    const tenantId = 'tenant123';
    const entryId = new mongoose.Types.ObjectId();
    const substituteId = new mongoose.Types.ObjectId();
    const mockEntry = {
      _id: entryId,
      dayOfWeek: 1, // Monday
      slotIndex: 1
    };

    it('should create a substitution if substitute is free', async () => {
      (TimetableEntry.findById as any).mockResolvedValue(mockEntry);
      (TimetableEntry.findOne as any).mockResolvedValue(null);
      (Substitution.findOne as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });
      (Substitution.create as any).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      const date = new Date('2024-05-20'); // A Monday
      const result = await ttService.createSubstitutionRequest(tenantId, { entryId, substituteId, date });
      
      expect(Substitution.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw if date day does not match entry day', async () => {
      (TimetableEntry.findById as any).mockResolvedValue(mockEntry);
      
      const date = new Date('2024-05-21'); // A Tuesday
      await expect(ttService.createSubstitutionRequest(tenantId, { entryId, substituteId, date }))
        .rejects.toThrow('Substitution date does not match the day of the week for this timetable entry');
    });

    it('should throw if substitute is already busy in timetable', async () => {
      (TimetableEntry.findById as any).mockResolvedValue(mockEntry);
      (TimetableEntry.findOne as any).mockResolvedValue({ _id: 'someentry' });
      
      const date = new Date('2024-05-20');
      await expect(ttService.createSubstitutionRequest(tenantId, { entryId, substituteId, date }))
        .rejects.toThrow('Substitute faculty is already busy during this slot');
    });
  });
});
