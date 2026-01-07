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
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Define user types
export type UserType = "vendor" | "customer" | "admin" | "client";

// Define all possible statuses from backend
export type BackendStatus =
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "rejected"
  | "deleted";

interface ActionConfig {
  value: BackendStatus;
  label: string;
  description: string;
  requiresReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    newStatus: BackendStatus,
    reason?: string
  ) => Promise<void> | void;
  currentStatus: BackendStatus;
  userType: UserType;
  title?: string;
  description?: string;
  loading?: boolean;
}

// Define actions configuration with proper type safety
type ActionsByStatus = {
  pending_approval?: ActionConfig[];
  active?: ActionConfig[];
  suspended?: ActionConfig[];
  rejected?: ActionConfig[];
  deleted?: ActionConfig[];
  deactivated?: ActionConfig[];
};

type ActionsByUserType = {
  vendor: ActionsByStatus;
  customer: ActionsByStatus;
  admin: ActionsByStatus;
  client: ActionsByStatus;
};

// Define actions configuration with proper type safety
const actionsConfig: ActionsByUserType = {
  vendor: {
    pending_approval: [
      {
        value: "active",
        label: "Approve",
        description: "Approve vendor KYC and activate their account",
        requiresReason: false,
      },
      {
        value: "rejected",
        label: "Reject",
        description: "Reject vendor KYC application",
        requiresReason: true,
        reasonLabel: "Rejection Reason",
        reasonPlaceholder: "Please provide a reason for rejection...",
      },
    ],
    active: [
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily suspend vendor access",
        requiresReason: true,
        reasonLabel: "Suspension Reason",
        reasonPlaceholder: "Please provide a reason for suspension...",
      },
    ],
    suspended: [
      {
        value: "active",
        label: "Activate",
        description: "Reactivate vendor account",
        requiresReason: false,
      },
    ],
    rejected: [], // No actions for rejected (vendor must resubmit)
    deactivated: [], // No actions for deactivated (vendor self-initiated)
  },
  customer: {
    active: [
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily suspend customer account",
        requiresReason: true,
        reasonLabel: "Suspension Reason",
        reasonPlaceholder: "Please provide a reason for suspension...",
      },
    ],
    suspended: [
      {
        value: "active",
        label: "Activate",
        description: "Reactivate customer account",
        requiresReason: false,
      },
    ],
  },
  admin: {
    active: [
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily suspend admin access",
        requiresReason: true,
        reasonLabel: "Suspension Reason",
        reasonPlaceholder: "Please provide a reason for suspension...",
      },
    ],
    suspended: [
      {
        value: "active",
        label: "Activate",
        description: "Reactivate admin account",
        requiresReason: false,
      },
    ],
  },
  client: {
    pending_approval: [
      {
        value: "active",
        label: "Approve",
        description: "Approve client account",
        requiresReason: false,
      },
      {
        value: "rejected",
        label: "Reject",
        description: "Reject client account",
        requiresReason: true,
        reasonLabel: "Rejection Reason",
        reasonPlaceholder: "Please provide a reason for rejection...",
      },
    ],
    active: [
      {
        value: "suspended",
        label: "Suspend",
        description: "Temporarily suspend client access",
        requiresReason: true,
        reasonLabel: "Suspension Reason",
        reasonPlaceholder: "Please provide a reason for suspension...",
      },
    ],
    suspended: [
      {
        value: "active",
        label: "Activate",
        description: "Reactivate client account",
        requiresReason: false,
      },
    ],
  },
};

// Get available actions for a user type and current status
const getAvailableActions = (
  userType: UserType,
  currentStatus: BackendStatus
): ActionConfig[] => {
  // Map backend status to internal status key
  let statusKey: keyof ActionsByStatus;

  if (currentStatus === "pending") {
    statusKey = "pending_approval";
  } else {
    statusKey = currentStatus;
  }

  // Get user actions
  const userActions = actionsConfig[userType];
  if (!userActions) return [];

  // Get actions for the status key
  return userActions[statusKey] || [];
};

