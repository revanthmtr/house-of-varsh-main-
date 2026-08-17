import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  img: string;
  category: string;
}

export interface ShippingDetails {
  name: string;
  phone: string;
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'user_id'>) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  checkout: (shipping: ShippingDetails) => Promise<{ success: boolean; error?: string; orderId?: number }>;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  checkout: async () => ({ success: false }),
  isCartOpen: false,
  setIsCartOpen: () => {},
  cartTotal: 0
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCart(data);
      })
      .catch(console.error);
    } else {
      setCart([]);
    }
  }, [token, user]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'user_id'>) => {
    if (!token) return alert('Please login to add to cart');
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.id) {
        setCart(prev => [...prev, data]);
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async (shipping: ShippingDetails) => {
    if (!token) return { success: false, error: 'Please sign in to place your order.' };
    if (cart.length === 0) return { success: false, error: 'Your bag is empty.' };
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...shipping, items: cart })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        return { success: false, error: data.error || data.message || `Order placement failed (${res.status})` };
      }
      setCart([]);
      return { success: true, orderId: data.order?.id };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Unable to connect to order server. Please try again.' };
    }
  };


  const cartTotal = cart.reduce((total, item) => {
    const p = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    return total + (isNaN(p) ? 0 : p);
  }, 0);


  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, checkout, isCartOpen, setIsCartOpen, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
