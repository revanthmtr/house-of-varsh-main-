import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { resolveApiUrl } from '../utils/api';

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
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
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
  cartTotal: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Immediate hydrate from guest storage to prevent initial flicker
    try {
      const stored = localStorage.getItem('hov_guest_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart with backend whenever auth changes
  const fetchUserCart = useCallback(async (authToken: string) => {
    try {
      // 1. Check if there were guest items to merge
      const guestCartRaw = localStorage.getItem('hov_guest_cart');
      const guestItems: CartItem[] = guestCartRaw ? JSON.parse(guestCartRaw) : [];

      const res = await fetch(resolveApiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to load bag from server');
      const serverData = await res.json();

      if (Array.isArray(serverData)) {
        if (guestItems.length > 0) {
          // Upload guest items to server
          for (const item of guestItems) {
            await fetch(resolveApiUrl('/api/cart'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
              body: JSON.stringify({
                product_id: item.product_id || 0,
                name: item.name,
                price: String(item.price),
                img: item.img || '',
                category: item.category || 'new',
              }),
            }).catch(() => {});
          }
          localStorage.removeItem('hov_guest_cart');

          // Re-fetch merged cart
          const mergedRes = await fetch(resolveApiUrl('/api/cart'), {
            headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
          });
          if (mergedRes.ok) {
            const mergedData = await mergedRes.json();
            if (Array.isArray(mergedData)) setCart(mergedData);
          }
        } else {
          setCart(serverData);
        }
      }
    } catch (err) {
      console.warn('Backend cart sync note (using cached/local bag):', err);
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchUserCart(token);
    } else {
      // Guest state
      try {
        const stored = localStorage.getItem('hov_guest_cart');
        setCart(stored ? JSON.parse(stored) : []);
      } catch {
        setCart([]);
      }
    }
  }, [token, user, fetchUserCart]);

  /**
   * High-Performance Optimistic Add-To-Bag
   * Adds the item instantly to state with 0ms visual latency, opens the private bag drawer,
   * and synchronizes with the server in the background.
   */
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const tempId = Date.now();
    const newItem: CartItem = {
      id: tempId,
      product_id: item.product_id || 0,
      name: item.name,
      price: String(item.price),
      img: item.img || '',
      category: item.category || 'new',
    };

    // 1. Instant UI update (Optimistic)
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);

    // 2. Persist to guest local storage
    if (!token) {
      localStorage.setItem('hov_guest_cart', JSON.stringify([...cart, newItem]));
      return;
    }

    // 3. Authenticated Server Sync
    try {
      const res = await fetch(resolveApiUrl('/api/cart'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: newItem.product_id,
          name: newItem.name,
          price: newItem.price,
          img: newItem.img,
          category: newItem.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          // Replace tempId with real database ID
          setCart((prev) => prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message && errData.message.includes('sold out')) {
          alert(errData.message);
          setCart((prev) => prev.filter((c) => c.id !== tempId));
        }
      }
    } catch (err) {
      console.error('Server sync error on addToCart:', err);
      // Item remains safely in local state for seamless shopping
    }
  };

  /**
   * Optimistic Removal
   */
  const removeFromCart = async (id: number) => {
    // 1. Instant UI update
    setCart((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (!token) {
        localStorage.setItem('hov_guest_cart', JSON.stringify(next));
      }
      return next;
    });

    if (!token) return;

    // 2. Server Sync
    try {
      await fetch(resolveApiUrl(`/api/cart/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
    } catch (err) {
      console.error('Server sync error on removeFromCart:', err);
    }
  };

  /**
   * Cash on Delivery / Standard Checkout
   */
  const checkout = async (shipping: ShippingDetails) => {
    if (cart.length === 0) return { success: false, error: 'Your bag is currently empty.' };

    const activeToken = token || localStorage.getItem('hov_token') || localStorage.getItem('chinni_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const res = await fetch(resolveApiUrl('/api/checkout'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...shipping, items: cart }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        setCart([]);
        localStorage.removeItem('hov_guest_cart');
        return { success: true, orderId: data.order?.id };
      } else {
        return { success: false, error: data.error || data.message || 'Failed to place order. Please try again.' };
      }
    } catch (err: any) {
      console.error('Checkout network error:', err);
      return { success: false, error: 'Network error connecting to server. Please try again.' };
    }
  };


  // Cart total computation in INR
  const cartTotal = cart.reduce((sum, item) => {
    const numeric = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    return sum + (isNaN(numeric) ? 0 : numeric);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        checkout,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
