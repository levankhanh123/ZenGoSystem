export const SELLER_API_BASE_URL =
    import.meta.env.VITE_SELLER_API_URL?.trim() || '/api';

export const SELLER_SOCKET_URL =
    import.meta.env.VITE_SELLER_SOCKET_URL?.trim() || `${window.location.protocol}//${window.location.hostname}:3001`;

function parseOptionalNumber(value) {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const SELLER_SHOP_ID = parseOptionalNumber(import.meta.env.VITE_SELLER_SHOP_ID);
export const SELLER_USER_ID = parseOptionalNumber(import.meta.env.VITE_SELLER_USER_ID);