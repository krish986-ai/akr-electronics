import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export interface WebsiteConfig {
  id: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  taxRate: Decimal;
  shippingBaseCost: Decimal;
  freeShippingThreshold?: Decimal;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  contactEmail: string;
  contactPhone?: string;
  supportEmail: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  updatedAt: Date;
}

const CONFIG_ID = 'main';

export class WebsiteConfigRepository {
  static async get(): Promise<WebsiteConfig | null> {
    const snapshot = await getDoc(doc(db, 'website_config', CONFIG_ID));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async create(data: Omit<WebsiteConfig, 'id' | 'updatedAt'>): Promise<WebsiteConfig> {
    const config: WebsiteConfig = {
      ...data,
      id: CONFIG_ID,
      updatedAt: new Date(),
    };
    await setDoc(doc(db, 'website_config', CONFIG_ID), this.toFirestore(config));
    return config;
  }

  static async update(data: Partial<Omit<WebsiteConfig, 'id'>>): Promise<WebsiteConfig | null> {
    await updateDoc(doc(db, 'website_config', CONFIG_ID), this.toFirestore({ ...data, updatedAt: new Date() }));
    return this.get();
  }

  static async enableMaintenanceMode(message?: string): Promise<void> {
    await this.update({
      maintenanceMode: true,
      maintenanceMessage: message,
    });
  }

  static async disableMaintenanceMode(): Promise<void> {
    await this.update({
      maintenanceMode: false,
      maintenanceMessage: undefined,
    });
  }

  static toFirestore(config: Partial<WebsiteConfig>): any {
    return {
      ...config,
      taxRate: config.taxRate?.toString(),
      shippingBaseCost: config.shippingBaseCost?.toString(),
      freeShippingThreshold: config.freeShippingThreshold?.toString(),
      updatedAt: config.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): WebsiteConfig {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id || CONFIG_ID,
      taxRate: new Decimal(data.taxRate || '0'),
      shippingBaseCost: new Decimal(data.shippingBaseCost || '0'),
      freeShippingThreshold: data.freeShippingThreshold ? new Decimal(data.freeShippingThreshold) : undefined,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
