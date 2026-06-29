import { WebsiteConfigRepository, WebsiteConfig } from '@/lib/firestore/repositories';
import { Decimal } from 'decimal.js';

export interface UpdateWebsiteConfigInput {
  siteName?: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  currency?: string;
  currencySymbol?: string;
  timezone?: string;
  taxRate?: number | string;
  shippingBaseCost?: number | string;
  freeShippingThreshold?: number | string;
  contactEmail?: string;
  contactPhone?: string;
  supportEmail?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const DEFAULT_CONFIG: Omit<WebsiteConfig, 'id' | 'updatedAt'> = {
  siteName: 'A.K.R Electronics',
  siteDescription: 'Premium IoT Solutions for India',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
  taxRate: new Decimal('18'),
  shippingBaseCost: new Decimal('50'),
  contactEmail: 'support@akrelectronics.com',
  supportEmail: 'support@akrelectronics.com',
  maintenanceMode: false,
};

export class WebsiteConfigService {
  static async getConfig(): Promise<WebsiteConfig> {
    let config = await WebsiteConfigRepository.get();

    if (!config) {
      config = await WebsiteConfigRepository.create(DEFAULT_CONFIG);
    }

    return config;
  }

  static async updateConfig(data: UpdateWebsiteConfigInput): Promise<WebsiteConfig | null> {
    const updates: Partial<Omit<WebsiteConfig, 'id'>> = {};

    if (data.siteName) updates.siteName = data.siteName;
    if (data.siteDescription) updates.siteDescription = data.siteDescription;
    if (data.logo) updates.logo = data.logo;
    if (data.favicon) updates.favicon = data.favicon;
    if (data.currency) updates.currency = data.currency;
    if (data.currencySymbol) updates.currencySymbol = data.currencySymbol;
    if (data.timezone) updates.timezone = data.timezone;
    if (data.taxRate) updates.taxRate = new Decimal(data.taxRate);
    if (data.shippingBaseCost) updates.shippingBaseCost = new Decimal(data.shippingBaseCost);
    if (data.freeShippingThreshold) updates.freeShippingThreshold = new Decimal(data.freeShippingThreshold);
    if (data.contactEmail) updates.contactEmail = data.contactEmail;
    if (data.contactPhone) updates.contactPhone = data.contactPhone;
    if (data.supportEmail) updates.supportEmail = data.supportEmail;
    if (data.address) updates.address = data.address;
    if (data.socialLinks) updates.socialLinks = data.socialLinks;

    return WebsiteConfigRepository.update(updates);
  }

  static async getCurrency(): Promise<{ code: string; symbol: string }> {
    const config = await this.getConfig();
    return {
      code: config.currency,
      symbol: config.currencySymbol,
    };
  }

  static async getTaxRate(): Promise<Decimal> {
    const config = await this.getConfig();
    return config.taxRate;
  }

  static async getShippingCost(orderTotal?: Decimal): Promise<Decimal> {
    const config = await this.getConfig();

    if (orderTotal && config.freeShippingThreshold && orderTotal.greaterThanOrEqualTo(config.freeShippingThreshold)) {
      return new Decimal('0');
    }

    return config.shippingBaseCost;
  }

  static async isMaintenanceMode(): Promise<boolean> {
    const config = await this.getConfig();
    return config.maintenanceMode;
  }

  static async enableMaintenanceMode(message?: string): Promise<void> {
    await WebsiteConfigRepository.enableMaintenanceMode(message);
  }

  static async disableMaintenanceMode(): Promise<void> {
    await WebsiteConfigRepository.disableMaintenanceMode();
  }

  static async getContactInfo(): Promise<{ email: string; phone?: string; address?: string }> {
    const config = await this.getConfig();
    return {
      email: config.contactEmail,
      phone: config.contactPhone,
      address: config.address,
    };
  }

  static async getSocialLinks(): Promise<Record<string, string>> {
    const config = await this.getConfig();
    return config.socialLinks || {};
  }
}
