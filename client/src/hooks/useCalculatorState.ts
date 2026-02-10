import { useState, useEffect, useCallback } from "react";
import {
  getQueryParams,
  loadFromLocalStorage,
  saveToLocalStorage,
  getRememberPref,
  setRememberPref,
} from "@/lib/calculatorUtils";

export function useCalculatorState(
  storageKey: string,
  fields: string[],
  defaults?: Record<string, string>
) {
  const [remember, setRememberState] = useState(() => getRememberPref(storageKey));

  const getInitial = useCallback(() => {
    const qp = getQueryParams();
    const saved = loadFromLocalStorage(storageKey);
    const base = defaults || {};
    const result: Record<string, string> = {};
    for (const f of fields) {
      result[f] = qp[f] || (remember && saved ? saved[f] : "") || base[f] || "";
    }
    return result;
  }, [storageKey, fields, defaults, remember]);

  const [values, setValues] = useState<Record<string, string>>(getInitial);

  const setValue = useCallback((field: string, val: string) => {
    setValues((prev) => {
      const next = { ...prev, [field]: val };
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const base = defaults || {};
    const result: Record<string, string> = {};
    for (const f of fields) {
      result[f] = base[f] || "";
    }
    setValues(result);
  }, [fields, defaults]);

  useEffect(() => {
    if (remember) {
      saveToLocalStorage(storageKey, values);
    }
  }, [values, remember, storageKey]);

  const setRemember = useCallback(
    (val: boolean) => {
      setRememberPref(storageKey, val);
      setRememberState(val);
    },
    [storageKey]
  );

  return { values, setValue, resetAll, remember, setRemember };
}
