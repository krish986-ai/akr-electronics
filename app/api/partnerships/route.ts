import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const snapshot = await getAdminDb()
      .collection('partnerships')
      .where('enabled', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const partnerships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ partnerships });
  } catch {
    return NextResponse.json({ partnerships: [] });
  }
}
