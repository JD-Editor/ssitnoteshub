import { useCallback, useEffect, useState } from "react";

const KEY = "ssit-admin";
const CODE = "ssit-admin-2026";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(window.localStorage.getItem(KEY) === "1");
    const onStorage = () => setIsAdmin(window.localStorage.getItem(KEY) === "1");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((code: string) => {
    if (code.trim() !== CODE) return false;
    window.localStorage.setItem(KEY, "1");
    setIsAdmin(true);
    return true;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, signIn, signOut };
}
