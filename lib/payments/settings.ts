export interface PaymentSettings {
  razorpayEnabled: boolean;
  qrEnabled: boolean;
  qrImage: string;
  qrUpiName: string;
}

export const defaultPaymentSettings: PaymentSettings = {
  razorpayEnabled: false,
  qrEnabled: false,
  qrImage: '',
  qrUpiName: '',
};

export const QR_PAYMENT_NOTE =
  'QR payments are verified manually by our team. Your order will be confirmed within 12 to 48 hours of payment — please keep your UPI transaction ID handy until then.';
