'use client';

import React, { createContext, useContext } from 'react';
import { useOrders } from '@/hooks/useOrders';

type OrdersContextType = ReturnType<typeof useOrders>;

const OrdersContext = createContext<OrdersContextType | null>(null);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ordersState = useOrders();
  return <OrdersContext.Provider value={ordersState}>{children}</OrdersContext.Provider>;
};

export function useGlobalOrders(): OrdersContextType {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useGlobalOrders must be used within an OrdersProvider');
  }
  return context;
}
