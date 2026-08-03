import { getAdminMessaging } from '@/lib/firebase/admin';
import { DeviceTokenRepository } from '@/lib/firestore/repositories';

export async function sendPushToUser(userId: string, title: string, body: string): Promise<void> {
  const devices = await DeviceTokenRepository.getTokensForUser(userId);
  if (devices.length === 0) return;

  const response = await getAdminMessaging().sendEachForMulticast({
    tokens: devices.map(d => d.token),
    notification: { title, body },
  });

  await Promise.all(
    response.responses.map((result, i) => {
      const isInvalidToken =
        !result.success &&
        result.error?.code === 'messaging/registration-token-not-registered';
      return isInvalidToken ? DeviceTokenRepository.unregister(userId, devices[i].token) : undefined;
    })
  );
}

const ORDER_STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED: 'Your order has been confirmed.',
  SHIPPED: 'Your order is on its way.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'Your order has been cancelled.',
};

export async function sendOrderStatusPush(userId: string, orderNumber: string, orderStatus: string): Promise<void> {
  const message = ORDER_STATUS_MESSAGES[orderStatus];
  if (!message) return;

  await sendPushToUser(userId, `Order ${orderNumber}`, message);
}
