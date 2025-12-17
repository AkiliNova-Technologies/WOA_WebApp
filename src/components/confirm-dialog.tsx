import React from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "./ui/button";

export type DialogType = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showCloseButton?: boolean;
  hideCancel?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  showCloseButton = true,
  hideCancel = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      confirmButtonColor: "bg-red-600 hover:bg-red-700",
      borderColor: "border-red-100",
      bgColor: "bg-red-50",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "text-amber-500",
      confirmButtonColor: "bg-amber-600 hover:bg-amber-700",
      borderColor: "border-amber-100",
      bgColor: "bg-amber-50",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      confirmButtonColor: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-100",
      bgColor: "bg-blue-50",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      confirmButtonColor: "bg-emerald-600 hover:bg-emerald-700",
      borderColor: "border-emerald-100",
      bgColor: "bg-emerald-50",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 bg-opacity-100 transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-none transition-all sm:my-8 sm:w-full sm:max-w-xl">
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={!isLoading ? onClose : undefined}
              disabled={isLoading}
              className="absolute right-3 top-3 z-10 text-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Content */}
          <div className={`px-6 pt-6 pb-6 rounded-t-lg`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className={`px-6 py-4 ${config.borderColor} flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3`}
          >
            {!hideCancel && (
              <Button
                variant={"secondary"}
                onClick={!isLoading ? onClose : undefined}
                disabled={isLoading}
                className="mt-3 sm:mt-0 inline-flex flex-1 w-full justify-center rounded-sm shadow-none! bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant={"secondary"}
              type="button"
              onClick={!isLoading ? onConfirm : undefined}
              disabled={isLoading}
              className={`inline-flex flex-1 w-full justify-center rounded-sm shadow-none px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${config.confirmButtonColor} focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
