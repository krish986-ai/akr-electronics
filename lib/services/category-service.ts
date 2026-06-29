import { CategoryRepository, Category } from '@/lib/firestore/repositories';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isFeatured?: boolean;
  displayOrder?: number;
}

export class CategoryService {
  static async createCategory(data: CreateCategoryInput): Promise<Category> {
    const slug = data.slug || this.generateSlug(data.name);

    return CategoryRepository.create({
      name: data.name,
      slug,
      description: data.description || '',
      image: data.image,
      icon: data.icon,
      parentId: data.parentId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      status: 'ACTIVE',
      isFeatured: false,
      displayOrder: 0,
      isDeleted: false,
    });
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    return CategoryRepository.getById(id);
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    return CategoryRepository.getBySlug(slug);
  }

  static async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    const updates: Partial<Category> = {};
    if (data.name) updates.name = data.name;
    if (data.description) updates.description = data.description;
    if (data.image) updates.image = data.image;
    if (data.icon) updates.icon = data.icon;
    if (data.parentId) updates.parentId = data.parentId;
    if (data.seoTitle) updates.seoTitle = data.seoTitle;
    if (data.seoDescription) updates.seoDescription = data.seoDescription;
    if (data.seoKeywords) updates.seoKeywords = data.seoKeywords;
    if (data.status) updates.status = data.status;
    if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;

    updates.updatedAt = new Date();
    await CategoryRepository.update(id, updates);
    return CategoryRepository.getById(id);
  }

  static async deleteCategory(id: string): Promise<void> {
    await CategoryRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    } as any);
  }

  static async listCategories(): Promise<Category[]> {
    return CategoryRepository.listAll();
  }

  static async listFeaturedCategories(limit: number = 6): Promise<Category[]> {
    return CategoryRepository.listFeatured(limit);
  }

  static async getChildCategories(parentId: string): Promise<Category[]> {
    return CategoryRepository.getChildren(parentId);
  }

  static async getCategoryHierarchy(): Promise<{ [key: string]: Category & { children: Category[] } }> {
    const allCategories = await this.listCategories();
    const hierarchy: { [key: string]: Category & { children: Category[] } } = {};

    for (const category of allCategories) {
      if (!category.parentId) {
        hierarchy[category.id] = {
          ...category,
          children: [],
        };
      }
    }

    for (const category of allCategories) {
      if (category.parentId && hierarchy[category.parentId]) {
        hierarchy[category.parentId].children.push(category);
      }
    }

    return hierarchy;
  }

  private static generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}
