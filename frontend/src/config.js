function trimTrailingSlash(value) {
    return value?.trim().replace(/\/+$/, '') || '';
}

function deriveBackendUrl(apiUrl) {
    if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) {
        return '';
    }

    return apiUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
}

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL) || '/api';

export const BACKEND_URL =
    trimTrailingSlash(import.meta.env.VITE_BACKEND_URL) || deriveBackendUrl(API_BASE_URL);

export const SELLER_API_BASE_URL =
    trimTrailingSlash(import.meta.env.VITE_SELLER_API_URL) || API_BASE_URL;

export const SOCKET_URL =
    trimTrailingSlash(import.meta.env.VITE_SOCKET_SERVER_URL) ||
    (import.meta.env.DEV ? 'http://localhost:3001' : '');

export const SELLER_SOCKET_URL =
    trimTrailingSlash(import.meta.env.VITE_SELLER_SOCKET_URL) || SOCKET_URL;

export function assetUrl(path) {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/storage/${path}`;
    return BACKEND_URL ? `${BACKEND_URL}${normalizedPath}` : normalizedPath;
}

function parseOptionalNumber(value) {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const SELLER_SHOP_ID = parseOptionalNumber(import.meta.env.VITE_SELLER_SHOP_ID);
export const SELLER_USER_ID = parseOptionalNumber(import.meta.env.VITE_SELLER_USER_ID);
