import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Department and Role types - Update to match your StaffMember type
type Department =
  | "Management"
  | "Operations"
  | "Marketing"
  | "Logistics"
  | "Support"
  | "Administration";

type Role =
  | "super-admin"
  | "admin"
  | "operations"
  | "marketing"
  | "logistics"
  | "helpdesk"
  | "support";

interface FormData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: Department | "";
  role: Role | "";
  permissions: string[];
}

export default function AdminEditStaffPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get staff data from route state
  const staffFromState = location.state?.staff;

  // Parse name into first and last name
  const parseName = (fullName: string) => {
    const parts = fullName.split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  // Map staff status to permissions (this is a simplified example)
  const mapPermissionsFromStaff = (staff: any): string[] => {
    // This is a simplified mapping. You should adjust based on your actual permission logic
    const permissionMap: Record<string, string[]> = {
      "Super Admin": [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "users:permissions",
      ],
      Admin: ["users:read", "users:create", "users:update"],
      "Operations Manager": [
        "orders:read",
        "orders:process",
        "inventory:manage",
      ],
      "Marketing Lead": ["analytics:view", "reports:generate"],
      "Logistics Coordinator": ["shipping:manage", "orders:process"],
      "Helpdesk Specialist": ["customers:support", "customers:read"],
      "Support Agent": ["customers:support"],
      "Operations Assistant": ["orders:process"],
      "Marketing Assistant": ["analytics:view"],
      "Delivery Manager": ["shipping:manage"],
    };

    return permissionMap[staff.roleLabel] || [];
  };

  // Form state with default values from route state if available
  const [formData, setFormData] = useState<FormData>({
    id: staffFromState?.id || "",
    firstName: staffFromState ? parseName(staffFromState.name).firstName : "",
    lastName: staffFromState ? parseName(staffFromState.name).lastName : "",
    email: staffFromState?.email || "",
    phone: staffFromState?.phone || "",
    department: staffFromState?.department || "",
    role: staffFromState?.role || "",
    permissions: staffFromState ? mapPermissionsFromStaff(staffFromState) : [],
  });

  // Collapsible states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    user_management: true,
    product_management: true,
    order_management: true,
    customer_management: true,
    analytics_reports: true,
    system_settings: true,
  });

  // Departments for e-commerce platform - Updated to match StaffMember type
  const departments = [
    { id: "Management", name: "Management" },
    { id: "Operations", name: "Operations" },
    { id: "Marketing", name: "Marketing" },
    { id: "Logistics", name: "Logistics" },
    { id: "Support", name: "Support" },
    { id: "Administration", name: "Administration" },
  ];

  // Roles for e-commerce platform - Updated to match StaffMember type
  const roles = [
    { id: "super-admin", name: "Super Admin" },
    { id: "admin", name: "Admin" },
    { id: "operations", name: "Operations" },
    { id: "marketing", name: "Marketing" },
    { id: "logistics", name: "Logistics" },
    { id: "helpdesk", name: "Helpdesk" },
    { id: "support", name: "Support" },
  ];

  // Permission groups for e-commerce platform
  const permissionGroups = [
    {
      id: "user_management",
      name: "User Management",
      permissions: [
        { id: "users:read", name: "View Users" },
        { id: "users:create", name: "Create Users" },
        { id: "users:update", name: "Update Users" },
        { id: "users:delete", name: "Delete Users" },
        { id: "users:permissions", name: "Manage Permissions" },
      ],
    },
    {
      id: "product_management",
      name: "Product Management",
      permissions: [
        { id: "products:read", name: "View Products" },
        { id: "products:create", name: "Create Products" },
        { id: "products:update", name: "Update Products" },
        { id: "products:delete", name: "Delete Products" },
        { id: "inventory:manage", name: "Manage Inventory" },
        { id: "categories:manage", name: "Manage Categories" },
      ],
    },
    {
      id: "order_management",
      name: "Order Management",
      permissions: [
        { id: "orders:read", name: "View Orders" },
        { id: "orders:process", name: "Process Orders" },
        { id: "orders:update", name: "Update Orders" },
        { id: "orders:cancel", name: "Cancel Orders" },
        { id: "refunds:process", name: "Process Refunds" },
        { id: "shipping:manage", name: "Manage Shipping" },
      ],
    },
    {
      id: "customer_management",
      name: "Customer Management",
      permissions: [
        { id: "customers:read", name: "View Customers" },
        { id: "customers:update", name: "Update Customers" },
        { id: "customers:support", name: "Customer Support" },
        { id: "customers:communications", name: "Customer Communications" },
        { id: "reviews:moderate", name: "Moderate Reviews" },
      ],
    },
    {
      id: "analytics_reports",
      name: "Analytics & Reports",
      permissions: [
        { id: "analytics:view", name: "View Analytics" },
        { id: "reports:generate", name: "Generate Reports" },
        { id: "sales:metrics", name: "Sales Metrics" },
        { id: "performance:monitor", name: "Performance Monitor" },
      ],
    },
    {
      id: "system_settings",
      name: "System Settings",
      permissions: [
        { id: "settings:general", name: "General Settings" },
        { id: "settings:payment", name: "Payment Settings" },
        { id: "settings:shipping", name: "Shipping Settings" },
        { id: "settings:tax", name: "Tax Settings" },
        { id: "settings:notifications", name: "Notification Settings" },
      ],
    },
  ];

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle permission toggles
  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((id) => id !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };

  // Handle group permission toggle (toggle all permissions in a group)
  const handleGroupToggle = (groupId: string) => {
    const group = permissionGroups.find((g) => g.id === groupId);
    if (!group) return;

    const groupPermissionIds = group.permissions.map((p) => p.id);
    const allGroupPermissionsSelected = groupPermissionIds.every((id) =>
      formData.permissions.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allGroupPermissionsSelected
        ? prev.permissions.filter((id) => !groupPermissionIds.includes(id))
        : [
            ...prev.permissions,
            ...groupPermissionIds.filter(
              (id) => !prev.permissions.includes(id)
            ),
          ],
    }));
  };

  // Toggle collapsible section
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Here you would typically:
    // 1. Validate form data
    // 2. Send API request to update staff member
    // 3. Show success/error message
    // 4. Redirect to staff management page

    // For now, just navigate back
    navigate("/admin/users/staff");
  };

  // Check if all permissions in a group are selected
  const isGroupSelected = (groupId: string) => {
    const group = permissionGroups.find((g) => g.id === groupId);
    if (!group) return false;

    return group.permissions.every((p) => formData.permissions.includes(p.id));
  };


  // If no staff data was passed, show a message
  if (!staffFromState) {
    return (
      <>
        <SiteHeader label="Staff Management" />
        <div className="min-h-screen">
          <div className="p-6 mx-auto space-y-8">
            <Card className="shadow-none border-none">
              <div className="flex flex-row flex-1 gap-3 items-center px-6">
                <Button
                  variant={"secondary"}
                  className="dark:bg-[#12121240]"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft />
                </Button>
                <p>Back to Dashboard</p>
              </div>
            </Card>

            <Card className="shadow-none border">
              <CardContent className="py-12 text-center">
                <p className="text-lg font-medium mb-2">No staff data found</p>
                <p className="text-muted-foreground mb-6">
                  Please select a staff member to edit from the staff management
                  page.
                </p>
                <Button onClick={() => navigate("/admin/users/staff")}>
                  Go to Staff Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader label="Staff Management" />
      <div className="min-h-screen">
        <div className="p-6 mx-auto space-y-8">
          <Card className="shadow-none border-none">
            <div className="flex flex-row flex-1 gap-3 items-center px-6">
              <Button
                variant={"secondary"}
                className="dark:bg-[#12121240]"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft />
              </Button>
              <p>Back to Staff Management</p>
            </div>
          </Card>

          <Card className="shadow-none border">
            <CardHeader>
              <div>
                <div className="space-y-2 mb-8">
                  <h1 className="text-xl font-semibold">
                    Edit User: {staffFromState.name}
                  </h1>
                  <p className="text-gray-400">
                    Update team member information, role assignments, and
                    permissions
                  </p>
                </div>
                <h3 className="text-lg font-medium">User Profile</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter First Name"
                    className="h-11"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter Last Name"
                    className="h-11"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email Address"
                    className="h-11"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter Phone Number"
                    className="h-11"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value: Department) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#303030]">
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.id}
                          className="h-11"
                        >
                          <div className="flex flex-col">
                            <span>{dept.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Role Name</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: Role) =>
                      handleInputChange("role", value)
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Assign a role" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#303030]">
                      {roles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="h-11"
                        >
                          <div className="flex flex-col">
                            <span>{role.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="my-8" />

              <div className="space-y-6">
                <h2 className="text-lg font-medium">Assign Permissions</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select permissions for this user. Permissions can be assigned
                  individually or by toggling entire permission groups.
                </p>

                {/* Permission Groups */}
                {permissionGroups.map((group) => (
                  <Collapsible
                    key={group.id}
                    open={openSections[group.id]}
                    onOpenChange={() => toggleSection(group.id)}
                    className="rounded-lg border overflow-hidden"
                  >
                    <div className="p-6">
                      <CollapsibleTrigger asChild>
                        <div className="flex flex-row justify-between items-center cursor-pointer">
                          <div className="flex flex-row gap-4 items-center">
                            <Switch
                              checked={isGroupSelected(group.id)}
                              onCheckedChange={() =>
                                handleGroupToggle(group.id)
                              }
                            />
                            <div className="text-left">
                              <Label className="font-semibold text-md cursor-pointer">
                                {group.name}
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {openSections[group.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {group.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex flex-row gap-4 items-center p-3 rounded-lg transition-colors"
                            >
                              <Switch
                                checked={formData.permissions.includes(
                                  permission.id
                                )}
                                onCheckedChange={() =>
                                  handlePermissionToggle(permission.id)
                                }
                                id={permission.id}
                              />
                              <div className="space-y-1">
                                <Label
                                  htmlFor={permission.id}
                                  className="font-medium cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-row items-center justify-between gap-6">
            <Button
              variant={"outline"}
              className="h-11 flex-1 font-semibold text-md"
              onClick={() => navigate("/admin/users/staff")}
            >
              Cancel
            </Button>
            <Button
              variant={"secondary"}
              className="h-11 flex-1 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold text-md"
              onClick={handleSubmit}
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.department ||
                !formData.role
              }
            >
              Update User
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
