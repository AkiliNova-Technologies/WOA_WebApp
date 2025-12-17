import { toast } from "sonner";

interface ToastConfig {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toastSuccess = (message: string, config?: ToastConfig) => {
  toast.success(message, {
    description: config?.description,
    action: config?.action,
    duration: 4000,
  });
};

export const toastError = (message: string, config?: ToastConfig) => {
  toast.error(message, {
    description: config?.description,
    action: config?.action,
    duration: 5000,
  });
};

export const toastWarning = (message: string, config?: ToastConfig) => {
  toast.warning(message, {
    description: config?.description,
    action: config?.action,
    duration: 4000,
  });
};

export const toastInfo = (message: string, config?: ToastConfig) => {
  toast.info(message, {
    description: config?.description,
    action: config?.action,
    duration: 3000,
  });
};

export const toastLoading = (message: string, config?: ToastConfig) => {
  const id = toast.loading(message, {
    description: config?.description,
    duration: Infinity, // Will be manually dismissed
  });
  return id;
};

export const toastUpdate = (
  id: string | number,
  type: "success" | "error" | "warning" | "info",
  message: string,
  config?: ToastConfig
) => {
  toast.dismiss(id);

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    case "info":
      toast.info(message, config);
      break;
  }
};

// Dismiss toast
export const toastDismiss = (id?: string | number) => {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
};

// Promise toast
export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  config?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      const message =
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success;
      return message;
    },
    error: (error) => {
      const message =
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;
      return message;
    },
    ...config,
  });
};

export { toast };
