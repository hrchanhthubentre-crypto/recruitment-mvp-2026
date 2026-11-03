import { useCallback, useEffect, useState } from "react";
import { useStore } from "./store";

/** Mô phỏng tải dữ liệu lần đầu để có loading/error state. Lỗi xuất hiện khi bật “Mô phỏng lỗi mạng” ở thanh Xem trước. */
export function useFakeLoad(ms = 450) {
  const { simulateError } = useStore();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [n, setN] = useState(0);
  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => setState(simulateError ? "error" : "ready"), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  const retry = useCallback(() => setN((x) => x + 1), []);
  return { loading: state === "loading", error: state === "error", retry };
}

export function useDebounced<T>(v: T, ms = 250) {
  const [x, setX] = useState(v);
  useEffect(() => { const t = setTimeout(() => setX(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return x;
}
