import { useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";
import { toast } from "sonner";

// Department and Role types
type Department =
  | "management"
  | "operations"
  | "marketing"
  | "sales"
  | "customer_support"
  | "logistics"
  | "finance"
  | "it"
  | "product"
  | "content";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: Department | "";
  role: string;
  appRoleIds: string[];
  permissionIds: string[];
}

export default function AdminCreateStaffPage() {
  const navigate = useNavigate();

  // Use the admin hook
  const {
    roles,
    permissions,
    loading,
    createLoading,
    getRoles,
    getPermissions,
    createNewAdmin,
    clearAllErrors,
  } = useReduxAdmin();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    role: "admin",
    appRoleIds: [],
    permissionIds: [],
  });

  // Collapsible states - will be dynamic based on permission modules
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Departments for e-commerce platform
  const departments = [
    { id: "management", name: "Management" },
    { id: "operations", name: "Operations" },
    { id: "marketing", name: "Marketing" },
    { id: "sales", name: "Sales" },
    { id: "customer_support", name: "Customer Support" },
    { id: "logistics", name: "Logistics" },
    { id: "finance", name: "Finance" },
    { id: "it", name: "IT & Development" },
    { id: "product", name: "Product Management" },
    { id: "content", name: "Content & SEO" },
  ];

  // Role types
  const roleTypes = [
    { id: "admin", name: "Admin" },
    { id: "agent", name: "Agent" },
    { id: "manager", name: "Manager" },
  ];

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module || "other";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  // Initialize collapsible sections when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      const sections = Object.keys(groupedPermissions).reduce((acc, module) => {
        acc[module] = true; // Open all sections by default
        return acc;
      }, {} as Record<string, boolean>);
      setOpenSections(sections);
    }
  }, [permissions.length]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: isSelected
          ? prev.permissionIds.filter((id) => id !== permissionId)
          : [...prev.permissionIds, permissionId],
      };
    });
  };

  // Handle module permission toggle (toggle all permissions in a module)
  const handleModuleToggle = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    
    const allModulePermissionsSelected = modulePermissionIds.every((id) =>
      formData.permissionIds.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissionIds: allModulePermissionsSelected
        ? prev.permissionIds.filter((id) => !modulePermissionIds.includes(id))
        : [
            ...prev.permissionIds,
            ...modulePermissionIds.filter(
              (id) => !prev.permissionIds.includes(id)
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

  // Handle role selection (app roles)
  const handleRoleChange = (roleId: string) => {
    setFormData((prev) => {
      const isSelected = prev.appRoleIds.includes(roleId);
      return {
        ...prev,
        appRoleIds: isSelected
          ? prev.appRoleIds.filter((id) => id !== roleId)
          : [...prev.appRoleIds, roleId],
      };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!formData.lastName.trim()) {
        toast.error("Last name is required");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!formData.role) {
        toast.error("Role is required");
        return;
      }

      // Prepare the request body according to API spec
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        department: formData.department || undefined,
        role: formData.role,
        appRoleIds: formData.appRoleIds.length > 0 ? formData.appRoleIds : undefined,
        permissionIds: formData.permissionIds.length > 0 ? formData.permissionIds : undefined,
      };

      console.log("Submitting admin data:", adminData);

      await createNewAdmin(adminData);

      toast.success("Staff member created successfully!", {
        description: "An invitation email has been sent to the staff member.",
      });

      // Navigate back to staff list
      navigate("/admin/users/staff");
    } catch (error: any) {
      console.error("Failed to create admin:", error);
      toast.error(error?.message || "Failed to create staff member");
    }
  };

  // Check if all permissions in a module are selected
  const isModuleSelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    if (modulePermissions.length === 0) return false;

    return modulePermissions.every((p) =>
      formData.permissionIds.includes(p.id)
    );
  };

  // Check if form is valid
  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.role.trim() !== "";

  // Fetch roles and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getRoles(), getPermissions()]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load roles and permissions");
      }
    };

    fetchData();

    // Cleanup errors on unmount
    return () => {
      clearAllErrors();
    };
  }, []);

  // Format module name for display
  const formatModuleName = (module: string): string => {
    return module
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <SiteHeader label="Staff Management" />
      <div className="min-h-screen">
        <div className="p-6 mx-auto space-y-8">
          {/* Header with back button */}
          <Card className="shadow-none border-none">
            <div className="flex flex-row flex-1 gap-3 items-center px-6">
              <Button
                variant={"secondary"}
                className="dark:bg-[#12121240]"
                onClick={() => navigate("/admin/users/staff")}
                disabled={createLoading}
              >
                <ArrowLeft />
              </Button>
              <p>Back to Staff Management</p>
            </div>
          </Card>

          {/* Loading State */}
          {loading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading roles and permissions...
              </AlertDescription>
            </Alert>
          )}

          {/* Main Form Card */}
          <Card className="shadow-none border">
            <CardHeader>
              <div>
                <div className="space-y-2 mb-8">
                  <h1 className="text-xl font-semibold">
                    Create New Staff Member
                  </h1>
                  <p className="text-gray-400">
                    Add a new team member with specific role assignments and
                    permissions
                  </p>
                </div>
                <h3 className="text-lg font-medium">Staff Profile</h3>
              </div>
            </CardHeader>
            <CardContent>
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter First Name"
                    className="h-11"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    disabled={createLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter Last Name"
                    className="h-11"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    disabled={createLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email Address"
                    className="h-11"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={createLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phoneNumber">
                    Phone Number{" "}
                    <span className="text-gray-500 text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+2348012345678"
                    className="h-11"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    disabled={createLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    Department{" "}
                    <span className="text-gray-500 text-xs">(optional)</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value: Department) =>
                      handleInputChange("department", value)
                    }
                    disabled={createLoading}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Select Department e.g Marketing" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#303030]">
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.id}
                          className="h-11"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>
                    Role Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: string) =>
                      handleInputChange("role", value)
                    }
                    disabled={createLoading}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Select Role Type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#303030]">
                      {roleTypes.map((roleType) => (
                        <SelectItem
                          key={roleType.id}
                          value={roleType.id}
                          className="h-11"
                        >
                          {roleType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Primary role type for this staff member
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Application Roles Assignment */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium">
                    Application Roles{" "}
                    <span className="text-gray-500 text-xs font-normal">
                      (optional)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Assign pre-defined application roles. Each role contains a
                    set of permissions.
                  </p>
                </div>

                {roles.length === 0 && !loading ? (
                  <Alert>
                    <AlertDescription>
                      No application roles available. You can still assign
                      individual permissions below.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <Switch
                          id={`role-${role.id}`}
                          checked={formData.appRoleIds.includes(role.id)}
                          onCheckedChange={() => handleRoleChange(role.id)}
                          disabled={createLoading}
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={`role-${role.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {role.name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">
                              {role.description}
                            </p>
                          )}
                          {role.permissions && role.permissions.length > 0 && (
                            <p className="text-xs text-blue-600">
                              {role.permissions.length} permission
                              {role.permissions.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-8" />

              {/* Individual Permissions Assignment */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium">
                    Individual Permissions{" "}
                    <span className="text-gray-500 text-xs font-normal">
                      (optional)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Assign specific permissions individually. These will be
                    added to any permissions from assigned roles.
                  </p>
                </div>

                {permissions.length === 0 && !loading ? (
                  <Alert>
                    <AlertDescription>
                      No permissions available to assign.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Permission Groups by Module */}
                    {Object.entries(groupedPermissions).map(
                      ([module, modulePermissions]) => (
                        <Collapsible
                          key={module}
                          open={openSections[module]}
                          onOpenChange={() => toggleSection(module)}
                          className="rounded-lg border overflow-hidden"
                        >
                          <div className="p-6">
                            <CollapsibleTrigger asChild>
                              <div className="flex flex-row justify-between items-center cursor-pointer">
                                <div className="flex flex-row gap-4 items-center">
                                  <Switch
                                    checked={isModuleSelected(module)}
                                    onCheckedChange={() =>
                                      handleModuleToggle(module)
                                    }
                                    disabled={createLoading}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="text-left">
                                    <Label className="font-semibold text-md cursor-pointer">
                                      {formatModuleName(module)}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {modulePermissions.length} permission
                                      {modulePermissions.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {openSections[module] ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {modulePermissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                                  >
                                    <Switch
                                      id={permission.id}
                                      checked={formData.permissionIds.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={() =>
                                        handlePermissionToggle(permission.id)
                                      }
                                      disabled={createLoading}
                                    />
                                    <div className="flex-1 space-y-1">
                                      <Label
                                        htmlFor={permission.id}
                                        className="font-medium cursor-pointer"
                                      >
                                        {permission.name}
                                      </Label>
                                      {permission.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-500 font-mono">
                                        {permission.key}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )
                    )}
                  </>
                )}
              </div>

              {/* Summary Section */}
              {(formData.appRoleIds.length > 0 ||
                formData.permissionIds.length > 0) && (
                <>
                  <Separator className="my-8" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Selection Summary</h3>
                    
                    {formData.appRoleIds.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Application Roles ({formData.appRoleIds.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.appRoleIds.map((roleId) => {
                            const role = roles.find((r) => r.id === roleId);
                            return (
                              <div
                                key={roleId}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                              >
                                {role?.name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {formData.permissionIds.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Individual Permissions ({formData.permissionIds.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.permissionIds.slice(0, 10).map((permId) => {
                            const perm = permissions.find((p) => p.id === permId);
                            return (
                              <div
                                key={permId}
                                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                              >
                                {perm?.name}
                              </div>
                            );
                          })}
                          {formData.permissionIds.length > 10 && (
                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                              +{formData.permissionIds.length - 10} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-between gap-6">
            <Button
              variant={"outline"}
              className="h-11 flex-1 font-semibold text-md"
              onClick={() => navigate("/admin/users/staff")}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              variant={"secondary"}
              className="h-11 flex-1 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold text-md disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!isFormValid || createLoading}
            >
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Staff Member...
                </>
              ) : (
                "Create Staff Member"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}