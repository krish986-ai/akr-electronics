import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category-service';

export async function GET(req: NextRequest) {
  try {
    const categories = await CategoryService.listCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, image, icon, parentId, seoTitle, seoDescription, seoKeywords } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = await CategoryService.createCategory({
      name,
      slug,
      description,
      image,
      icon,
      parentId,
      seoTitle,
      seoDescription,
      seoKeywords,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
