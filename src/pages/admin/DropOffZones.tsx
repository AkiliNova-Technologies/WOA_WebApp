import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import {
  EyeIcon,

  ListFilter,
  Plus,
  PenIcon,
  MapPin,
  Box,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

type LogisticsStatus = "all" | "active" | "inactive" | "maintenance";

interface LogisticsStats {
  totalPoints: number;
  activePoints: number;
  newPoints: number;
  avgProductsPerPoint: number;
}

interface DropOffPoint {
  id: string;
  name: string;
  manager: {
    name: string;
    email: string;
  };
  location: string;
  createdOn: string;
  productsHandled: number;
  status: "active" | "inactive" | "maintenance";
  [key: string]: any;
}

// Mock logistics data
const mockDropOffPoints: DropOffPoint[] = [
  {
    id: "1",
    name: "Accra Central Hub",
    manager: {
      name: "Kwame Mensah",
      email: "kwame.mensah@afrika.com"
    },
    location: "Accra, Ghana",
    createdOn: "2024-01-15T14:30:00.000Z",
    productsHandled: 245,
    status: "active"
  },
  {
    id: "2",
    name: "Lagos Distribution Center",
    manager: {
      name: "Amina Okafor",
      email: "amina.okafor@afrika.com"
    },
    location: "Lagos, Nigeria",
    createdOn: "2024-02-10T09:15:00.000Z",
    productsHandled: 189,
    status: "active"
  },
  {
    id: "3",
    name: "Nairobi Warehouse",
    manager: {
      name: "David Kimani",
      email: "david.kimani@afrika.com"
    },
    location: "Nairobi, Kenya",
    createdOn: "2024-01-28T11:45:00.000Z",
    productsHandled: 312,
    status: "maintenance"
  },
  {
    id: "4",
    name: "Cairo Logistics Point",
    manager: {
      name: "Fatima Hassan",
      email: "fatima.hassan@afrika.com"
    },
    location: "Cairo, Egypt",
    createdOn: "2024-03-01T16:20:00.000Z",
    productsHandled: 156,
    status: "active"
  },
  {
    id: "5",
    name: "Johannesburg South Hub",
    manager: {
      name: "Thabo Moloi",
      email: "thabo.moloi@afrika.com"
    },
    location: "Johannesburg, South Africa",
    createdOn: "2024-02-22T13:10:00.000Z",
    productsHandled: 278,
    status: "inactive"
  },
  {
    id: "6",
    name: "Dakar Collection Center",
    manager: {
      name: "Mariama Diop",
      email: "mariama.diop@afrika.com"
    },
    location: "Dakar, Senegal",
    createdOn: "2024-03-05T08:30:00.000Z",
    productsHandled: 134,
    status: "active"
  }
];

export default function AdminDropOffZonesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<LogisticsStatus[]>([]);

  // Use mock logistics data
  // const [dropOffPoints, setDropOffPoints] = useState<DropOffPoint[]>(mockDropOffPoints);
  const [dropOffPoints] = useState<DropOffPoint[]>(mockDropOffPoints);

  // Calculate logistics statistics
  const stats: LogisticsStats = {
    totalPoints: dropOffPoints.length,
    activePoints: dropOffPoints.filter(point => point.status === "active").length,
    newPoints: dropOffPoints.filter(point => {
      const createdDate = new Date(point.createdOn);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length,
    avgProductsPerPoint: Math.round(
      dropOffPoints.reduce((sum, point) => sum + point.productsHandled, 0) / dropOffPoints.length
    ),
  };

  // Filter drop-off points based on search and status filters
  const filteredDropOffPoints = dropOffPoints.filter((point) => {
    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filtering
    const matchesStatus =
      selectedStatuses.length === 0 ||
      (selectedStatuses.includes("active") && point.status === "active") ||
      (selectedStatuses.includes("inactive") && point.status === "inactive") ||
      (selectedStatuses.includes("maintenance") && point.status === "maintenance");

    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: LogisticsStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  const formatNumberShort = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  // Logistics cards with relevant metrics
  const logisticsCards: CardData[] = [
    {
      title: "Total drop off points",
      value: formatNumberShort(stats.totalPoints),
      rightIcon: <MapPin className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4E4]",
      change: {
        trend: "up",
        value: "8%",
        description: "from last month",
      },
    },
    {
      title: "New Opens",
      value: formatNumberShort(stats.newPoints),
      rightIcon: <Plus className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "down",
        value: "5%",
        description: "from last month",
      },
    },
    {
      title: "Avg products handled per point",
      value: formatNumberShort(stats.avgProductsPerPoint),
      rightIcon: <Box className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "up",
        value: "15%",
        description: "from last month",
      },
    },
  ];

  // Available status options for filter
  const statusOptions: { value: LogisticsStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
  ];

  // Status configuration
  const statusConfig = {
    active: {
      label: "Active",
      dotColor: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    inactive: {
      label: "Inactive",
      dotColor: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
    maintenance: {
      label: "Maintenance",
      dotColor: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
  } as const;

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Table fields for logistics view
  const logisticsFields: TableField<DropOffPoint>[] = [
    {
      key: "name",
      header: "Drop off point name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: "manager",
      header: "Manager",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">{row.manager.name}</span>
          <span className="text-sm text-muted-foreground">{row.manager.email}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "location",
      header: "Location",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          
          <span className="font-medium">{row.location}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "createdOn",
      header: "Created on",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          
          <span className="font-medium">{formatDate(row.createdOn)}</span>
        </div>
      ),
      align: "center",
    },
    {
      key: "productsHandled",
      header: "Products handled",
      cell: (_, row) => (
        <div className="flex flex-col items-center">
          
          <span className="font-medium text-lg">{row.productsHandled}</span>
          
        </div>
      ),
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status];
        return (
          <Badge
            variant="outline"
            className="flex flex-row items-center py-2 w-28 gap-2 bg-transparent rounded-md"
          >
            <div className={`size-2 rounded-full ${config.dotColor}`} />
            {config.label}
          </Badge>
        );
      },
      align: "center",
    },
  ];

  const logisticsActions: TableAction<DropOffPoint>[] = [
    {
      type: "view",
      label: "View Details",
      icon: <EyeIcon className="size-5" />,
      onClick: (point) => {
        // navigate(`/admin/logistics/${point.id}`);
        navigate(`/admin/logistics/details`);
        console.log("Viewing details for point:", point);

      },
    },
    {
      type: "edit",
      label: "Edit Point",
      icon: <PenIcon className="size-5" />,
      onClick: (point) => {
        navigate(`/admin/logistics/${point.id}/edit`);
      },
    },
  ];

  return (
    <>
      <SiteHeader label="Logistics Studio" rightActions={
        <Button variant={"secondary"} className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white" onClick={()=> navigate("/admin/logistics/create-dropoff")} > 
          <Plus className="h-4 w-4"/> Create dropoff point
        </Button>
      } />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={logisticsCards} layout="1x3" />

            <div className="space-y-6">
              {/* Logistics Section */}
              <div className="rounded-lg border bg-card py-6 mb-6 dark:bg-[#303030]">
                {/* Search and Filter Section */}
                {dropOffPoints.length > 0 && (
                  <div className="px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="w-full sm:w-auto flex flex-1">
                      <Search
                        placeholder="Search drop-off points by name, manager, or location..."
                        value={searchQuery}
                        onSearchChange={setSearchQuery}
                        className="rounded-full flex-1 w-full"
                      />
                    </div>

                    <div className="flex flex-row items-center gap-4">
                      <div className="flex gap-2 items-center">
                        {/* Status Filter Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 h-10"
                            >
                              Filter
                              <ListFilter className="w-4 h-4" />
                              {selectedStatuses.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                  {selectedStatuses.length}
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {statusOptions.map((status) => (
                              <DropdownMenuCheckboxItem
                                key={status.value}
                                checked={selectedStatuses.includes(status.value)}
                                onCheckedChange={() =>
                                  handleStatusFilterChange(status.value)
                                }
                              >
                                {status.label}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Clear Filters Button */}
                        {(selectedStatuses.length > 0 || searchQuery) && (
                          <Button
                            variant="ghost"
                            onClick={clearAllFilters}
                            className="text-sm"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Drop-off Points Display */}
                <div className="px-6">
                  {dropOffPoints.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold">
                        No drop-off points yet
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Create your first drop-off point to start managing your logistics network. 
                        Drop-off points help you organize product distribution and returns.
                      </p>
                      <Button onClick={() => {/* Add create functionality */}}>
                        Create First Point
                      </Button>
                    </div>
                  ) : filteredDropOffPoints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No drop-off points found matching your search criteria.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <DataTable<DropOffPoint>
                      data={filteredDropOffPoints}
                      fields={logisticsFields}
                      actions={logisticsActions}
                      enableSelection={true}
                      enablePagination={true}
                      pageSize={10}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}