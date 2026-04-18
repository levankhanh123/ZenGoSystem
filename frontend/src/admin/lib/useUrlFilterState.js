import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

function readFilters(searchParams, defaults) {
    return Object.keys(defaults).reduce((result, key) => {
        result[key] = searchParams.get(key) ?? defaults[key];
        return result;
    }, {});
}

function areFiltersEqual(left, right) {
    return Object.keys(left).every((key) => left[key] === right[key]);
}

export function useUrlFilterState(defaults) {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultsRef = useRef(defaults);
    const searchParamString = searchParams.toString();
    const [filters, setFiltersState] = useState(() => readFilters(searchParams, defaultsRef.current));

    useEffect(() => {
        defaultsRef.current = defaults;
    }, [defaults]);

    const setFilters = useCallback((nextValue) => {
        setFiltersState((current) => {
            const resolved = typeof nextValue === "function" ? nextValue(current) : nextValue;
            return areFiltersEqual(current, resolved) ? current : resolved;
        });
    }, []);

    useEffect(() => {
        const nextFilters = readFilters(searchParams, defaultsRef.current);

        setFiltersState((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
    }, [searchParams, searchParamString]);

    useEffect(() => {
        const nextSearchParams = new URLSearchParams(searchParams);

        Object.entries(filters).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) {
                nextSearchParams.delete(key);
                return;
            }

            nextSearchParams.set(key, String(value));
        });

        if (nextSearchParams.toString() !== searchParams.toString()) {
            setSearchParams(nextSearchParams, { replace: true });
        }
    }, [filters, searchParams, searchParamString, setSearchParams]);

    return [filters, setFilters];
}