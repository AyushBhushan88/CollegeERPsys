import { Course, ICourse } from '../models/Course.js';
import { Syllabus, ISyllabus, SyllabusStatus } from '../models/Syllabus.js';
import { Outcome, IOutcome, OutcomeType } from '../models/Outcome.js';
import { OBEMapping, IOBEMapping } from '../models/OBEMapping.js';
import { CourseRegistration, ICourseRegistration, RegistrationStatus } from '../models/CourseRegistration.js';
import { Types } from 'mongoose';

export class CRSService {
  // Course Management
  async createCourse(courseData: Partial<ICourse>) {
    const course = new Course(courseData);
    await course.save();
    return course;
  }

  async getCourseById(id: string) {
    return Course.findById(id).populate('prerequisites');
  }

  async getCourseCatalog(filter: any = {}) {
    return Course.find(filter).populate('prerequisites');
  }

  async updateCourse(id: string, updateData: Partial<ICourse>) {
    return Course.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Syllabus Management
  async updateSyllabus(courseId: string, syllabusData: Partial<ISyllabus>) {
    // Get latest version
    const latestSyllabus = await Syllabus.findOne({ courseId }).sort({ version: -1 });
    const nextVersion = latestSyllabus ? latestSyllabus.version + 1 : 1;

    const syllabus = new Syllabus({
      ...syllabusData,
      courseId,
      version: nextVersion,
      status: SyllabusStatus.DRAFT
    });
    
    await syllabus.save();
    return syllabus;
  }

  async getSyllabusByCourse(courseId: string, version?: number) {
    const query: any = { courseId };
    if (version) query.version = version;
    
    const sort: any = { version: -1 };
    return Syllabus.findOne(query).sort(sort);
  }

  async getSyllabusHistory(courseId: string) {
    return Syllabus.find({ courseId }).sort({ version: -1 });
  }

  async activateSyllabus(syllabusId: string) {
    const syllabus = await Syllabus.findById(syllabusId);
    if (!syllabus) throw new Error('Syllabus not found');

    // Archive current active syllabus for this course
    await Syllabus.updateMany(
      { courseId: syllabus.courseId, status: SyllabusStatus.ACTIVE },
      { status: SyllabusStatus.ARCHIVED }
    );

    // Set this one as active
    syllabus.status = SyllabusStatus.ACTIVE;
    await syllabus.save();
    
    return syllabus;
  }

  // OBE Engine - Outcomes
  async createOutcome(outcomeData: Partial<IOutcome>) {
    const outcome = new Outcome(outcomeData);
    await outcome.save();
    return outcome;
  }

  async getOutcomes(filter: any = {}) {
    return Outcome.find(filter);
  }

  // OBE Engine - Mappings
  async createMapping(mappingData: Partial<IOBEMapping>) {
    // Check if source and target exist
    const [source, target] = await Promise.all([
      Outcome.findById(mappingData.sourceId),
      Outcome.findById(mappingData.targetId)
    ]);

    if (!source || !target) {
      throw new Error('Source or Target outcome not found');
    }

    // Upsert mapping
    return OBEMapping.findOneAndUpdate(
      { 
        sourceId: mappingData.sourceId, 
        targetId: mappingData.targetId,
        tenantId: mappingData.tenantId 
      },
      mappingData,
      { upsert: true, new: true }
    );
  }

  async getMappingMatrix(courseId: string) {
    // 1. Get all COs for this course
    const cos = await Outcome.find({ courseId, type: OutcomeType.CO });
    
    // 2. Get all POs/PSOs (typically for the department or college)
    const targets = await Outcome.find({ type: { $in: [OutcomeType.PO, OutcomeType.PSO] } });

    // 3. Get all mappings between these
    const coIds = cos.map(co => co._id);
    const targetIds = targets.map(t => t._id);

    const mappings = await OBEMapping.find({
      sourceId: { $in: coIds },
      targetId: { $in: targetIds }
    });

    return {
      cos,
      targets,
      mappings
    };
  }

  // Course Registration
  async registerStudentForCourse(registrationData: Partial<ICourseRegistration>) {
    const { studentId, courseId, semester, tenantId } = registrationData;

    // 1. Check if course exists and get its prerequisites
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    // 2. Prerequisite validation
    if (course.prerequisites && course.prerequisites.length > 0) {
      // Check if student has successfully completed prerequisites in previous semesters
      const completedRegistrations = await CourseRegistration.find({
        studentId,
        courseId: { $in: course.prerequisites },
        status: RegistrationStatus.APPROVED, // Assuming APPROVED means completed successfully for this logic
        tenantId
      });

      if (completedRegistrations.length < course.prerequisites.length) {
        throw new Error('Prerequisites not met');
      }
    }

    // 3. Create registration
    const registration = new CourseRegistration({
      studentId,
      courseId,
      semester,
      tenantId,
      status: RegistrationStatus.PENDING
    });

    await registration.save();
    return registration;
  }

  async getStudentRegistrations(studentId: string, filter: any = {}) {
    return CourseRegistration.find({ studentId, ...filter }).populate('courseId');
  }

  async updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
    return CourseRegistration.findByIdAndUpdate(registrationId, { status }, { new: true });
  }
}

export const crsService = new CRSService();
