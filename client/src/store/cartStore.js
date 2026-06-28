import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),

  _persist: (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
    return items;
  },

  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find(i => i.product._id === product._id);
    let updated;
    if (existing) {
      updated = items.map(i =>
        i.product._id === product._id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
          : i
      );
    } else {
      updated = [...items, { product, quantity }];
    }
    set({ items: get()._persist(updated) });
  },

  removeItem: (productId) => {
    const updated = get().items.filter(i => i.product._id !== productId);
    set({ items: get()._persist(updated) });
  },

  updateQuantity: (productId, quantity) => {
    const updated = get().items.map(i =>
      i.product._id === productId ? { ...i, quantity } : i
    ).filter(i => i.quantity > 0);
    set({ items: get()._persist(updated) });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  get total() {
    return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

export default useCartStore;
