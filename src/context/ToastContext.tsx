import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

type Action =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string };

const toastReducer = (state: Toast[], action: Action): Toast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.payload];
    case "REMOVE_TOAST":
      return state.filter((toast) => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (
    message: string,
    type: ToastType,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({ type: "ADD_TOAST", payload: { id, message, type, duration } });

    // Auto remove toast after duration
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", payload: id });
    }, duration);
  };

  const removeToast = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
