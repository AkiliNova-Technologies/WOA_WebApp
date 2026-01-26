import { useEffect, useState, useMemo } from "react";
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
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  User,
  Users,
  FolderTree,
  Package,
  Warehouse,
  MapPin,
  ShoppingCart,
  DollarSign,
  Star,
  FileText,
  HelpCircle,
  Heart,
} from "lucide-react";
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

interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Permission category configuration with icons and display names
const PERMISSION_CATEGORIES = {
  CLIENT_MANAGEMENT: {
    name: "Client Management",
    icon: Users,
    keywords: ["CLIENT"],
    description: "Manage customer accounts and their statuses",
  },
  SELLER_MANAGEMENT: {
    name: "Seller Management",
    icon: Users,
    keywords: ["SELLER"],
    description: "Manage seller applications and accounts",
  },
  STAFF_MANAGEMENT: {
    name: "Staff Management",
    icon: User,
    keywords: ["STAFF"],
    description: "Manage internal staff members",
  },
  CATEGORY_MANAGEMENT: {
    name: "Category Management",
    icon: FolderTree,
    keywords: ["CATEGORY"],
    description: "Manage product categories and attributes",
  },
  PRODUCT_MANAGEMENT: {
    name: "Product Management",
    icon: Package,
    keywords: ["PRODUCT"],
    description: "Manage product listings and approvals",
  },
  WAREHOUSE_MANAGEMENT: {
    name: "Warehouse Management",
    icon: Warehouse,
    keywords: ["WAREHOUSE"],
    description: "Manage warehouse locations and operations",
  },
  DOZ_MANAGEMENT: {
    name: "Drop Off Zone (DOZ) Management",
    icon: MapPin,
    keywords: ["DOZ"],
    description: "Manage drop-off zones and their operations",
  },
  ORDER_MANAGEMENT: {
    name: "Order Management",
    icon: ShoppingCart,
    keywords: ["ORDER"],
    description: "Manage and track platform orders",
  },
  CART_MANAGEMENT: {
    name: "Cart Management",
    icon: ShoppingCart,
    keywords: ["CART"],
    description: "Access cart analytics and recovery",
  },
  WISHLIST_MANAGEMENT: {
    name: "Wishlist Management",
    icon: Heart,
    keywords: ["WISHLIST"],
    description: "Access wishlist analytics",
  },
  REVENUE_MANAGEMENT: {
    name: "Revenue & Financials",
    icon: DollarSign,
    keywords: ["REVENUE"],
    description: "Access revenue dashboards and financials",
  },
  REVIEWS_MANAGEMENT: {
    name: "Reviews & Ratings",
    icon: Star,
    keywords: ["REVIEW"],
    description: "Manage customer reviews and ratings",
  },
  COMPLIANCE_MANAGEMENT: {
    name: "Compliance Reports",
    icon: FileText,
    keywords: ["COMPLIANCE"],
    description: "Manage compliance cases and reports",
  },
  HELPDESK_MANAGEMENT: {
    name: "Help Desk",
    icon: HelpCircle,
    keywords: ["HELPDESK"],
    description: "Manage support tickets",
  },
} as const;

type CategoryKey = keyof typeof PERMISSION_CATEGORIES;

// Function to categorize a permission based on its key
const categorizePermission = (permission: Permission): CategoryKey | null => {
  const key = permission.key.toUpperCase();

  for (const [categoryKey, config] of Object.entries(PERMISSION_CATEGORIES)) {
    if (config.keywords.some((keyword) => key.includes(keyword))) {
      return categoryKey as CategoryKey;
    }
  }

  return null;
};

// Function to get action type from permission key
const getActionType = (key: string): string => {
  if (key.startsWith("READ_")) return "read";
  if (key.startsWith("CREATE_")) return "create";
  if (key.startsWith("UPDATE_")) return "update";
  if (key.startsWith("DELETE_")) return "delete";
  if (key.startsWith("APPROVE_")) return "approve";
  if (key.startsWith("REJECT_")) return "reject";
  if (key.startsWith("SUSPEND_")) return "suspend";
  if (key.startsWith("REACTIVATE_")) return "reactivate";
  if (key.startsWith("CLOSE_")) return "close";
  if (key.startsWith("DEACTIVATE_")) return "deactivate";
  if (key.startsWith("REPLY_")) return "reply";
  return "other";
};

// Function to format permission name for display (shorter version)
const formatPermissionLabel = (permission: Permission): string => {
  const key = permission.key;

  // Extract the action part
  const actions: Record<string, string> = {
    READ_: "View",
    CREATE_: "Create",
    UPDATE_: "Update",
    DELETE_: "Delete",
    APPROVE_: "Approve",
    REJECT_: "Reject",
    SUSPEND_: "Suspend",
    REACTIVATE_: "Reactivate",
    CLOSE_: "Close",
    DEACTIVATE_: "Deactivate",
    REPLY_TO_: "Reply to",
  };

  for (const [prefix, label] of Object.entries(actions)) {
    if (key.startsWith(prefix)) {
      return label;
    }
  }

  // Special cases
  if (key.includes("ORDER_STATUS")) return "Update Status";
  if (key.includes("_STATUS")) return "Update Status";

  return permission.name;
};

