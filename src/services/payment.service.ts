import Razorpay from 'razorpay';
import { Payment, PaymentStatus } from '../models/Payment.js';
import { FeeDemand, FeeStatus } from '../models/FeeDemand.js';
import crypto from 'crypto';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_key_secret',
    });
  }

  async createOrder(demandId: string) {
    const demand = await FeeDemand.findById(demandId);
    if (!demand) {
      throw new Error('Fee demand not found');
    }

    if (demand.status === FeeStatus.PAID) {
      throw new Error('Fee demand already paid');
    }

    const amountToPay = demand.totalAmount - demand.paidAmount;
    if (amountToPay <= 0) {
      throw new Error('No pending amount to pay');
    }

    // Razorpay amount is in paise
    const options = {
      amount: Math.round(amountToPay * 100),
      currency: 'INR',
      receipt: demand._id.toString(),
    };

    const order = await this.razorpay.orders.create(options);

    const payment = new Payment({
      tenantId: demand.tenantId,
      demandId: demand._id,
      studentId: demand.studentId,
      amount: amountToPay,
      gateway: 'Razorpay',
      gatewayOrderId: order.id,
      status: PaymentStatus.PENDING,
    });

    await payment.save();

    return {
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
    
    // Signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured') {
      const { order_id, id: transactionId } = payload.payload.payment.entity;
      
      const payment = await Payment.findOne({ gatewayOrderId: order_id });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return { message: 'Payment already processed' };
      }

      payment.status = PaymentStatus.SUCCESS;
      payment.transactionId = transactionId;
      await payment.save();

      // Update FeeDemand
      const demand = await FeeDemand.findById(payment.demandId);
      if (demand) {
        demand.paidAmount += payment.amount;
        if (demand.paidAmount >= demand.totalAmount) {
          demand.status = FeeStatus.PAID;
        } else {
          demand.status = FeeStatus.PARTIAL;
        }
        await demand.save();
      }

      return { message: 'Payment processed successfully' };
    }

    return { message: 'Event ignored' };
  }

  async getPaymentById(paymentId: string) {
    return Payment.findById(paymentId).populate('studentId').populate('demandId');
  }
}

export const paymentService = new PaymentService();
