import { Types } from 'mongoose';

export interface GradingContext {
  tenantId: Types.ObjectId;
  examId?: Types.ObjectId;
  courseId?: Types.ObjectId;
}

export interface IGradingStrategy {
  calculateGrade(totalMarks: number, context: GradingContext): { grade: string; gradePoints: number };
}

export class AbsoluteGradingStrategy implements IGradingStrategy {
  calculateGrade(totalMarks: number, _context: GradingContext): { grade: string; gradePoints: number } {
    if (totalMarks >= 90) return { grade: 'O', gradePoints: 10 };
    if (totalMarks >= 80) return { grade: 'A+', gradePoints: 9 };
    if (totalMarks >= 70) return { grade: 'A', gradePoints: 8 };
    if (totalMarks >= 60) return { grade: 'B+', gradePoints: 7 };
    if (totalMarks >= 50) return { grade: 'B', gradePoints: 6 };
    if (totalMarks >= 40) return { grade: 'C', gradePoints: 5 };
    return { grade: 'F', gradePoints: 0 };
  }
}

// Relative grading would need more data about the class performance, 
// for now we implement a stub or a simple version.
export class RelativeGradingStrategy implements IGradingStrategy {
  calculateGrade(totalMarks: number, _context: GradingContext): { grade: string; gradePoints: number } {
    // This is a placeholder for actual relative grading logic
    // which would typically require fetching all marks for the course/exam.
    // For this plan, we'll use a simplified version.
    return new AbsoluteGradingStrategy().calculateGrade(totalMarks, _context);
  }
}

export class GradingEngine {
  private strategy: IGradingStrategy;

  constructor(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  calculate(totalMarks: number, context: GradingContext) {
    return this.strategy.calculateGrade(totalMarks, context);
  }
}