export default function AdminCreateStaffPage() {
  const navigate = useNavigate();

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

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

  // Group permissions by category
  const categorizedPermissions = useMemo(() => {
    const grouped: Record<CategoryKey, Permission[]> = {} as Record<
      CategoryKey,
      Permission[]
    >;

    // Initialize all categories
    Object.keys(PERMISSION_CATEGORIES).forEach((key) => {
      grouped[key as CategoryKey] = [];
    });

    // Categorize each permission
    permissions.forEach((permission: Permission) => {
      const category = categorizePermission(permission);
      if (category) {
        grouped[category].push(permission);
      }
    });

    // Sort permissions within each category by action type for consistent ordering
    const actionOrder = [
      "read",
      "create",
      "update",
      "approve",
      "reject",
      "suspend",
      "reactivate",
      "deactivate",
      "close",
      "delete",
      "reply",
      "other",
    ];

    Object.keys(grouped).forEach((key) => {
      grouped[key as CategoryKey].sort((a, b) => {
        const aAction = getActionType(a.key);
        const bAction = getActionType(b.key);
        return actionOrder.indexOf(aAction) - actionOrder.indexOf(bAction);
      });
    });

    return grouped;
  }, [permissions]);

  // Get non-empty categories
  const activeCategories = useMemo(() => {
    return Object.entries(categorizedPermissions).filter(
      ([_, perms]) => perms.length > 0
    ) as [CategoryKey, Permission[]][];
  }, [categorizedPermissions]);

  // Initialize collapsible sections
  useEffect(() => {
    if (activeCategories.length > 0) {
      const sections = activeCategories.reduce(
        (acc, [category]) => {
          acc[category] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setOpenSections(sections);
    }
  }, [activeCategories.length]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleCategoryToggle = (category: CategoryKey) => {
    const categoryPermissions = categorizedPermissions[category] || [];
    const categoryPermissionIds = categoryPermissions.map((p) => p.id);

    const allSelected = categoryPermissionIds.every((id) =>
      formData.permissionIds.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter((id) => !categoryPermissionIds.includes(id))
        : [
            ...prev.permissionIds,
            ...categoryPermissionIds.filter(
              (id) => !prev.permissionIds.includes(id)
            ),
          ],
    }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSavingDraft(true);
      localStorage.setItem("staffDraft", JSON.stringify(formData));
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    try {
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

      await createNewAdmin(adminData);
      localStorage.removeItem("staffDraft");

      toast.success("Staff member created successfully!", {
        description: "An invitation email has been sent to the staff member.",
      });

      navigate("/admin/users/staff");
    } catch (error: any) {
      console.error("Failed to create admin:", error);
      toast.error(error?.message || "Failed to create staff member");
    }
  };

  const isCategorySelected = (category: CategoryKey) => {
    const categoryPermissions = categorizedPermissions[category] || [];
    if (categoryPermissions.length === 0) return false;
    return categoryPermissions.every((p) =>
      formData.permissionIds.includes(p.id)
    );
  };

  const isCategoryPartiallySelected = (category: CategoryKey) => {
    const categoryPermissions = categorizedPermissions[category] || [];
    if (categoryPermissions.length === 0) return false;
    const selectedCount = categoryPermissions.filter((p) =>
      formData.permissionIds.includes(p.id)
    ).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  const getSelectedCountForCategory = (category: CategoryKey) => {
    const categoryPermissions = categorizedPermissions[category] || [];
    return categoryPermissions.filter((p) =>
      formData.permissionIds.includes(p.id)
    ).length;
  };

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.role.trim() !== "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getRoles(), getPermissions()]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load roles and permissions");
      }
    };

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

    return () => {
      clearAllErrors();
    };
  }, []);

  return (
    <>
      <SiteHeader label="Staff Management" />
      <div className="min-h-screen">
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
          {/* {loading && (
            <Alert className="mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading roles and permissions...
              </AlertDescription>
            </Alert>
          )} */}

          <div className="space-y-6">
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
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-base text-xl font-semibold text-gray-900 dark:text-white">
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
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      placeholder="e.g. +1 234 567 8900"
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
                        <SelectValue placeholder="Select department" />
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
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: string) =>
                        handleInputChange("role", value)
                      }
                      disabled={createLoading}
                    >
                      <SelectTrigger className="min-h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="Select role" />
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Assign Permissions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select specific permissions for this staff member
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.permissionIds.length} of {permissions.length}{" "}
                  permissions selected
                </div>
              </div>

              {permissions.length === 0 && !loading ? (
                <Alert>
                  <AlertDescription>
                    No permissions available to assign.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeCategories.map(([category, categoryPermissions]) => {
                    const config = PERMISSION_CATEGORIES[category];
                    const IconComponent = config.icon;
                    const isSelected = isCategorySelected(category);
                    const isPartial = isCategoryPartiallySelected(category);
                    const selectedCount = getSelectedCountForCategory(category);

                    return (
                      <Collapsible
                        key={category}
                        open={openSections[category]}
                        onOpenChange={() => toggleSection(category)}
                      >
                        <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointerdark:hover:bg-gray-900/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  ref={(el) => {
                                    if (el) {
                                      (el as HTMLButtonElement).dataset.state =
                                        isPartial
                                          ? "indeterminate"
                                          : isSelected
                                            ? "checked"
                                            : "unchecked";
                                    }
                                  }}
                                  onCheckedChange={() =>
                                    handleCategoryToggle(category)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white data-[state=indeterminate]:bg-gray-400 data-[state=indeterminate]:border-gray-400"
                                  aria-label={`Toggle all ${config.name} permissions`}
                                />
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {config.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {selectedCount} of{" "}
                                      {categoryPermissions.length} selected
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                  openSections[category] ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-4 -mt-5">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {config.description}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                                {categoryPermissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                  >
                                    <Checkbox
                                      id={permission.id}
                                      checked={formData.permissionIds.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={() =>
                                        handlePermissionToggle(permission.id)
                                      }
                                      disabled={createLoading}
                                      className="mt-0.5 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label
                                        htmlFor={permission.id}
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer block"
                                      >
                                        {formatPermissionLabel(permission)}
                                      </Label>
                                      {permission.description && (
                                        <p
                                          className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                          title={permission.description}
                                        >
                                          {permission.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}