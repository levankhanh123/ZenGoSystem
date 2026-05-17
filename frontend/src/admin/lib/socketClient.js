import { io } from "socket.io-client";
import { SELLER_SOCKET_URL, SOCKET_URL } from "../../config";

let adminSocketClient = null;
let sellerSocketClient = null;

const noopSocketClient = {
    connect: () => {},
    disconnect: () => {},
    emit: () => {},
    on: () => {},
    off: () => {},
};

function createSocketClient(url) {
    return io(url, {
        autoConnect: false,
        transports: ["websocket", "polling"],
    });
}

function resolveAdminSocketUrl() {
    return SOCKET_URL;
}

function resolveSellerSocketUrl() {
    return SELLER_SOCKET_URL || resolveAdminSocketUrl();
}

export function getSocketClient() {
    if (!adminSocketClient) {
        const url = resolveAdminSocketUrl();
        adminSocketClient = url ? createSocketClient(url) : noopSocketClient;
    }

    return adminSocketClient;
}

export function getSellerSocketClient() {
    if (!sellerSocketClient) {
        const url = resolveSellerSocketUrl();
        sellerSocketClient = url ? createSocketClient(url) : noopSocketClient;
    }

    return sellerSocketClient;
}
