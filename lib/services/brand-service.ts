import { BrandRepository, Brand } from '@/lib/firestore/repositories';

export interface CreateBrandInput {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
}

export interface UpdateBrandInput {
  name?: string;
  logo?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  isFeatured?: boolean;
}

export class BrandService {
  static async createBrand(data: CreateBrandInput): Promise<Brand> {
    const slug = data.slug || this.generateSlug(data.name);

    return BrandRepository.create({
      name: data.name,
      slug,
      logo: data.logo,
      description: data.description,
      status: 'ACTIVE',
      isFeatured: false,
      isDeleted: false,
    });
  }

  static async getBrandById(id: string): Promise<Brand | null> {
    return BrandRepository.getById(id);
  }

  static async getBrandBySlug(slug: string): Promise<Brand | null> {
    return BrandRepository.getBySlug(slug);
  }

  static async updateBrand(id: string, data: UpdateBrandInput): Promise<Brand | null> {
    const updates: Partial<Brand> = {};
    if (data.name) updates.name = data.name;
    if (data.logo !== undefined) updates.logo = data.logo;
    if (data.description) updates.description = data.description;
    if (data.status) updates.status = data.status;
    if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;

    updates.updatedAt = new Date();
    await BrandRepository.update(id, updates);
    return BrandRepository.getById(id);
  }

  static async deleteBrand(id: string): Promise<void> {
    await BrandRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'DELETED',
    } as any);
  }

  static async listBrands(): Promise<Brand[]> {
    return BrandRepository.listAll();
  }

  static async listFeaturedBrands(limit: number = 10): Promise<Brand[]> {
    return BrandRepository.listFeatured(limit);
  }

  private static generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}
