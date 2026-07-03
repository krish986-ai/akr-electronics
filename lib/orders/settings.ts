export interface OrderSettings {
  minOrderAmount: number;
  lowOrderCharge: number;
  fastDeliveryCharge: number;
  fastDeliveryEnabled: boolean;
  codEnabled: boolean;
}

export const defaultOrderSettings: OrderSettings = {
  minOrderAmount: 0,
  lowOrderCharge: 0,
  fastDeliveryCharge: 100,
  fastDeliveryEnabled: true,
  codEnabled: true,
};
