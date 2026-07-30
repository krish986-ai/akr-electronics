import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

// Cached at the Vercel CDN so repeat visitors don't touch Firestore.
const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';

export async function GET() {
  try {
    const snapshot = await getAdminDb()
      .collection('partnerships')
      .where('enabled', '==', true)
      .get();

    const partnerships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const response = NextResponse.json({ partnerships });
    response.headers.set('Cache-Control', CACHE_HEADER);
    return response;
  } catch (error) {
    console.error('[Partnerships API] Error:', error);
    return NextResponse.json({ partnerships: [] });
  }
}
