import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  slug?: string;
  title: string;
  price: number;
  image_url: string;
  date: string;
  period: string;
  isPrivate: boolean;
  quantity: number;
  pricing_model?: 'fixed' | 'dynamic' | 'group' | 'custom' | 'tiered';
  price_1_person?: number;
  price_2_people?: number;
  price_3_6_people?: number;
  price_7_19_people?: number;
  group_price?: number;
  max_group_size?: number;
  selected_option?: { title: string; extra_price: number };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, date: string, period: string) => void;
  updateQuantity: (id: string, date: string, period: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('eco_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('eco_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      // Check if exact same item exists (id, date, period, privacy)
      const existing = prev.find(i => 
        i.id === newItem.id && 
        i.date === newItem.date && 
        i.period === newItem.period &&
        i.isPrivate === newItem.isPrivate &&
        i.selected_option?.title === newItem.selected_option?.title
      );

      if (existing) {
        const newQuantity = existing.max_group_size 
          ? Math.min(existing.max_group_size, existing.quantity + 1)
          : existing.quantity + 1;
        return prev.map(i => i === existing ? { ...i, quantity: newQuantity } : i);
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string, date: string, period: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.date === date && i.period === period)));
  };

  const updateQuantity = (id: string, date: string, period: string, quantity: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id && i.date === date && i.period === period) {
        const maxLimit = i.max_group_size || 999;
        const validQuantity = Math.min(maxLimit, Math.max(1, quantity));
        
        let newPrice = i.price;
        if (i.pricing_model === 'dynamic') {
          if (validQuantity === 1) newPrice = i.price_1_person || 0;
          else if (validQuantity === 2) newPrice = i.price_2_people || 0;
          else if (validQuantity >= 3 && validQuantity <= 6) newPrice = i.price_3_6_people || 0;
          else if (validQuantity >= 7) newPrice = i.price_7_19_people || 0;
        } else if (i.pricing_model === 'group' && i.group_price) {
          newPrice = i.group_price / (validQuantity || 1);
        } else if (i.pricing_model === 'custom') {
          newPrice = 0;
        }
        
        // Add extra price from selected option if it exists
        if (i.selected_option?.extra_price) {
          newPrice += i.selected_option.extra_price;
        }

        return { ...i, quantity: validQuantity, price: newPrice };
      }
      return i;
    }));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
