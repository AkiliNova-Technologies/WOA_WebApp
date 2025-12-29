// components/status-update-modal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Define user types
export type UserType = "admin" | "vendor" | "client" | "customer";
export type UserStatus =
  | "active"
  | "suspended"
  | "pending_deletion"
  | "deleted"
  | "deactivated"
  | "pending_approval";

interface StatusUpdateModalProps<S extends string = UserStatus> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: S) => Promise<void> | void;
  currentStatus: S;
  userType: UserType;
  title?: string;
  description?: string;
  loading?: boolean;
  userId?: string; // For making API calls directly if needed
}

// Status configuration for each user type
const statusConfig = {
  admin: {
    options: [
      {
        value: "active",
        label: "Activate",
        description: "Admin can access their account",
      },
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily restrict admin access",
      },
    ],
    endpoints: {
      activate: (id: string) => `/api/v1/admin/admins/${id}/activate`,
      suspend: (id: string) => `/api/v1/admin/admins/${id}/suspend`,
      delete: (id: string) => `/api/v1/admin/admins/${id}`,
    },
  },
  vendor: {
    options: [
      {
        value: "active",
        label: "Activate",
        description: "Vendor can access their shop",
      },
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily suspend vendor access",
      },
      {
        value: "deactivated",
        label: "Deactivate",
        description: "Vendor shop is closed",
      },
      {
        value: "pending",
        label: "Approve",
        description: "Approve vendor KYC and issue invite",
      },
    ],
    endpoints: {
      activate: (_id: string) => `/api/v1/vendor/activate`,
      suspend: (_id: string) => `/api/v1/vendor/suspend`,
      approve: (_id: string) => `/api/v1/vendor/approve`,
      close: (_id: string) => `/api/v1/vendor/close`,
      reactivate: (id: string) => `/api/v1/vendor/${id}/reactivate`,
    },
  },
  client: {
    options: [
      {
        value: "active",
        label: "Activate",
        description: "Client can access their account",
      },
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily restrict client access",
      },
      {
        value: "pending_deletion",
        label: "Delete",
        description: "Mark for deletion (soft delete)",
      },
    ],
    endpoints: {
      reactivate: (id: string) => `/api/v1/clients/admin/reactivate/${id}`,
    },
  },
  customer: {
    options: [
      {
        value: "active",
        label: "Active",
        description: "Customer can access their account",
      },
      {
        value: "suspended",
        label: "Suspended",
        description: "Temporarily restrict account access",
      },
      {
        value: "deactivated",
        label: "Deactivated",
        description: "Customer deactivated their account",
      },
      {
        value: "pending_deletion",
        label: "Pending Deletion",
        description: "Account scheduled for deletion",
      },
      {
        value: "deleted",
        label: "Deleted",
        description: "Account has been deleted",
      },
    ],
    endpoints: {},
  },
} as const;

export const StatusUpdateModal = <S extends string = UserStatus>({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  userType,
  title,
  description,
  loading = false,
}: StatusUpdateModalProps<S>) => {
  const [selectedStatus, setSelectedStatus] = useState<S>(currentStatus);
  const [statusOptions, setStatusOptions] = useState<
    Array<{
      value: S;
      label: string;
      description?: string;
    }>
  >([]);

  // Reset selected status when modal opens or currentStatus changes
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);

      // Get available options based on user type
      const config = statusConfig[userType];
      if (config) {
        // Filter out current status from options and cast values to S
        const availableOptions = config.options
          .filter((option) => option.value !== currentStatus)
          .map((option) => ({
            value: option.value as S,
            label: option.label,
            description: option.description,
          }));
        setStatusOptions(availableOptions);
      }
    }
  }, [isOpen, currentStatus, userType]);

  const handleConfirm = async () => {
    if (selectedStatus !== currentStatus) {
      await onConfirm(selectedStatus);
    }
    onClose();
  };

  // Get title and description based on user type
  const getTitle = () => {
    if (title) return title;
    switch (userType) {
      case "admin":
        return "Update Admin Status";
      case "vendor":
        return "Update Vendor Status";
      case "client":
        return "Update Client Status";
      default:
        return "Update Status";
    }
  };

  const getDescription = () => {
    if (description) return description;
    switch (userType) {
      case "admin":
        return "Change the status of this admin user";
      case "vendor":
        return "Change the status of this vendor";
      case "client":
        return "Change the status of this client";
      default:
        return "Select a new status for this user";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status-select">New Status</Label>
            <Select
              value={selectedStatus as unknown as string}
              onValueChange={(value: string) =>
                setSelectedStatus(value as unknown as S)
              }
              disabled={loading}
            >
              <SelectTrigger id="status-select" className="min-h-11">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.length > 0 ? (
                  statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value as unknown as string}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={currentStatus as unknown as string} disabled>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        No other options available
                      </span>
                      <span className="text-xs text-gray-500">
                        Current status is the only available option
                      </span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              loading ||
              selectedStatus === currentStatus ||
              statusOptions.length === 0
            }
            className="bg-[#CC5500] hover:bg-[#CC5500]/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};