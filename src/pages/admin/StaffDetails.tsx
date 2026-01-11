import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";
import {
  type StaffDepartment,
  type StaffMember,
  type StaffRole,
  type StaffStatus,
} from "./Staff";
import images from "@/assets/images";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface InfoProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconContainerStyle?: React.CSSProperties;
  iconContainerClassName?: string;
}

function Info({
  label,
  value,
  icon,
  iconContainerStyle,
  iconContainerClassName = "w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center",
}: InfoProps) {
  return (
    <div>
      <div className="flex flex-row items-center gap-3">
        {icon && (
          <div className={iconContainerClassName} style={iconContainerStyle}>
            {icon}
          </div>
        )}
        <div className="flex flex-col space-y-1">
          <p className="text-[#666666] text-sm">{label}</p>
          <p className="font-medium dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

// Helper function to safely get phone number from admin
const getAdminPhoneNumber = (admin: any): string => {
  // Try multiple possible phone number fields
  if (admin.phoneNumber) return admin.phoneNumber;
  if (admin.phone) return admin.phone;
  if (admin.mobile) return admin.mobile;
  if (admin.contactNumber) return admin.contactNumber;
  
  return "Not provided";
};

// Helper function to safely get avatar from admin
const getAdminAvatar = (admin: any): string => {
  // Try multiple possible avatar fields
  if (admin.avatarUrl) return admin.avatarUrl;
  if (admin.avatar) return admin.avatar;
  if (admin.profilePicture) return admin.profilePicture;
  if (admin.profileImage) return admin.profileImage;
  if (admin.photoURL) return admin.photoURL;
  
  return "";
};

export default function AdminStaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admins, getAdmins } = useReduxAdmin();
  const [staffData, setStaffData] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        await getAdmins();
      } catch (error) {
        console.error("Failed to fetch staff data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffData();
    }
  }, [id, getAdmins]);

  useEffect(() => {
    if (Array.isArray(admins) && id) {
      const admin = admins.find((admin) => {
        // Try multiple ID fields
        const adminId = admin.id?.toString() || admin.id?.toString();
        return adminId === id;
      });
      
      if (admin) {
        const colors = [
          "bg-blue-100 text-blue-600",
          "bg-green-100 text-green-600",
          "bg-purple-100 text-purple-600",
          "bg-pink-100 text-pink-600",
          "bg-orange-100 text-orange-600",
          "bg-teal-100 text-teal-600",
          "bg-yellow-100 text-yellow-600",
          "bg-indigo-100 text-indigo-600",
          "bg-red-100 text-red-600",
          "bg-violet-100 text-violet-600",
        ];
        
        // Use a stable ID for color selection
        const adminId = admin.id?.toString() || admin.id?.toString() || '0';
        const colorIndex = (parseInt(adminId, 10) || 0) % colors.length;

        let status: StaffStatus = "active";
        const accountStatus = admin.accountStatus?.toLowerCase();

        if (accountStatus === "active") {
          status = "active";
        } else if (accountStatus === "suspended") {
          status = "suspended";
        } else if (accountStatus === "pending_deletion" || accountStatus === "deleted") {
          status = "deleted";
        } else if (accountStatus === "pending") {
          status = "pending_approval";
        } else if (accountStatus === "deactivated") {
          status = "deactivated";
        } else if (accountStatus === "inactive") {
          status = "deactivated";
        }

        // Map role and department based on admin's roles
        let role: StaffRole = "admin";
        let department: StaffDepartment = "Administration";
        let roleLabel = "Admin";
        
        // Get role name from the first role in the roles array
        const firstRole = admin.roles?.[0];
        const roleName = firstRole?.name?.toLowerCase() || 
                        admin.userType?.toLowerCase() || 
                        "admin";
        
        const roleMapping: Record<
          string,
          { role: StaffRole; roleLabel: string; department: StaffDepartment }
        > = {
          superadmin: {
            role: "superadmin",
            roleLabel: "Super Admin",
            department: "Management",
          },
          admin: {
            role: "admin",
            roleLabel: "Admin",
            department: "Administration",
          },
          operations: {
            role: "operations",
            roleLabel: "Operations",
            department: "Operations",
          },
          marketing: {
            role: "marketing",
            roleLabel: "Marketing",
            department: "Marketing",
          },
          logistics: {
            role: "logistics",
            roleLabel: "Logistics",
            department: "Logistics",
          },
          helpdesk: {
            role: "helpdesk",
            roleLabel: "Helpdesk",
            department: "Support",
          },
          support: { 
            role: "support", 
            roleLabel: "Support", 
            department: "Support" 
          },
          manager: {
            role: "superadmin",
            roleLabel: "Manager",
            department: "Management",
          },
          staff: {
            role: "admin",
            roleLabel: "Staff",
            department: "Administration",
          },
        };

        const mapping = roleMapping[roleName] || roleMapping.admin;

        role = mapping.role;
        roleLabel = mapping.roleLabel;
        department = mapping.department;

        // Get permissions from roles
        const permissions = admin.roles?.flatMap((role: any) =>
          role.permissions?.map((permission: any) => permission.name || permission)
        ) || ["Basic Access"];

        // Generate location (use default or extract from user data if available)
        // const locations = [
        //   "Kampala, Uganda",
        //   "Nairobi, Kenya",
        //   "Accra, Ghana",
        //   "Kigali, Rwanda",
        //   "Lagos, Nigeria",
        //   "Cairo, Egypt",
        //   "Dar es Salaam, Tanzania",
        // ];
        const location = "unknown"
        
        const businessName = `${admin.firstName || 'Staff'}'s ${department}`;

        // Format name
        const firstName = admin.firstName || "";
        const lastName = admin.lastName || "";
        const name = `${firstName} ${lastName}`.trim() || admin.email || "Unknown Staff";

        const staff: StaffMember = {
          id: adminId,
          name,
          email: admin.email || "",
          phone: getAdminPhoneNumber(admin),
          department,
          role,
          roleLabel,
          signedUpOn: admin.createdAt || new Date().toISOString(),
          status,
          location,
          businessName,
          joinDate: admin.createdAt || new Date().toISOString(),
          permissions: Array.from(new Set(permissions)),
          firstName: firstName,
          lastName: lastName,
          userType: admin.userType || "admin",
          accountStatus: status,
          createdAt: admin.createdAt || new Date().toISOString(),
          updatedAt: admin.updatedAt || admin.createdAt || new Date().toISOString(),
          // Additional properties with fallbacks
          phoneNumber: getAdminPhoneNumber(admin),
          
          
          
          
          
          tier: "staff",
          avatarColor: colors[colorIndex],
          isActive: status === "active",
          avatar: getAdminAvatar(admin),
          roles: admin.roles || [],
        };

        setStaffData(staff);
      } else {
        console.warn(`Admin with ID ${id} not found`);
      }
    }
  }, [admins, id]);

  // Format last active time
  const formatLastActive = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Never";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      return "Never";
    }
  };

  if (loading) {
    return (
      <>
        <SiteHeader label="Staff Management" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC5500] mx-auto mb-4"></div>
            <p>Loading staff details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!staffData) {
    return (
      <>
        <SiteHeader label="Staff Management" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Staff Member Not Found</h2>
            <p className="text-gray-600 mb-4">The requested staff member could not be found.</p>
            <Button 
              onClick={() => navigate("/admin/users/staff")}
              className="bg-[#CC5500] hover:bg-[#CC5500]/90"
            >
              Back to Staff List
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader label="Staff Management" />
      <div className="min-h-screen">
        <div className="p-4 md:p-6 mx-auto space-y-6">
          {/* Back Navigation Card */}
          <Card className="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-sm"
                  onClick={() => navigate("/admin/users/staff")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="text-sm md:text-base">Back to Staff List</p>
              </div>

              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  staffData.status === "active"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : staffData.status === "suspended"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : staffData.status === "deleted"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                <span className="capitalize">
                  {staffData.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </Card>
          
          {/* Cover Image */}
          <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-xl">
            <img
              src={images.Placeholder}
              alt="Cover"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Staff Summary Card */}
          <div className="relative -mt-20 md:-mt-24 px-6">
            <Card className="border-0 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {staffData.avatar ? (
                    <img
                      src={staffData.avatar}
                      alt={staffData.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${staffData.avatarColor} flex items-center justify-center text-3xl md:text-4xl font-bold border-4 border-white`}
                    >
                      {getInitials(staffData.name)}
                    </div>
                  )}
                </div>

                {/* Staff Info */}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {staffData.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{staffData.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {staffData.roleLabel}
                    </span>
                    <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {staffData.department}
                    </span>
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      Joined {new Date(staffData.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs Section */}
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#CC5500] data-[state=active]:shadow-sm rounded-md"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="staff-details"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#CC5500] data-[state=active]:shadow-sm rounded-md"
                  >
                    Staff Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#CC5500] data-[state=active]:shadow-sm rounded-md"
                  >
                    Permissions
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Staff Performance</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-5">
                          <h3 className="font-semibold mb-3">Recent Activities</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Last Active</span>
                              <span className="font-medium">
                                {formatLastActive(staffData.lastActive)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Account Created</span>
                              <span className="font-medium">
                                {new Date(staffData.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Status</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                staffData.status === "active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {staffData.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-5">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Assigned Permissions</h3>
                            <span className="text-sm text-gray-500">
                              {staffData.permissions.length} permissions
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {staffData.permissions.slice(0, 6).map((permission, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-800 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                            {staffData.permissions.length > 6 && (
                              <span className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 rounded-full">
                                +{staffData.permissions.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Staff Details Tab */}
                <TabsContent value="staff-details" className="space-y-6 animate-in fade-in-50">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Info
                          label="Full Name"
                          value={staffData.name}
                          icon={<User className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"
                        />
                        <Info
                          label="Email Address"
                          value={staffData.email}
                          icon={<Mail className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"
                        />
                        <Info
                          label="Phone Number"
                          value={staffData.phoneNumber}
                          icon={<Phone className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"
                        />
                        <Info
                          label="Join Date"
                          value={new Date(staffData.joinDate).toLocaleDateString()}
                          icon={<Calendar className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"
                        />
                        <Info
                          label="Last Active"
                          value={formatLastActive(staffData.lastActive)}
                          icon={<Clock className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"
                        />
                        <Info
                          label="Department"
                          value={staffData.department}
                          icon={<MapPin className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="py-6">
                    <CardHeader>
                      <h2 className="text-xl font-semibold">Location Information</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Info
                          label="Location"
                          value={staffData.location}
                          icon={<MapPin className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"
                        />
                        <Info
                          label="Address"
                          value={staffData.address}
                          icon={<MapPin className="h-5 w-5" />}
                          iconContainerClassName="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="animate-in fade-in-50">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-6">Roles & Permissions</h2>
                      
                      {staffData.roles && staffData.roles.length > 0 ? (
                        <div className="space-y-4">
                          {staffData.roles.map((role: any, index: number) => (
                            <div key={role.id || index} className="border rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {role.name || `Role ${index + 1}`}
                                  </h3>
                                  {role.description && (
                                    <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                                  role.isSystem 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {role.isSystem ? "System Role" : "Custom Role"}
                                </span>
                              </div>
                              
                              {role.permissions && role.permissions.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 text-gray-700">Permissions:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission: any, permIndex: number) => (
                                      <span 
                                        key={permIndex}
                                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-full"
                                        title={permission.description || permission.name}
                                      >
                                        {permission.name || permission}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-lg">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Roles Assigned
                          </h3>
                          <p className="text-gray-600 max-w-md mx-auto">
                            This staff member doesn't have any specific roles or permissions assigned yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}