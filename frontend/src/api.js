import { useEffect, useState } from "react";

// Base URL for the API. Empty in dev so calls stay relative and hit the Vite
// proxy; set VITE_API_BASE to the backend origin (e.g. https://api.example.com)
// for a production build served from a different origin.
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export function useFetch(path) {
  const url = `${API_BASE}${path}`;
  const [state, setState] = useState({ url, data: null, loading: true, error: null });

  if (state.url !== url) {
    setState({ url, data: null, loading: true, error: null });
  }

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data) => alive && setState({ url, data, loading: false, error: null }))
      .catch((error) => alive && setState({ url, data: null, loading: false, error }));
    return () => {
      alive = false;
    };
  }, [url]);

  return state;
}
