import { toast } from "react-hot-toast";

export const useToast = () => {
  const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) =>
      toast(message, {
        icon: "⚠️",
      }),
    info: (message: string) => toast(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: string;
        success: string;
        error: string;
      }
    ) => toast.promise(promise, msgs),
  };

  return showToast;
};
