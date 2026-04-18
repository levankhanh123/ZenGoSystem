import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { SELLER_SHOP_ID, SELLER_USER_ID } from '../config';

const STORAGE_KEY = 'zengo.seller.session';

const SellerSessionContext = createContext(null);

function readStoredSelection() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      userId: Number(parsed.userId || SELLER_USER_ID) || null,
      shopId: Number(parsed.shopId || SELLER_SHOP_ID) || null,
    };
  } catch {
    return {
      userId: SELLER_USER_ID || null,
      shopId: SELLER_SHOP_ID || null,
    };
  }
}

export function SellerSessionProvider({ children }) {
  const [selection, setSelection] = useState(() => readStoredSelection());
  const [state, setState] = useState({
    loading: true,
    error: '',
    selectedUser: null,
    selectedShop: null,
    availableUsers: [],
    availableShops: [],
  });

  const loadSession = async (nextSelection = selection) => {
    setState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await api.get('/seller/context', {
        params: {
          user_id: nextSelection.userId || undefined,
          shop_id: nextSelection.shopId || undefined,
        },
      });
      const payload = response.data?.data || {};
      const resolvedUserId = payload.selected_user?.id || null;
      const resolvedShopId = payload.selected_shop?.id || null;

      setSelection({ userId: resolvedUserId, shopId: resolvedShopId });
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userId: resolvedUserId, shopId: resolvedShopId })
      );

      setState({
        loading: false,
        error: '',
        selectedUser: payload.selected_user || null,
        selectedShop: payload.selected_shop || null,
        availableUsers: payload.available_users || [],
        availableShops: payload.available_shops || [],
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || 'Không thể tải ngữ cảnh seller.',
      }));
    }
  };

  useEffect(() => {
    loadSession(selection);
  }, []);

  const updateSelection = async ({ userId, shopId }) => {
    const nextSelection = {
      userId: Number(userId || 0) || null,
      shopId: Number(shopId || 0) || null,
    };

    await loadSession(nextSelection);
  };

  const value = useMemo(
    () => ({
      ...state,
      selectedUserId: selection.userId,
      selectedShopId: selection.shopId,
      reloadSession: () => loadSession(selection),
      updateSelection,
    }),
    [selection.shopId, selection.userId, state]
  );

  return <SellerSessionContext.Provider value={value}>{children}</SellerSessionContext.Provider>;
}

export function useSellerSession() {
  const context = useContext(SellerSessionContext);

  if (!context) {
    throw new Error('useSellerSession must be used within SellerSessionProvider');
  }

  return context;
}