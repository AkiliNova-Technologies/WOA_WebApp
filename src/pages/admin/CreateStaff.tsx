import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ChevronDown, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
    role: "",
    appRoleIds: [],
    permissionIds: [],
  });

  // State for draft saving
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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

  // Group permissions by module
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const module = permission.module || "other";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  // Initialize collapsible sections when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      const sections = Object.keys(groupedPermissions).reduce(
        (acc, module) => {
          acc[module] = false; // Closed by default to match screenshot
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setOpenSections(sections);
    }
  }, [permissions.length]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof FormData,
    value: string | string[],
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
      formData.permissionIds.includes(id),
    );

    setFormData((prev) => ({
      ...prev,
      permissionIds: allModulePermissionsSelected
        ? prev.permissionIds.filter((id) => !modulePermissionIds.includes(id))
        : [
            ...prev.permissionIds,
            ...modulePermissionIds.filter(
              (id) => !prev.permissionIds.includes(id),
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

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    try {
      setIsSavingDraft(true);
      // Implement draft saving logic here
      // For now, we'll just save to localStorage
      localStorage.setItem("staffDraft", JSON.stringify(formData));
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
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
      if (!formData.role.trim()) {
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
        appRoleIds:
          formData.appRoleIds.length > 0 ? formData.appRoleIds : undefined,
        permissionIds:
          formData.permissionIds.length > 0
            ? formData.permissionIds
            : undefined,
      };

      console.log("Submitting admin data:", adminData);

      await createNewAdmin(adminData);

      // Clear draft from localStorage
      localStorage.removeItem("staffDraft");

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
      formData.permissionIds.includes(p.id),
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

    // Try to load draft from localStorage
    const savedDraft = localStorage.getItem("staffDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
        toast.info("Draft loaded");
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }

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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        {/* Header Bar */}
        <Card className="my-6 mx-6 py-4 px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/users/staff")}
              disabled={createLoading || isSavingDraft}
              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users/staff")}
                disabled={createLoading || isSavingDraft}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={createLoading || isSavingDraft}
                className="border-gray-300 dark:border-gray-700"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as draft"
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || createLoading || isSavingDraft}
                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save Staff"
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="max-w-8xl mx-auto px-6 py-8">
          {/* Loading State */}
          {loading && (
            <Alert className="mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading roles and permissions...
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create new staff member
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new team member with specific role assignments and
                permissions
              </p>
            </div>

            {/* Profile Section */}
            <Card className="border border-gray-200 dark:border-gray-800 ">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Profile
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={createLoading}
                      className="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={createLoading}
                      className="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john.doe@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={createLoading}
                      className="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      placeholder="e.g. Doe"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={createLoading}
                      className="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value: Department) =>
                        handleInputChange("department", value)
                      }
                      disabled={createLoading}
                    >
                      <SelectTrigger className="min-h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="e.g. Marketing" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900">
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: string) =>
                        handleInputChange("role", value)
                      }
                      disabled={createLoading}
                    >
                      <SelectTrigger className="min-h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="e.g. Junior Marketing" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assign Permissions Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Permissions
              </h2>

              {permissions.length === 0 && !loading ? (
                <Alert>
                  <AlertDescription>
                    No permissions available to assign.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {/* Permission Modules */}
                  {Object.entries(groupedPermissions).map(
                    ([module, modulePermissions]) => (
                      <Collapsible
                        key={module}
                        open={openSections[module]}
                        onOpenChange={() => toggleSection(module)}
                      >
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isModuleSelected(module)}
                                  onCheckedChange={() =>
                                    handleModuleToggle(module)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                  aria-label={`Toggle all ${formatModuleName(module)} permissions`}
                                />
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatModuleName(module)}
                                  </h3>
                                </div>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-500 transition-transform ${
                                  openSections[module] ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-4">
                              <div className="space-y-3">
                                {/* Sub-category headers (if applicable) */}
                                {modulePermissions.some((p) =>
                                  p.name.includes("Management"),
                                ) && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3 pb-2">
                                      <Checkbox
                                        checked={modulePermissions
                                          .filter((p) =>
                                            p.name.includes("Management"),
                                          )
                                          .every((p) =>
                                            formData.permissionIds.includes(
                                              p.id,
                                            ),
                                          )}
                                        onCheckedChange={() => {
                                          const mgmtPerms = modulePermissions
                                            .filter((p) =>
                                              p.name.includes("Management"),
                                            )
                                            .map((p) => p.id);
                                          const allSelected = mgmtPerms.every(
                                            (id) =>
                                              formData.permissionIds.includes(
                                                id,
                                              ),
                                          );
                                          setFormData((prev) => ({
                                            ...prev,
                                            permissionIds: allSelected
                                              ? prev.permissionIds.filter(
                                                  (id) =>
                                                    !mgmtPerms.includes(id),
                                                )
                                              : [
                                                  ...prev.permissionIds,
                                                  ...mgmtPerms.filter(
                                                    (id) =>
                                                      !prev.permissionIds.includes(
                                                        id,
                                                      ),
                                                  ),
                                                ],
                                          }));
                                        }}
                                        className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                      />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {
                                          modulePermissions
                                            .find((p) =>
                                              p.name.includes("Management"),
                                            )
                                            ?.name.split(" ")[0]
                                        }{" "}
                                        Management
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pl-7">
                                      {modulePermissions
                                        .filter((p) =>
                                          p.name.includes("Management"),
                                        )
                                        .map((permission) => (
                                          <div
                                            key={permission.id}
                                            className="flex items-center gap-2"
                                          >
                                            <Checkbox
                                              id={permission.id}
                                              checked={formData.permissionIds.includes(
                                                permission.id,
                                              )}
                                              onCheckedChange={() =>
                                                handlePermissionToggle(
                                                  permission.id,
                                                )
                                              }
                                              disabled={createLoading}
                                              className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                            />
                                            <Label
                                              htmlFor={permission.id}
                                              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                            >
                                              {permission.name.replace(
                                                /.*Management\s*/,
                                                "",
                                              )}
                                            </Label>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Regular permissions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                  {modulePermissions
                                    .filter(
                                      (p) =>
                                        !p.name.includes("Management") ||
                                        !modulePermissions.some((mp) =>
                                          mp.name.includes("Management"),
                                        ),
                                    )
                                    .map((permission) => (
                                      <div
                                        key={permission.id}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          id={permission.id}
                                          checked={formData.permissionIds.includes(
                                            permission.id,
                                          )}
                                          onCheckedChange={() =>
                                            handlePermissionToggle(
                                              permission.id,
                                            )
                                          }
                                          disabled={createLoading}
                                          className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                        />
                                        <Label
                                          htmlFor={permission.id}
                                          className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                          {permission.name}
                                        </Label>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
