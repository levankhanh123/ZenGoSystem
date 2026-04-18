export function buildQuery(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            query.set(key, value);
        }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
}

function getCsrfToken() {
    return document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
}

async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

export async function requestJson(
    path,
    { method = "GET", params = {}, body, signal } = {}
) {
    const csrfToken = getCsrfToken();
    const headers = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (csrfToken && method !== "GET") {
        headers["X-CSRF-TOKEN"] = csrfToken;
    }

    const response = await fetch(`${path}${buildQuery(params)}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            payload?.message || `Request failed with status ${response.status}`
        );
    }

    return payload;
}

export function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export function formatDate(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleDateString("vi-VN");
}

export function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleString("vi-VN");
}