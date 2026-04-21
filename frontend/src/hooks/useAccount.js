// hooks/useAccount.js
// ─────────────────────────────────────────────────────────────────────────────
// Central hook cho tất cả API calls của Account page
// Mỗi section có hook riêng để dễ tái sử dụng
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const BASE = "http://127.0.0.1:8000/api/account";

// Lấy token từ localStorage (Sanctum)
const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// Helper fetch wrapper
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Lỗi server");
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────
export function useProfile() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`${BASE}/profile`);
      setUser(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateProfile = async (fields) => {
    const data = await apiFetch(`${BASE}/profile`, {
      method: "PUT",
      body: JSON.stringify(fields),
    });
    setUser(data.user);
    return data;
  };

  const updateAvatar = async (file) => {
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch(`${BASE}/profile/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Lỗi upload");
    setUser((u) => ({ ...u, anh_dai_dien: data.anh_dai_dien }));
    return data;
  };

  const changePassword = async (payload) => {
    return await apiFetch(`${BASE}/profile/password`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  return { user, loading, error, updateProfile, updateAvatar, changePassword, reload: load };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────────────────────────────────────────
export function useAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`${BASE}/addresses`);
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAddress = async (form) => {
    const data = await apiFetch(`${BASE}/addresses`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    await load();
    return data;
  };

  const updateAddress = async (id, form) => {
    const data = await apiFetch(`${BASE}/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    await load();
    return data;
  };

  const deleteAddress = async (id) => {
    await apiFetch(`${BASE}/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = async (id) => {
    await apiFetch(`${BASE}/addresses/${id}/default`, { method: "PATCH" });
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, la_mac_dinh: a.id === id ? 1 : 0 }))
    );
  };

  return { addresses, loading, addAddress, updateAddress, deleteAddress, setDefault };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────────────────────────────────────
export function useWallet() {
  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${BASE}/wallet`)
      .then(setWallet)
      .finally(() => setLoading(false));
  }, []);

  return { wallet, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState("all");
  const [page, setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (status !== "all") params.set("status", status);
      const data = await apiFetch(`${BASE}/orders?${params}`);
      setOrders(data.data);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async (id, lyDoHuy) => {
    await apiFetch(`${BASE}/orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ ly_do_huy: lyDoHuy }),
    });
    // Cập nhật local state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, trang_thai_don_hang: "da_huy", ly_do_huy: lyDoHuy }
          : o
      )
    );
  };

  return {
    orders, meta, loading,
    status, setStatus,
    page, setPage,
    cancelOrder,
    reload: load,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notis, setNotis]     = useState([]);
  const [meta, setMeta]       = useState(null);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType]       = useState("all");
  const [page, setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (type !== "all") params.set("type", type);
      const data = await apiFetch(`${BASE}/notifications?${params}`);
      setNotis(data.data);
      setMeta(data);
      setUnread(data.unread_count);
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await apiFetch(`${BASE}/notifications/${id}/read`, { method: "PATCH" });
    setNotis((prev) => prev.map((n) => (n.id === id ? { ...n, da_doc: 1 } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await apiFetch(`${BASE}/notifications/read-all`, { method: "PATCH" });
    setNotis((prev) => prev.map((n) => ({ ...n, da_doc: 1 })));
    setUnread(0);
  };

  return {
    notis, meta, unread, loading,
    type, setType,
    page, setPage,
    markRead, markAllRead,
  };
}