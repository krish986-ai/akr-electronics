import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category-service';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const children = await CategoryService.getChildCategories(id);

    return NextResponse.json({
      success: true,
      data: { ...category, children },
    });
  } catch (error) {
    console.error('Fetch category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, image, icon, parentId, status, isFeatured, displayOrder, seoTitle, seoDescription, seoKeywords } = body;

    const category = await CategoryService.updateCategory(id, {
      name,
      description,
      image,
      icon,
      parentId,
      status,
      isFeatured,
      displayOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await CategoryService.deleteCategory(id);

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
