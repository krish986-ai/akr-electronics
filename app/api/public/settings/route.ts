import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    console.log('[Public Settings API] Fetching store config...');
    const doc = await getAdminDb().collection('config').doc('store').get();
    const data = doc.data();
    console.log('[Public Settings API] Config found:', data);

    const response = NextResponse.json({
      supportPhone: data?.supportPhone || '1800 123 4567',
      supportEmail: data?.supportEmail || 'support@akrelectronics.com',
      storeName: data?.storeName || 'A.K.R Electronics',
      announcement: data?.announcement || '',
      freeDeliveryThreshold: data?.freeDeliveryThreshold || 999,
    });

    // No cache - always fresh
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('[Public Settings API] Error:', error);
    const response = NextResponse.json({
      supportPhone: '1800 123 4567',
      supportEmail: 'support@akrelectronics.com',
      storeName: 'A.K.R Electronics',
      announcement: '',
      freeDeliveryThreshold: 999,
    });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}
