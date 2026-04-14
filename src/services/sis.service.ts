import { Student, IStudent, StudentStatus } from '../models/Student.js';
import { Faculty, IFaculty } from '../models/Faculty.js';
import { User } from '../models/User.js';
import { Types } from 'mongoose';

export class SISService {
  // Student Operations
  async createStudent(studentData: Partial<IStudent>) {
    const student = new Student(studentData);
    await student.save();
    
    // Link to user if exists
    if (studentData.userId) {
      await User.findByIdAndUpdate(studentData.userId, {
        profileId: student._id,
        profileModel: 'Student'
      });
    }
    
    return student;
  }

  async getStudentById(id: string) {
    return Student.findById(id).populate('userId');
  }

  async updateStudent(id: string, updateData: Partial<IStudent>) {
    // If status is updated, add to history
    if (updateData.status) {
      const student = await Student.findById(id);
      if (student && student.status !== updateData.status) {
        return Student.findByIdAndUpdate(id, {
          ...updateData,
          $push: {
            statusHistory: {
              status: updateData.status,
              date: new Date(),
              remarks: 'Status updated via service'
            }
          }
        }, { new: true });
      }
    }
    return Student.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteStudent(id: string) {
    const student = await Student.findByIdAndDelete(id);
    if (student && student.userId) {
      await User.findByIdAndUpdate(student.userId, {
        $unset: { profileId: 1, profileModel: 1 }
      });
    }
    return student;
  }

  async searchStudents(query: any) {
    const { name, admissionNumber, branch, batch, status, department } = query;
    const filter: any = {};
    
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (admissionNumber) filter.admissionNumber = admissionNumber;
    if (branch) filter.branch = branch;
    if (batch) filter.batch = batch;
    if (status) filter.status = status;
    
    return Student.find(filter);
  }

  // Faculty Operations
  async createFaculty(facultyData: Partial<IFaculty>) {
    const faculty = new Faculty(facultyData);
    await faculty.save();

    if (facultyData.userId) {
      await User.findByIdAndUpdate(facultyData.userId, {
        profileId: faculty._id,
        profileModel: 'Faculty'
      });
    }

    return faculty;
  }

  async getFacultyById(id: string) {
    return Faculty.findById(id).populate('userId');
  }

  async updateFaculty(id: string, updateData: Partial<IFaculty>) {
    return Faculty.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteFaculty(id: string) {
    const faculty = await Faculty.findByIdAndDelete(id);
    if (faculty && faculty.userId) {
      await User.findByIdAndUpdate(faculty.userId, {
        $unset: { profileId: 1, profileModel: 1 }
      });
    }
    return faculty;
  }

  async searchFaculty(query: any) {
    const { name, department, designation } = query;
    const filter: any = {};
    
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    
    return Faculty.find(filter);
  }
}

export const sisService = new SISService();
