import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import message from "antd/es/message";
import ApiService from "../services/api.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchCart = useCallback(async () => {
    if (!tokenRef.current) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await ApiService.getCart();
      setItems(data.items ?? []);
    } catch (e) {
      if (e.response?.status === 401) {
        setItems([]);
        setToken(null);
        localStorage.removeItem("token");
      } else {
        console.error("Fetch cart error:", e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLogin = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setItems([]);
  }, []);

  const addItem = useCallback(async (product, soLuong = 1) => {
    if (!tokenRef.current) {
      message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      window.location.href = "/login";
      return;
    }
    try {
      await ApiService.addToCart({ san_pham_id: product.id, so_luong: soLuong });
      await fetchCart();
      message.success("Đã thêm vào giỏ hàng 🛒");
    } catch (e) {
      message.error(e.response?.data?.message ?? "Thêm thất bại!");
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (chiTietId, soLuong) => {
    if (soLuong < 1) { removeItem(chiTietId); return; }

    setItems((prev) => prev.map((i) => i.id === chiTietId ? { ...i, so_luong: soLuong } : i));

    try {
      await ApiService.updateCartItem(chiTietId, { so_luong: soLuong });
    } catch (e) {
      message.error(e.response?.data?.message ?? "Cập nhật thất bại");
      fetchCart();
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (chiTietId) => {
    setItems((prev) => prev.filter((i) => i.id !== chiTietId));
    try {
      await ApiService.removeCartItem(chiTietId);
      message.success("Đã xoá sản phẩm");
    } catch {
      message.error("Xoá thất bại");
      fetchCart();
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      await ApiService.clearCart();
      message.success("Đã xoá toàn bộ giỏ hàng");
    } catch {
      message.error("Lỗi xoá giỏ hàng");
      fetchCart();
    }
  }, [fetchCart]);

  const totalItems = items.reduce((s, i) => s + (i.so_luong ?? 0), 0);
  const totalPrice = items.reduce((s, i) => s + (i.don_gia ?? 0) * (i.so_luong ?? 0), 0);

  return (
    <CartContext.Provider value={{
      items, loading, token,
      addItem, updateQuantity, removeItem, clearCart,
      totalItems, totalPrice,
      reloadCart: fetchCart,
      onLogin, logout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}