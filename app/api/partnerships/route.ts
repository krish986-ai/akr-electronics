import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    console.log('[Partnerships API] Fetching enabled partnerships...');
    const snapshot = await getAdminDb()
      .collection('partnerships')
      .where('enabled', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const partnerships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[Partnerships API] Found partnerships:', partnerships.length);
    const response = NextResponse.json({ partnerships });
    // Prevent caching to show live partnership data
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('[Partnerships API] Error:', error);
    const response = NextResponse.json({ partnerships: [] });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}
