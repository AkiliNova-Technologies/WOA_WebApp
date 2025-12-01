import { AreaChartComponent } from "@/components/charts/area-chart";
import { PieDonutChartComponent } from "@/components/charts/pie-chart";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "@/components/ui/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Box,
  ExternalLink,
  ListFilter,
  MapPin,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";

export default function AdminViewDropoffPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("90d");

  const { products, getCategoryById, getSubCategoryById } = useProducts();

  const logisticsCards: CardData[] = [
    {
      title: "Total products handled",
      value: "0",
      rightIcon: <MapPin className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#FFE4E4]",
    },
    {
      title: "Product this month",
      value: "0",
      rightIcon: <Plus className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "down",
        value: "5%",
        description: "from last month",
      },
    },
    {
      title: "Avg time taken for pickup",
      value: "0",
      rightIcon: <Box className="h-4 w-4 text-[#303030]" />,
      iconBgColor: "bg-[#C4E8D1]",
      change: {
        trend: "up",
        value: "15%",
        description: "from last month",
      },
    },
  ];

  const orderStatuses = [
    "In Production",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Pending",
    "Processing",
    "Ready for Pickup",
    "In Transit",
  ];

  // Table fields for products - UPDATED: Using actual product data
  const productFields: TableField<(typeof products)[0]>[] = [
    {
      key: "name",
      header: "Product",
      cell: (_, row) => {
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 rounded-sm">
              <AvatarImage src={row.image} alt={row.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {row.name
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-md">{row.name}</span>
              <span className="text-sm text-muted-foreground">
                {row.description.length > 50
                  ? `${row.description.substring(0, 50)}...`
                  : row.description}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "categoryId",
      header: "Category",
      cell: (_, row) => {
        const category = getCategoryById(row.categoryId);
        return <span className="font-medium">{category?.name || "N/A"}</span>;
      },
      align: "center",
    },
    {
      key: "subCategoryId",
      header: "Sub Category",
      cell: (_, row) => {
        const subCategory = getSubCategoryById(row.subCategoryId);
        return (
          <span className="font-medium">{subCategory?.name || "N/A"}</span>
        );
      },
      align: "center",
    },
    {
      key: "vendor",
      header: "Seller",
      cell: (_, row) => <span className="font-medium">{row.vendor}</span>,
      align: "center",
    },
    {
      key: "id",
      header: "Order Status",
      cell: (_, row) => {
        // Generate a consistent order status based on product ID
        const statusIndex = parseInt(row.id) % orderStatuses.length;
        const orderStatus = orderStatuses[statusIndex];

        // Define color configuration for order statuses
        const statusConfig: Record<
          string,
          {
            color: string;
          }
        > = {
          "In Production": {
            color: "bg-blue-500",

          },
          Shipped: {
            color: "bg-purple-500",
 
          },
          Delivered: {
            color: "bg-green-500",
  
          },
          Cancelled: {
            color: "bg-red-500",
     
          },
          Pending: {
            color: "bg-yellow-500",
    
          },
          Processing: {
            color: "bg-orange-500",
    
          },
          "Ready for Pickup": {
            color: "bg-indigo-500",
  
          },
          "In Transit": {
            color: "bg-teal-500",
   
          },
        };

        const config = statusConfig[orderStatus] || statusConfig["Pending"];

        return (
          <Badge
            variant="outline"
            className={`flex flex-row items-center py-1 px-3 gap-2 rounded-md`}
          >
            <div className={`size-2 rounded-full ${config.color}`} />
            {orderStatus}
          </Badge>
        );
      },
      align: "center",
    },
  ];

  const productActions: TableAction<(typeof products)[0]>[] = [
    {
      type: "view",
      label: "View Product Details",
      icon: <ExternalLink className="size-5" />,
      onClick: (product) => {
        // Navigate to product details page
        navigate(`/admin/products/${product.id}`);
      },
    },
  ];

  const savesOverTimeData = [
    { month: "January", saves: 186, purchases: 80 },
    { month: "February", saves: 305, purchases: 200 },
    { month: "March", saves: 237, purchases: 120 },
    { month: "April", saves: 73, purchases: 190 },
    { month: "May", saves: 209, purchases: 130 },
    { month: "June", saves: 214, purchases: 140 },
    { month: "July", saves: 186, purchases: 80 },
    { month: "August", saves: 305, purchases: 200 },
    { month: "September", saves: 237, purchases: 120 },
    { month: "October", saves: 73, purchases: 190 },
    { month: "November", saves: 209, purchases: 130 },
    { month: "December", saves: 214, purchases: 140 },
  ];

  const savesOverTimeConfig = {
    saves: {
      label: "Saves",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const savesByCountryData = [
    { name: "Ghana", value: 275, fill: "var(--color-ghana)" },
    { name: "Nigeria", value: 200, fill: "var(--color-nigeria)" },
    { name: "Kenya", value: 187, fill: "var(--color-kenya)" },
    { name: "South Africa", value: 173, fill: "var(--color-south-africa)" },
    { name: "Other", value: 90, fill: "var(--color-other)" },
  ];

  const savesByCountryConfig = {
    value: {
      label: "Saves",
    },
    ghana: {
      label: "Ghana",
      color: "var(--chart-1)",
    },
    nigeria: {
      label: "Nigeria",
      color: "var(--chart-2)",
    },
    kenya: {
      label: "Kenya",
      color: "var(--chart-3)",
    },
    "south-africa": {
      label: "South Africa",
      color: "var(--chart-4)",
    },
    other: {
      label: "Other",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  // Update your cartStatusData in CartDetails.tsx
  const cartStatusData = [
    { category: "Active", value: 140 },
    { category: "Abandoned", value: 75 },
    { category: "Checkout Failure", value: 100 },
    { category: "Purchased", value: 200 },
    { category: "Recovered", value: 20 },
  ];

  const cartStatusConfig = {
    value: {
      label: "Cart Count",
      color: "#4CAF50",
    },
  } satisfies ChartConfig;

  console.log("Data passed to chart:", cartStatusData);
  console.log("Config passed to chart:", cartStatusConfig);

  return (
    <>
      <SiteHeader label="Logistics Studio" />
      <div className="min-h-screen">
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Back to dashboard</h1>
            </div>
            <Badge
              variant={"outline"}
              className="text-[#32A06E] rounded-full px-4 py-2 font-medium text-sm"
            >
              Drop off point is active
            </Badge>
          </div>

          <SectionCards cards={logisticsCards} layout="1x3" />

          {/* Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start rounded-lg p-4 min-h-16 h-auto bg-white mt-6 mb-6 dark:bg-[#303030]">
                <TabsTrigger
                  value="overview"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="product-details"
                  className="px-6 py-3 h-16 text-md dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[#CC5500] data-[state=active]:text-foreground border-0 data-[state=active]:border-b data-[state=active]:border-[#CC5500] data-[state=active]:shadow-none dark:data-[state=active]:border-[#CC5500] rounded-none border-b-2 border-transparent"
                >
                  Product Details
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8 m-0">
                <Card className="shadow-none border-none">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <h1 className="text-2xl font-semibold">Address</h1>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-md">Name</Label>
                      <Input
                        value={"Naguru trading post"}
                        className="h-11"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-md">Country</Label>
                        <Input value={"Uganda"} className="h-11" disabled />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-md">City</Label>
                        <Input value={"Kampala"} className="h-11" disabled />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-md">Additional Details</Label>
                      <Textarea
                        value={"Located in Naguru, near the main market."}
                        className="h-34"
                        disabled
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant={"secondary"}
                        className="h-11 w-3xs bg-[#CC5500] hover:bg-[#CC55500]/90 text-white font-semibold"
                      >
                        Edit Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex flex-row items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md shadow-none border-none">
                  <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold">location on map</h1>
                  </div>
                  <Button
                    variant={"secondary"}
                    className="h-11 w-3xs bg-[#CC5500] hover:bg-[#CC55500]/90 text-white font-semibold"
                  >
                    View address on map
                  </Button>
                </Card>

                <Card className="shadow-none border-none">
                  <CardContent className="">
                    <div className="flex flex-row justify-between items-center">
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold">
                          Manage Profile
                        </h2>
                        <p className="text-gray-400">Alice Johnson</p>
                      </div>
                      <Button variant={"secondary"}>
                        <ExternalLink className="" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none border-none">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <h1 className="text-2xl font-semibold">
                        Drop off point Status
                      </h1>
                    </div>
                  </CardHeader>
                  <CardContent className="">
                    <div className="flex flex-row justify-between items-center">
                      <div className="">
                        <p className="text-lg font-medium mb-2">
                          Change point's status
                        </p>
                        <p className="text-gray-400">
                          This dropoff point's status is currently active.
                        </p>
                      </div>
                      <Button variant={"secondary"} className="text-[#E51C00]">
                        Change Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-8 m-0">
                <Card className="shadow-none border">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="font-semibold text-xl">
                          Performance overview
                        </h2>
                        <div className="flex items-center gap-2">
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="w-full">
                        <AreaChartComponent
                          data={savesOverTimeData}
                          config={savesOverTimeConfig}
                          chartHeight="350px"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 space-x-8">
                  <Card className="shadow-none border">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between">
                          <h2 className="font-semibold text-xl">
                            Products by Sub Category
                          </h2>
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full">
                          <PieDonutChartComponent
                            data={savesByCountryData}
                            config={savesByCountryConfig}
                            chartHeight="350px"
                            showKey={true}
                            keyPosition="right"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-row items-center justify-between">
                          <h2 className="font-semibold text-xl">
                            Products by seller
                          </h2>
                          <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                          >
                            <SelectTrigger
                              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                              aria-label="Select a value"
                            >
                              <SelectValue placeholder="Last 3 months" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                              </SelectItem>
                              <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full h-[350px]">
                          {/* <BarChartComponent
                            data={cartStatusData}
                            config={cartStatusConfig}
                            chartHeight="350px"
                            orientation="vertical"
                            categoryKey="category" // FIXED
                            valueKeys={["value"]} // FIXED
                            showLabels={true}
                            showValueLabel={true}
                            hideYAxis={false}
                            hideXAxis={true}
                            yAxisWidth={150}
                            barRadius={8}
                            className="shadow-none border-none"
                          /> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Product Details Tab */}
              <TabsContent value="product-details" className="space-y-8 m-0">
                <Card className="shadow-none border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Search and Filter */}
                      <div className="flex gap-4">
                        <Search placeholder="Search products..." />
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 h-11 px-8"
                        >
                          <span>Filter</span>
                          <ListFilter className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Products Table */}
                      <div className="">
                        <DataTable
                          data={products}
                          fields={productFields}
                          actions={productActions}
                          enableSelection={true}
                          enablePagination={true}
                          pageSize={10}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
