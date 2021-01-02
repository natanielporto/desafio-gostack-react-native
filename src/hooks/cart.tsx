import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const cart = [...products, { ...product, quantity: 1 }];
      setProducts(cart);
      await AsyncStorage.setItem('@GoMarketPlace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const add = products.map(el =>
        el.id === id ? { ...el, quantity: el.quantity + 1 } : el,
      );
      setProducts(add);
      await AsyncStorage.setItem('@GoMarketPlace:cart', JSON.stringify(add));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const subtract = products.map(el =>
        el.id === id && el.quantity > 0
          ? { ...el, quantity: el.quantity - 1 }
          : el,
      );
      setProducts(subtract);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(subtract),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
