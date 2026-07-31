import { NextRequest, NextResponse } from 'next/server';
import {
  findServerProduct,
  getServerKitContents,
  getServerProductQuestions,
  getServerProductReviews,
  getServerRelatedProducts,
} from '@/lib/data/server-catalog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await findServerProduct(decodeURIComponent(id));

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const [related, reviews, questions, kitContents] = await Promise.all([
    getServerRelatedProducts(product),
    getServerProductReviews(product.id),
    getServerProductQuestions(product.id),
    product.isKit && product.kitItems?.length ? getServerKitContents(product.kitItems) : Promise.resolve(undefined),
  ]);

  const response = NextResponse.json({ product, related, reviews, questions, kitContents });
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response;
}
