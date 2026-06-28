import { prisma } from '@/lib/prisma';
import { CreateAddressInput, UpdateAddressInput } from '@/lib/validation/address-validation';

export class AddressService {
  static async createAddress(userId: string, data: CreateAddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  static async getDefaultAddress(userId: string) {
    return prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  static async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId }, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId, userId },
      data,
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    return prisma.address.delete({
      where: { id: addressId, userId },
    });
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId, userId },
      data: { isDefault: true },
    });
  }
}
