import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import images from "@/assets/images";

type CaseStatus = "open" | "in-progress" | "resolved" | "closed" | "flagged";
type DetailTab = "overview" | "actions-history";

interface ComplianceReportDetail {
  id: string;
  reportId: string;
  reportedOn: string;
  status: CaseStatus;
  issueType: string;
  description: string;
  reporterFullName: string;
  reporterEmail: string;
  reporterPhone: string;
  reportedItemName: string;
  reportedItemEmail: string;
  reportedItemPhone: string;
}

// Status update modal component
function StatusUpdateModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: CaseStatus;
  onStatusUpdate: (newStatus: CaseStatus, note: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    useState<CaseStatus>(currentStatus);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus || note.trim()) {
      onStatusUpdate(selectedStatus, note);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Dropdown */}
          <div className="space-y-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as CaseStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note Textarea (shows when status is changed or flagged) */}
          {(selectedStatus !== currentStatus ||
            selectedStatus === "flagged") && (
            <div className="space-y-2">
              <Textarea
                placeholder="Enter your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-black hover:bg-black/90 text-white"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminComplianceReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock report data - in real app, fetch based on reportId
  const reportData: ComplianceReportDetail = {
    id: reportId || "1",
    reportId: "RPT-120625-001",
    reportedOn: "7 Jan 2025",
    status: "open",
    issueType: "Review contains nudity or erotic messages",
    description:
      "The review posted includes sexually explicit language and references that are not related to the product. It violates community guidelines and makes the platform unsafe for other users.",
    reporterFullName: "Alice Johnson",
    reporterEmail: "alice.johnson@email.com",
    reporterPhone: "+447911123456",
    reportedItemName: "Joe Doe",
    reportedItemEmail: "j.doe@gmail.com",
    reportedItemPhone: "+447911123456",
  };

  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(
    reportData.status
  );

  const handleStatusUpdate = (newStatus: CaseStatus, note: string) => {
    setCurrentStatus(newStatus);
    console.log(`Status updated to: ${newStatus}`, `Note: ${note}`);
    // In real app, make API call to update status
  };

  const statusConfig = {
    open: {
      label: "Report is open",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "in-progress": {
      label: "In progress",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    flagged: {
      label: "Flagged",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  const getTabButtonClass = (tab: DetailTab) => {
    const baseClass = "px-4 py-3 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#303030] rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold text-lg">Back</span>
                </div>
                <Badge
                  variant="outline"
                  className={`${statusConfig[currentStatus].className} font-medium`}
                >
                  {statusConfig[currentStatus].label}
                </Badge>
              </div>
            </div>

            {/* Hero Section with Report Info */}

            {/* ================= COVER IMAGE ================= */}
            <div className="relative w-full h-[380px] overflow-hidden rounded-2xl">
              <img
                src={images.Placeholder}
                alt="Cover"
                className="object-cover w-full h-full"
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3"></div>
            </div>

            <div className="relative mx-6 space-y-6 z-10">
              {/* Intro Section */}
              <Card className="-mt-24">
                <div className="bg-white rounded-2xl p-8 w-full">
                  <h1 className="text-3xl font-bold mb-2">
                    {reportData.reportId}
                  </h1>
                  <p className="text-lg mb-6">
                    Reported on: {reportData.reportedOn}
                  </p>

                  {/* Tab Navigation */}
                  <div className="flex gap-6 border-b border-white/20">
                    <button
                      className={getTabButtonClass("overview")}
                      onClick={() => setActiveTab("overview")}
                    >
                      Overview
                    </button>
                    <button
                      className={getTabButtonClass("actions-history")}
                      onClick={() => setActiveTab("actions-history")}
                    >
                      Actions History
                    </button>
                  </div>
                </div>
              </Card>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <>
                  {/* Reporter Details */}
                  <Card className="border shadow-none">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-semibold mb-6">
                        Reporter details
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Full name
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reporterFullName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Phone number
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reporterPhone}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Email address
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reporterEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="ghost"
                          className="text-sm p-0 h-auto hover:bg-transparent"
                        >
                          More about the customer
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reported Item */}
                  <Card className="border shadow-none">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-semibold mb-6">
                        Reported item
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Full name
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reportedItemName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Phone number
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reportedItemPhone}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                            Email Address
                          </Label>
                          <p className="font-medium text-lg">
                            {reportData.reportedItemEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="ghost"
                          className="text-sm p-0 h-auto hover:bg-transparent"
                        >
                          More about the customer
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Report Posted */}
                  <Card className="border shadow-none">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-semibold mb-6">
                        Report Posted
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            Issue type
                          </Label>
                          <p className="text-lg font-semibold">
                            {reportData.issueType}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            Description of issue
                          </Label>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {reportData.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Report Status */}
                  <Card className="border shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            Report Status
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Update report status
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border border-red-600/30 rounded-full bg-red-600/10"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Change Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Actions History Tab */}
              {activeTab === "actions-history" && (
                <Card className="border shadow-none">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold mb-6">
                      Actions History
                    </h2>
                    <div className="text-center py-12 text-gray-500">
                      <p>No actions history available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStatus={currentStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
