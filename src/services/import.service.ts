import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Student, StudentStatus } from '../models/Student.js';
import { StudentImportSchema, StudentImportRow, ImportSummary } from '../schemas/import.schema.js';
import { parse } from 'csv-parse/sync';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

export class ImportService {
  async importStudents(data: any[], tenantId: mongoose.Types.ObjectId): Promise<ImportSummary> {
    const summary: ImportSummary = {
      successCount: 0,
      failCount: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 1;

      try {
        const validatedRow = StudentImportSchema.parse(row);
        await this.processStudentRow(validatedRow, tenantId);
        summary.successCount++;
      } catch (error: any) {
        summary.failCount++;
        summary.errors.push({
          row: rowIndex,
          error: error instanceof Error ? error.message : String(error),
          data: row,
        });
      }
    }

    return summary;
  }

  private async processStudentRow(row: StudentImportRow, tenantId: mongoose.Types.ObjectId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create User
      const [user] = await User.create([{
        email: row.email,
        roles: ['student'],
        tenantId: tenantId,
        profileModel: 'Student',
      }], { session });

      // Create Student
      const [student] = await Student.create([{
        userId: user._id,
        tenantId: tenantId,
        name: row.name,
        dob: row.dob,
        gender: row.gender,
        category: row.category,
        contactInfo: {
          email: row.email,
          phone: row.phone,
        },
        address: {
          street: row.street,
          city: row.city,
          state: row.state,
          zipCode: row.zipCode,
        },
        guardianDetails: {
          name: row.guardianName,
          relationship: row.guardianRelationship,
          contact: row.guardianContact,
        },
        admissionNumber: row.admissionNumber,
        enrollmentNumber: row.enrollmentNumber,
        branch: row.branch,
        section: row.section,
        batch: row.batch,
        yearOfAdmission: row.yearOfAdmission,
        status: StudentStatus.ADMISSION,
        statusHistory: [{
          status: StudentStatus.ADMISSION,
          date: new Date(),
          remarks: 'Imported via bulk import',
        }],
      }], { session });

      // Link User to Student
      user.profileId = student._id as mongoose.Types.ObjectId;
      await user.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async parseCSV(buffer: Buffer): Promise<any[]> {
    return parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    const data: any[] = [];
    
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.text;
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          rowData[header] = cell.value;
        }
      });
      data.push(rowData);
    });

    return data;
  }
}
