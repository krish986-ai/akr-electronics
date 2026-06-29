import crypto from 'crypto';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  description?: string;
  customer_notify?: 0 | 1;
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}

interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_reason: string | null;
  error_step: string | null;
  error_field: string | null;
  acquirer_data?: {
    auth_code: string | null;
  };
  notes?: Record<string, string>;
  created_at: number;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private baseUrl = 'https://api.razorpay.com/v1';

  constructor(config: RazorpayConfig) {
    this.keyId = config.keyId;
    this.keySecret = config.keySecret;

    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay configuration missing: keyId and keySecret are required');
    }
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(options.amount * 100), // Convert to paise
        currency: options.currency,
        receipt: options.receipt,
        description: options.description,
        customer_notify: options.customer_notify,
        notes: options.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay order creation failed: ${error.description}`);
    }

    return response.json();
  }

  /**
   * Fetch order details
   */
  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay order fetch failed: ${error.description}`);
    }

    return response.json();
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay payment fetch failed: ${error.description}`);
    }

    return response.json();
  }

  /**
   * Verify payment signature (critical for security)
   * Prevent accepting unverified payments
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Create refund (for order cancellations)
   */
  async createRefund(paymentId: string, amount?: number): Promise<any> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount ? Math.round(amount * 100) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay refund failed: ${error.description}`);
    }

    return response.json();
  }
}

/**
 * Get Razorpay client instance (singleton)
 */
let razorpayClient: RazorpayClient | null = null;

export function getRazorpayClient(): RazorpayClient {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET_KEY;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured in environment variables');
    }

    razorpayClient = new RazorpayClient({
      keyId,
      keySecret,
    });
  }

  return razorpayClient;
}
