import { AddressRepository } from '@/lib/firestore/repositories';
import { CreateAddressInput, UpdateAddressInput } from '@/lib/validation/address-validation';

export class AddressService {
  static async createAddress(userId: string, data: CreateAddressInput) {
    return AddressRepository.create(userId, { ...data, isDefault: data.isDefault || false });
  }

  static async getAddresses(userId: string) {
    return AddressRepository.getAddresses(userId);
  }

  static async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    await AddressRepository.update(userId, addressId, data as any);
    return AddressRepository.getAddresses(userId);
  }

  static async deleteAddress(userId: string, addressId: string) {
    await AddressRepository.delete(userId, addressId);
  }

  static async getDefaultAddress(userId: string) {
    const addresses = await AddressRepository.getAddresses(userId);
    return addresses.find(a => a.isDefault) || null;
  }
}
