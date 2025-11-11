"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog closes */
  onOpenChange: (open: boolean) => void;
  /** Callback when delete is confirmed */
  onDelete: () => void;
  /** Optional loading state */
  loading?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onDelete,
  loading = false,
}: DeleteDialogProps) {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-left">
            Delete this profile from World of Afrika
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>Your account will be inactive, until you reopen it.</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>Your profile, shop and listings will no longer appear anywhere on World of Afrika.</span>
              </div>
            </div>
          </DialogDescription>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto h-11 px-8 border-0 rounded-full hover:bg-muted text-[#CC5500]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto rounded-full h-11 px-10 bg-destructive hover:bg-destructive/90 text-white font-semibold"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}