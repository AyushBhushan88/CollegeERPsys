import { FeeStructure, IFeeStructure } from '../models/FeeStructure.js';
import { FeeDemand, IFeeDemand, FeeStatus, IConcession } from '../models/FeeDemand.js';
import { Types } from 'mongoose';

export class FeeService {
  async createStructure(structureData: Partial<IFeeStructure>) {
    const structure = new FeeStructure(structureData);
    return structure.save();
  }

  async generateDemands(structureId: string, studentIds: string[], dueDate: Date) {
    const structure = await FeeStructure.findById(structureId);
    if (!structure) {
      throw new Error('Fee structure not found');
    }

    const totalAmount = structure.items.reduce((sum, item) => sum + item.amount, 0);

    const demands = studentIds.map(studentId => ({
      studentId: new Types.ObjectId(studentId),
      structureId: structure._id,
      items: structure.items,
      concessions: [],
      totalAmount: totalAmount,
      paidAmount: 0,
      status: FeeStatus.PENDING,
      dueDate: dueDate,
      tenantId: structure.tenantId
    }));

    return FeeDemand.insertMany(demands, { ordered: false }).catch(err => {
      // If some already exist (unique index constraint), it might throw an error.
      // In a real scenario, we might want to handle this more gracefully.
      if (err.code === 11000) {
        // Handle partial success if needed
        return err.insertedDocs;
      }
      throw err;
    });
  }

  async applyConcession(demandId: string, concession: IConcession) {
    const demand = await FeeDemand.findById(demandId);
    if (!demand) {
      throw new Error('Fee demand not found');
    }

    demand.concessions.push(concession);
    
    const itemsTotal = demand.items.reduce((sum, item) => sum + item.amount, 0);
    const concessionsTotal = demand.concessions.reduce((sum, c) => sum + c.amount, 0);
    
    demand.totalAmount = itemsTotal - concessionsTotal;
    
    // Update status if needed (though usually it's still Pending or Partial)
    if (demand.paidAmount >= demand.totalAmount) {
      demand.status = FeeStatus.PAID;
    } else if (demand.paidAmount > 0) {
      demand.status = FeeStatus.PARTIAL;
    }

    return demand.save();
  }

  async getStudentBalance(studentId: string) {
    const demands = await FeeDemand.find({
      studentId: new Types.ObjectId(studentId),
      status: { $in: [FeeStatus.PENDING, FeeStatus.PARTIAL, FeeStatus.OVERDUE] }
    });

    return demands.reduce((total, demand) => total + (demand.totalAmount - demand.paidAmount), 0);
  }

  async checkOverdueDemands() {
    const now = new Date();
    return FeeDemand.updateMany(
      {
        status: { $in: [FeeStatus.PENDING, FeeStatus.PARTIAL] },
        dueDate: { $lt: now }
      },
      {
        $set: { status: FeeStatus.OVERDUE }
      }
    );
  }
}

export const feeService = new FeeService();
