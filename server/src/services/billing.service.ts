// =============================================================================
// server/src/services/billing.service.ts
// Billing foundation business logic.
// Calculates subtotal, discounts, CGST/SGST taxes, service charge, and grand total.
// No payment gateway integration — JSON receipt payload generation only.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as orderRepo from '../repositories/order.repository';
import type { GenerateBillInput } from '../validators/billing.validator';

function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export interface ReceiptPayload {
  receiptId: string;
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  tableNumber: number | null;
  createdAt: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  financials: {
    subtotal: number;
    discount: number;
    taxableAmount: number;
    taxes: {
      cgstRate: string;
      cgstAmount: number;
      sgstRate: string;
      sgstAmount: number;
      totalGst: number;
    };
    serviceChargeRate: string;
    serviceChargeAmount: number;
    grandTotal: number;
  };
  status: string;
}

export async function generateBill(input: GenerateBillInput): Promise<ReceiptPayload> {
  const order = await orderRepo.findOrderById(input.orderId);
  if (!order) {
    throw AppError.notFound('Order');
  }

  const items = order.items.map((i: any) => {
    const unitPrice = Number(i.priceAtOrder);
    const total = roundToTwoDecimals(unitPrice * i.quantity);
    return {
      menuItemId: i.menuItemId,
      name: i.menuItem?.name ?? 'Dish Item',
      quantity: i.quantity,
      unitPrice,
      total,
    };
  });

  const subtotal = roundToTwoDecimals(items.reduce((sum, item) => sum + item.total, 0));

  let discount = 0;
  if (input.discountPercentage !== undefined && input.discountPercentage > 0) {
    discount = roundToTwoDecimals((subtotal * input.discountPercentage) / 100);
  } else if (input.discountAmount !== undefined && input.discountAmount > 0) {
    discount = Math.min(subtotal, roundToTwoDecimals(input.discountAmount));
  }

  const taxableAmount = Math.max(0, roundToTwoDecimals(subtotal - discount));

  // Taxes: 2.5% CGST + 2.5% SGST = 5% Total GST
  const cgstAmount = roundToTwoDecimals(taxableAmount * 0.025);
  const sgstAmount = roundToTwoDecimals(taxableAmount * 0.025);
  const totalGst = roundToTwoDecimals(cgstAmount + sgstAmount);

  // Service charge: 5% (optional)
  const serviceChargeAmount = input.includeServiceCharge !== false
    ? roundToTwoDecimals(taxableAmount * 0.05)
    : 0;

  const grandTotal = roundToTwoDecimals(taxableAmount + totalGst + serviceChargeAmount);

  // Mark order as billed if not already
  if (order.status !== 'billed') {
    await orderRepo.updateOrder(order.id, {
      status: 'billed',
      total: grandTotal,
    });
  }

  return {
    receiptId: `REC-${order.id.slice(0, 8).toUpperCase()}`,
    orderId: order.id,
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
    tableNumber: order.table?.number ?? null,
    createdAt: order.createdAt.toISOString(),
    items,
    financials: {
      subtotal,
      discount,
      taxableAmount,
      taxes: {
        cgstRate: '2.5%',
        cgstAmount,
        sgstRate: '2.5%',
        sgstAmount,
        totalGst,
      },
      serviceChargeRate: input.includeServiceCharge !== false ? '5%' : '0%',
      serviceChargeAmount,
      grandTotal,
    },
    status: 'billed',
  };
}

export async function getReceiptByOrderId(orderId: string): Promise<ReceiptPayload> {
  return generateBill({ orderId, includeServiceCharge: true });
}
