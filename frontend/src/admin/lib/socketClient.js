import { io } from "socket.io-client";

let adminSocketClient = null;
let sellerSocketClient = null;

function createSocketClient(url) {
    return io(url, {
        autoConnect: false,
        transports: ["websocket", "polling"],
    });
}

function resolveAdminSocketUrl() {
    if (import.meta.env.VITE_SOCKET_SERVER_URL) {
        return import.meta.env.VITE_SOCKET_SERVER_URL;
    }

    return `${window.location.protocol}//${window.location.hostname}:3001`;
}

function resolveSellerSocketUrl() {
    if (import.meta.env.VITE_SELLER_SOCKET_URL) {
        return import.meta.env.VITE_SELLER_SOCKET_URL;
    }

    return resolveAdminSocketUrl();
}

export function getSocketClient() {
    if (!adminSocketClient) {
        adminSocketClient = createSocketClient(resolveAdminSocketUrl());
    }

    return adminSocketClient;
}

export function getSellerSocketClient() {
    if (!sellerSocketClient) {
        sellerSocketClient = createSocketClient(resolveSellerSocketUrl());
    }

    return sellerSocketClient;
}