// Get status display label
const getStatusLabel = (status: BackendStatus): string => {
  const labels: Record<BackendStatus, string> = {
    pending: "Pending Approval",
    active: "Active",
    suspended: "Suspended",
    rejected: "Rejected",
    deleted: "Deleted",
    deactivated: "Deactivated",
  };

  return labels[status] || status;
};

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  userType,
  title,
  description,
  loading = false,
}: StatusUpdateModalProps) => {
  const [selectedAction, setSelectedAction] = useState<BackendStatus | "">("");
  const [reason, setReason] = useState("");
  const [availableActions, setAvailableActions] = useState<ActionConfig[]>([]);
  const [selectedActionConfig, setSelectedActionConfig] =
    useState<ActionConfig | null>(null);

  // Reset state when modal opens or dependencies change
  useEffect(() => {
    if (isOpen) {
      setSelectedAction("");
      setReason("");

      // Get available actions based on user type and current status
      const actions = getAvailableActions(userType, currentStatus);
      setAvailableActions(actions);
      setSelectedActionConfig(null);
    }
  }, [isOpen, currentStatus, userType]);

  // Update selected action config when action changes
  useEffect(() => {
    if (selectedAction) {
      const action = availableActions.find((a) => a.value === selectedAction);
      setSelectedActionConfig(action || null);
      // Reset reason when action changes
      if (!action?.requiresReason) {
        setReason("");
      }
    } else {
      setSelectedActionConfig(null);
    }
  }, [selectedAction, availableActions]);

  const handleConfirm = async () => {
    if (
      selectedAction &&
      selectedAction !== currentStatus &&
      selectedActionConfig
    ) {
      // Validate reason if required
      if (selectedActionConfig.requiresReason && !reason.trim()) {
        return; // Validation will be handled by UI
      }

      await onConfirm(selectedAction, reason.trim() || undefined);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedAction("");
    setReason("");
    setSelectedActionConfig(null);
    onClose();
  };

  // Get title based on user type
  const getTitle = () => {
    if (title) return title;

    const userTypeLabels: Record<UserType, string> = {
      vendor: "Vendor",
      customer: "Customer",
      admin: "Admin",
      client: "Client",
    };

    return `Update ${userTypeLabels[userType] || "User"} Status`;
  };

  // Get description based on current status
  const getDescription = () => {
    if (description) return description;

    const currentStatusLabel = getStatusLabel(currentStatus);
    return `Current status: ${currentStatusLabel}. Select an action to change the status.`;
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = () => {
    if (
      !selectedAction ||
      selectedAction === currentStatus ||
      loading ||
      !selectedActionConfig
    ) {
      return true;
    }

    // If reason is required but not provided
    if (selectedActionConfig.requiresReason && !reason.trim()) {
      return true;
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status Display */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
              <span className="font-medium">
                {getStatusLabel(currentStatus)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userType === "vendor"
                  ? "Vendor"
                  : userType === "customer"
                  ? "Customer"
                  : userType === "admin"
                  ? "Admin"
                  : "Client"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-select">
              Available Actions <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedAction}
              onValueChange={(value) =>
                setSelectedAction(value as BackendStatus)
              }
              disabled={loading || availableActions.length === 0}
            >
              <SelectTrigger id="action-select" className="min-h-11">
                {selectedAction ? (
                  <span className="font-medium">
                    {availableActions.find((a) => a.value === selectedAction)
                      ?.label || "Select an action"}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    {availableActions.length === 0
                      ? "No actions available"
                      : "Select an action"}
                  </span>
                )}
              </SelectTrigger>
              <SelectContent>
                {availableActions.length > 0 ? (
                  availableActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{action.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {action.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-actions" disabled>
                    <div className="flex flex-col">
                      <span className="font-medium">No actions available</span>
                      <span className="text-xs text-gray-500">
                        Current status does not allow any changes
                      </span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {availableActions.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No administrative actions can be performed at this status.
              </p>
            )}
          </div>

          {/* Reason Input (conditionally shown) */}
          {selectedActionConfig?.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                {selectedActionConfig.reasonLabel}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={selectedActionConfig.reasonPlaceholder}
                className="min-h-[100px]"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                Please provide a clear reason for this action.
              </p>
            </div>
          )}

          {/* Action Description */}
          {selectedAction && selectedActionConfig && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Action:</span>{" "}
                {selectedActionConfig.description}
              </p>
              {selectedActionConfig.requiresReason && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  A reason is required for this action and will be recorded.
                </p>
              )}
            </div>
          )}

          {/* Info Box for Special Cases */}
          {userType === "customer" && currentStatus === "deactivated" && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">Note:</span> This customer
                deactivated their own account. Only the customer can reactivate
                their account through login.
              </p>
            </div>
          )}

          {userType === "vendor" && currentStatus === "rejected" && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">Note:</span> Vendor must resubmit
                their KYC application to return to "Pending Approval" status.
              </p>
            </div>
          )}

          {userType === "vendor" && currentStatus === "pending" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Note:</span> This vendor has
                submitted their KYC application and is awaiting approval. You
                can either approve or reject their application.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled()}
            className="bg-[#CC5500] hover:bg-[#CC5500]/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Action"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
