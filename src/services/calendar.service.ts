import { Event, IEvent } from '../models/Event.js';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { Types } from 'mongoose';

export class CalendarService {
  async createEvent(eventData: Partial<IEvent>, tenantId: string): Promise<IEvent> {
    const event = new Event({
      ...eventData,
      tenantId: new Types.ObjectId(tenantId)
    });
    return await event.save();
  }

  async getEvents(tenantId: string): Promise<IEvent[]> {
    return await Event.find({ tenantId: new Types.ObjectId(tenantId) });
  }

  async getEventById(id: string, tenantId: string): Promise<IEvent | null> {
    return await Event.findOne({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) });
  }

  async updateEvent(id: string, eventData: Partial<IEvent>, tenantId: string): Promise<IEvent | null> {
    return await Event.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: eventData },
      { new: true }
    );
  }

  async deleteEvent(id: string, tenantId: string): Promise<boolean> {
    const result = await Event.deleteOne({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) });
    return result.deletedCount > 0;
  }

  async generateICalFeed(tenantId: string): Promise<string> {
    const events = await this.getEvents(tenantId);
    const calendar = ical({
      name: 'Institutional Calendar',
      method: ICalCalendarMethod.PUBLISH
    });

    events.forEach(event => {
      calendar.createEvent({
        start: event.startDate,
        end: event.endDate,
        summary: event.title,
        description: event.description,
        location: event.location
      });
    });

    return calendar.toString();
  }
}

export const calendarService = new CalendarService();
