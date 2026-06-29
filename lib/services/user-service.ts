import { UserRepository, User, UserRole, UserStatus, AddressRepository, Address } from '@/lib/firestore/repositories';

export interface CreateUserInput {
  id: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  image?: string;
  status?: UserStatus;
  emailVerified?: boolean;
}

export interface CreateAddressInput {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type?: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  name?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type?: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault?: boolean;
}

export class UserService {
  static async createUser(data: CreateUserInput): Promise<User> {
    const existingUser = await UserRepository.getByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return UserRepository.create({
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      image: data.image,
      role: data.role || 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: false,
      isDeleted: false,
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    return UserRepository.getById(id);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return UserRepository.getByEmail(email);
  }

  static async updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
    const updates: Partial<User> = {};
    if (data.name) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.image !== undefined) updates.image = data.image;
    if (data.status) updates.status = data.status;
    if (data.emailVerified !== undefined) {
      updates.emailVerified = data.emailVerified;
      if (data.emailVerified) {
        updates.verifiedAt = new Date();
      }
    }

    updates.updatedAt = new Date();
    await UserRepository.update(id, updates);
    return UserRepository.getById(id);
  }

  static async recordLogin(userId: string, success: boolean = true): Promise<void> {
    await UserRepository.updateLoginInfo(userId, success);
  }

  static async addAddress(userId: string, data: CreateAddressInput): Promise<Address> {
    const addresses = await AddressRepository.getUserAddresses(userId);

    return AddressRepository.create(userId, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      type: data.type || 'HOME',
      isDefault: data.isDefault || addresses.length === 0,
    });
  }

  static async updateAddress(userId: string, addressId: string, data: UpdateAddressInput): Promise<Address | null> {
    const updates: Partial<Address> = {};
    if (data.name) updates.name = data.name;
    if (data.phone) updates.phone = data.phone;
    if (data.email) updates.email = data.email;
    if (data.street) updates.street = data.street;
    if (data.city) updates.city = data.city;
    if (data.state) updates.state = data.state;
    if (data.postalCode) updates.postalCode = data.postalCode;
    if (data.country) updates.country = data.country;
    if (data.type) updates.type = data.type;
    if (data.isDefault !== undefined) updates.isDefault = data.isDefault;

    updates.updatedAt = new Date();

    if (data.isDefault) {
      const existingAddresses = await AddressRepository.getUserAddresses(userId);
      for (const addr of existingAddresses) {
        if (addr.isDefault && addr.id !== addressId) {
          await AddressRepository.update(userId, addr.id, { isDefault: false } as any);
        }
      }
    }

    await AddressRepository.update(userId, addressId, updates);
    return AddressRepository.getById(userId, addressId);
  }

  static async deleteAddress(userId: string, addressId: string): Promise<void> {
    await AddressRepository.delete(userId, addressId);
  }

  static async getUserAddresses(userId: string): Promise<Address[]> {
    return AddressRepository.getUserAddresses(userId);
  }

  static async getDefaultAddress(userId: string): Promise<Address | null> {
    const addresses = await AddressRepository.getUserAddresses(userId);
    return addresses.find(a => a.isDefault) || null;
  }

  static async listAdmins(): Promise<User[]> {
    return UserRepository.listAdmins();
  }

  static async listCustomers(): Promise<User[]> {
    return UserRepository.listCustomers();
  }

  static async makeAdmin(userId: string): Promise<void> {
    await UserRepository.update(userId, { role: 'ADMIN' } as any);
  }

  static async removeAdmin(userId: string): Promise<void> {
    await UserRepository.update(userId, { role: 'CUSTOMER' } as any);
  }

  static async suspendUser(userId: string): Promise<void> {
    await UserRepository.update(userId, { status: 'SUSPENDED' } as any);
  }

  static async activateUser(userId: string): Promise<void> {
    await UserRepository.update(userId, { status: 'ACTIVE' } as any);
  }
}
