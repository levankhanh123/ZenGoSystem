import { BACKEND_URL } from "../../config";

const apiBaseUrl = BACKEND_URL.replace(/\/$/, "");

function buildUrl(path, params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        searchParams.append(key, value);
    });

    const query = searchParams.toString();

    // Prevent double prefixing if path already starts with apiBaseUrl
    const normalizedPath = (path.startsWith("http") || (apiBaseUrl && path.startsWith(apiBaseUrl)))
        ? path
        : `${apiBaseUrl}${path}`;

    return query ? `${normalizedPath}?${query}` : normalizedPath;
}

async function request(path, options = {}) {
    const {
        method = "GET",
        params,
        body,
        headers = {},
    } = options;

    const isFormData = body instanceof FormData;
    const response = await fetch(buildUrl(path, params), {
        method,
        headers: {
            Accept: "application/json",
            ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(json.message || "Yeu cau that bai.");
    }

    return json;
}

export function get(path, params) {
    return request(path, { method: "GET", params });
}

export function post(path, body) {
    return request(path, { method: "POST", body });
}

export function put(path, body) {
    return request(path, { method: "PUT", body });
}

export function del(path, body) {
    return request(path, { method: "DELETE", body });
}
