import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    console.log('[Partnerships API] Fetching all partnerships...');

    // First get all partnerships
    const allSnapshot = await getAdminDb().collection('partnerships').get();
    console.log('[Partnerships API] Total partnerships in DB:', allSnapshot.docs.length);
    allSnapshot.docs.forEach(doc => {
      console.log(`  - ${doc.id}: enabled=${doc.data().enabled}`);
    });

    // Then filter enabled
    const snapshot = await getAdminDb()
      .collection('partnerships')
      .where('enabled', '==', true)
      .get();

    const partnerships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[Partnerships API] Enabled partnerships:', partnerships.length);
    partnerships.forEach((p: any) => {
      console.log(`  - ${p.name}: ${p.enabled}`);
    });

    const response = NextResponse.json({ partnerships });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    return response;
  } catch (error) {
    console.error('[Partnerships API] Error:', error);
    const response = NextResponse.json({ partnerships: [] });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
}
