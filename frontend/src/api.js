import { useEffect, useState } from "react";

export function useFetch(url) {
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
