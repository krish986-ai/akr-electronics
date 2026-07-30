import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

const DEFAULTS = {
  supportPhone: '1800 123 4567',
  supportEmail: 'support@akrelectronics.com',
  storeName: 'A.K.R Electronics',
  announcement: '',
};

// Cached at the Vercel CDN so repeat visitors don't touch Firestore.
const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';

export async function GET() {
  try {
    const doc = await getAdminDb().collection('config').doc('store').get();
    const data = doc.data();

    const response = NextResponse.json({
      supportPhone: data?.supportPhone || DEFAULTS.supportPhone,
      supportEmail: data?.supportEmail || DEFAULTS.supportEmail,
      storeName: data?.storeName || DEFAULTS.storeName,
      announcement: data?.announcement || DEFAULTS.announcement,
    });
    response.headers.set('Cache-Control', CACHE_HEADER);
    return response;
  } catch (error) {
    console.error('[Public Settings API] Error:', error);
    return NextResponse.json(DEFAULTS);
  }
}
