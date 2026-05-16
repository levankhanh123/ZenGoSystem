// hooks/useShipper.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosConfig";

export function useShipperDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      console.log("[ShipperAPI] Fetching dashboard...");
      setLoading(true);
      const res = await axiosInstance.get("/shipper/dashboard");
      console.log("[ShipperAPI] Dashboard data:", res.data);
      setData(res.data);
    } catch (e) {
      console.error("[ShipperAPI] Dashboard error:", e);
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useShipperOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      console.log("[ShipperAPI] Fetching orders...");
      const res = await axiosInstance.get("/shipper/orders", {
        params: { page, ...params }
      });
      setOrders(res.data.data);
      setMeta(res.data);
      console.log("[ShipperAPI] Orders data:", res.data);
    } catch (e) {
      console.error("[ShipperAPI] Orders error:", e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const updateStatus = async (id, payload) => {
    console.log(`[ShipperAPI] Updating status for #${id}...`, payload);
    const res = await axiosInstance.put(`/shipper/orders/${id}/status`, payload);
    return res.data;
  };

  const receiveOrder = async (id) => {
    console.log(`[ShipperAPI] Receiving order #${id}...`);
    const res = await axiosInstance.post(`/shipper/orders/${id}/receive`);
    return res.data;
  };

  return { orders, loading, page, setPage, meta, updateStatus, receiveOrder, load };
}
