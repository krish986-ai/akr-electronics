import { getRazorpayClient } from '@/lib/payment/razorpay';
import { OrderRepository } from '@/lib/firestore/repositories';
import { Decimal } from 'decimal.js';

interface CreatePaymentOrderInput {
  orderId: string;
  userId: string;
  amount: Decimal;
  currency: string;
}

interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

interface PaymentWebhookData {
  event: string;
  payload: any;
}

export class PaymentService {
  /**
   * Create a payment order in Razorpay
   * Called after customer creates order and proceeds to checkout
   */
  static async createPaymentOrder(data: CreatePaymentOrderInput): Promise<any> {
    try {
      const client = getRazorpayClient();

      const order = await OrderRepository.getById(data.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify amount matches
      if (order.total.toNumber() !== data.amount.toNumber()) {
        throw new Error('Order amount mismatch');
      }

      // Create Razorpay order
      const razorpayOrder = await client.createOrder({
        amount: data.amount.toNumber(),
        currency: data.currency,
        receipt: data.orderId,
        description: `A.K.R Electronics - Order ${data.orderId}`,
        customer_notify: 1,
        notes: {
          orderId: data.orderId,
          userId: data.userId,
        },
      });

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount / 100,
        currency: razorpayOrder.currency,
        orderId: data.orderId,
      };
    } catch (error) {
      console.error('Create payment order error:', error);
      throw error;
    }
  }

  /**
   * Verify payment (CRITICAL: Always do server-side verification)
   * Never trust client-side payment confirmation
   */
  static async verifyPayment(data: VerifyPaymentInput): Promise<boolean> {
    try {
      const client = getRazorpayClient();

      // Step 1: Verify signature
      const signatureValid = client.verifyPaymentSignature(
        data.orderId,
        data.paymentId,
        data.signature
      );

      if (!signatureValid) {
        console.warn(`Invalid payment signature for payment: ${data.paymentId}`);
        return false;
      }

      // Step 2: Fetch actual payment from Razorpay
      const payment = await client.fetchPayment(data.paymentId);

      // Step 3: Verify payment status
      if (payment.status !== 'captured') {
        console.warn(`Payment not captured: ${data.paymentId}, status: ${payment.status}`);
        return false;
      }

      // Step 4: Verify order details match
      const order = await OrderRepository.getById(data.orderId);
      if (!order) {
        console.warn(`Order not found: ${data.orderId}`);
        return false;
      }

      // Verify amounts match (in smallest currency unit)
      const paymentAmount = new Decimal(payment.amount / 100);
      if (!paymentAmount.equals(order.total)) {
        console.warn(
          `Payment amount mismatch for ${data.paymentId}: ` +
          `expected ${order.total}, got ${paymentAmount}`
        );
        return false;
      }

      // Step 5: Update order with payment details
      await (OrderRepository as any).updatePaymentStatus(data.orderId, 'COMPLETED', {
        paymentId: data.paymentId,
        transactionId: payment.id,
      });

      return true;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook (payment updates)
   */
  static async handleWebhook(data: PaymentWebhookData): Promise<void> {
    try {
      const { event, payload } = data;

      switch (event) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(payload.payment);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment);
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(payload.refund);
          break;

        default:
          console.log(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle payment authorized webhook
   */
  private static async handlePaymentAuthorized(payment: any): Promise<void> {
    // Extract order ID from payment notes
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      console.warn(`Payment ${payment.id} has no orderId in notes`);
      return;
    }

    const order = await OrderRepository.getById(orderId);
    if (order && order.paymentStatus !== 'COMPLETED') {
      await OrderRepository.updatePaymentStatus(orderId, 'COMPLETED');
    }
  }

  /**
   * Handle payment failed webhook
   */
  private static async handlePaymentFailed(payment: any): Promise<void> {
    const orderId = payment.notes?.orderId;
    if (!orderId) return;

    const order = await OrderRepository.getById(orderId);
    if (order && order.paymentStatus !== 'FAILED') {
      await OrderRepository.updatePaymentStatus(orderId, 'FAILED');
    }
  }

  /**
   * Handle refund processed webhook
   */
  private static async handleRefundProcessed(refund: any): Promise<void> {
    const orderId = refund.notes?.orderId;
    if (!orderId) return;

    await OrderRepository.updatePaymentStatus(orderId, 'REFUNDED');
  }

  /**
   * Process refund (for cancellations/returns)
   */
  static async processRefund(orderId: string): Promise<any> {
    try {
      const order = await OrderRepository.getById(orderId);
      if (!order || !order.paymentId) {
        throw new Error('Order or payment not found');
      }

      const client = getRazorpayClient();
      const refund = await client.createRefund(
        order.paymentId,
        order.total.toNumber()
      );

      await OrderRepository.updatePaymentStatus(orderId, 'REFUNDED');

      return refund;
    } catch (error) {
      console.error('Process refund error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(orderId: string): Promise<any> {
    try {
      const order = await OrderRepository.getById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.paymentId) {
        return {
          orderId,
          status: order.paymentStatus,
          paymentId: null,
        };
      }

      const client = getRazorpayClient();
      const payment = await client.fetchPayment(order.paymentId);

      return {
        orderId,
        paymentId: order.paymentId,
        status: order.paymentStatus,
        paymentStatus: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }
}
