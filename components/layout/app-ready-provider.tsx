"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface AppReadyContextValue {
  ready: boolean;
  setReady: () => void;
}

const AppReadyContext =
  createContext<AppReadyContextValue | null>(
    null,
  );

export function AppReadyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReadyState] =
    useState(false);

  const setReady = useCallback(() => {
    setReadyState(true);
  }, []);

  return (
    <AppReadyContext.Provider
      value={{
        ready,
        setReady,
      }}
    >
      {children}
    </AppReadyContext.Provider>
  );
}

export function useAppReady() {
  const context =
    useContext(AppReadyContext);

  if (!context) {
    throw new Error(
      "useAppReady must be used inside AppReadyProvider.",
    );
  }

  return context;
}