import { Room, IRoom } from '../models/Room';
import { TimetableEntry, ITimetableEntry } from '../models/TimetableEntry';
import { Faculty } from '../models/Faculty';
import { Substitution, ISubstitution } from '../models/Substitution';
import mongoose from 'mongoose';

export const ttService = {
  async createRoom(tenantId: string, data: Partial<IRoom>) {
    return Room.create({ ...data, tenantId });
  },

  async getRooms(tenantId: string) {
    return Room.find({ tenantId });
  },

  async createTimetableEntry(tenantId: string, data: Partial<ITimetableEntry>) {
    // Basic validation before save to provide better error messages (optional since DB has unique constraints)
    const { dayOfWeek, slotIndex, roomId, facultyId, sectionId } = data;

    // We can rely on unique index but checking manually can give nicer error responses
    const conflicts = await TimetableEntry.find({
      tenantId,
      dayOfWeek,
      slotIndex,
      $or: [
        { roomId },
        { facultyId },
        { sectionId }
      ]
    });

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      if (conflict.roomId?.toString() === roomId?.toString()) {
        throw new Error('Room is already occupied for this slot');
      }
      if (conflict.facultyId?.toString() === facultyId?.toString()) {
        throw new Error('Faculty is already assigned to another class for this slot');
      }
      if (conflict.sectionId === sectionId) {
        throw new Error('Section already has a class scheduled for this slot');
      }
    }

    return TimetableEntry.create({ ...data, tenantId });
  },

  async getTimetableForRoom(tenantId: string, roomId: string) {
    return TimetableEntry.find({ tenantId, roomId })
      .populate('facultyId', 'userId department')
      .populate('courseId', 'code name')
      .sort({ dayOfWeek: 1, slotIndex: 1 });
  },

  async getTimetableForFaculty(tenantId: string, facultyId: string) {
    return TimetableEntry.find({ tenantId, facultyId })
      .populate('roomId', 'name location')
      .populate('courseId', 'code name')
      .sort({ dayOfWeek: 1, slotIndex: 1 });
  },

  async getTimetableForSection(tenantId: string, sectionId: string) {
    return TimetableEntry.find({ tenantId, sectionId })
      .populate('roomId', 'name location')
      .populate('facultyId', 'userId department')
      .populate('courseId', 'code name')
      .sort({ dayOfWeek: 1, slotIndex: 1 });
  },

  async deleteTimetableEntry(tenantId: string, entryId: string) {
    return TimetableEntry.findOneAndDelete({ tenantId, _id: entryId });
  },

  async getFreeFaculty(tenantId: string, dayOfWeek: number, slotIndex: number, department?: string) {
    // 1. Get all faculty in the tenant (optionally filtered by department)
    const query: any = { tenantId };
    if (department) {
      query.department = department;
    }
    const allFaculty = await Faculty.find(query);

    // 2. Get all faculty who have a TimetableEntry for this slot
    const busyFacultyEntries = await TimetableEntry.find({
      tenantId,
      dayOfWeek,
      slotIndex
    }).select('facultyId');
    const busyFacultyIds = busyFacultyEntries.map(e => e.facultyId.toString());

    // 3. Filter out busy faculty
    return allFaculty.filter(f => !busyFacultyIds.includes(f._id.toString()));
  },

  async createSubstitutionRequest(tenantId: string, data: Partial<ISubstitution>) {
    const { entryId, date, substituteId } = data;

    // Get the original entry to find dayOfWeek and slotIndex
    const entry = await TimetableEntry.findById(entryId);
    if (!entry) throw new Error('Original timetable entry not found');

    // Basic date validation: Ensure date's dayOfWeek matches entry's dayOfWeek
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // entry.dayOfWeek is 1-6 (Monday-Saturday)
    const dateDay = new Date(date!).getDay();
    if (dateDay !== entry.dayOfWeek) {
      // Small adjustment if your 1-6 means Mon-Sat. In JS 0 is Sun, 1 is Mon.
      // So if entry.dayOfWeek 1 = Mon, then dateDay 1 = Mon.
      if (dateDay === 0 || dateDay !== entry.dayOfWeek) {
        throw new Error('Substitution date does not match the day of the week for this timetable entry');
      }
    }

    // Check if substitute is free for this slot
    const busy = await TimetableEntry.findOne({
      tenantId,
      facultyId: substituteId,
      dayOfWeek: entry.dayOfWeek,
      slotIndex: entry.slotIndex
    });

    if (busy) {
      throw new Error('Substitute faculty is already busy during this slot');
    }

    // Check for existing substitutions for this substitute on this date/slot
    const existingSub = await Substitution.findOne({
      tenantId,
      substituteId,
      date,
      status: { $ne: 'Rejected' }
    }).populate({
      path: 'entryId',
      match: { slotIndex: entry.slotIndex }
    });

    if (existingSub && (existingSub.entryId as any)?.slotIndex === entry.slotIndex) {
       throw new Error('Substitute faculty already has another substitution for this slot');
    }

    return Substitution.create({ ...data, tenantId });
  },

  async getSubstitutions(tenantId: string, query: any) {
    return Substitution.find({ ...query, tenantId })
      .populate({
        path: 'entryId',
        populate: [
          { path: 'courseId', select: 'code name' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .populate('substituteId', 'userId department')
      .populate('requestedBy', 'name');
  }
};
