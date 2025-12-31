import "./App.css";
import { Route, Routes } from "react-router-dom";
import WebsiteLayout from "@/layout/WebsiteLayout.tsx";
import PageNotFound from "@/pages/PageNotFound.tsx";
// import ConsumerHomePage from "@/pages/consumer/ConsumerHome.tsx";
import AuthLayout from "@/layout/AuthLayout.tsx";
import SigninPage from "@/pages/auth/Signin.tsx";
import SignupPage from "@/pages/auth/Signup.tsx";
import ForgotPasswordPage from "@/pages/auth/forgot-password.tsx";
import EmailOTPPage from "@/pages/auth/email-otp.tsx";
import ProfileLayout from "@/layout/ProfileLayout.tsx";
import KYCLayout from "@/layout/KYCLayout.tsx";
import StepsContainer from "@/pages/KYC/StepsContainer.tsx";
import DashboardPage from "@/pages/vendor/dashboard/Dashboard.tsx";
import ProductsPage from "@/pages/vendor/dashboard/Products.tsx";
import RevenuePage from "@/pages/vendor/dashboard/Revenue.tsx";
import InventoryPage from "@/pages/vendor/dashboard/Inventory.tsx";
import OrdersPage from "@/pages/vendor/dashboard/Orders.tsx";
import SettingsPage from "@/pages/vendor/dashboard/Settings.tsx";
import VendorSettingsDashboardLayout from "@/layout/VendorSettingsDashboardLayout.tsx";
import CreatePassword from "@/pages/vendor/dashboard/CreatePassword.tsx";
import { EditStore } from "@/pages/vendor/dashboard/EditStore.tsx";
import CartPage from "@/pages/consumer/Cart.tsx";
import WishListPage from "@/pages/consumer/Wishlist.tsx";
import ProductDetailPage from "@/pages/consumer/ProductDetail.tsx";
import SubCategoryPage from "@/pages/consumer/SubCategory.tsx";
import CategoryPage from "@/pages/consumer/Category.tsx";
import CategoryLayout from "@/layout/CategoryLayout.tsx";
import VendorProfilePage from "@/pages/consumer/VendorProfile.tsx";
import InboxPage from "@/pages/profile/Inbox.tsx";
import FollowingPage from "@/pages/profile/Following.tsx";
import ReviewsPage from "@/pages/profile/Reviews.tsx";
import MyAccountPage from "@/pages/profile/MyAccount.tsx";
import OrderHistoryPage from "@/pages/profile/Orders.tsx";
import OrderHistoryDetailPage from "@/pages/profile/OrderDetails.tsx";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import HistoryPage from "@/pages/profile/History.tsx";
import ProfileSettingsPage from "@/pages/profile/Settings.tsx";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext.tsx";
import TypePage from "@/pages/consumer/Type.tsx";
import VendorDashboardLayout from "@/layout/VendorDashboardLayout.tsx";

// Import admin-specific pages
import AdminDashboardLayout from "@/layout/AdminDashboardLayout.tsx";
import AdminUsersPage from "@/pages/admin/Users.tsx";
import AdminCustomersPage from "@/pages/admin/Customers.tsx";
import AdminStaffPage from "@/pages/admin/Staff";
import AdminCategoriesPage from "@/pages/admin/Categories.tsx";
import AdminProductApprovalsPage from "@/pages/admin/ProductApprovals.tsx";
import AdminWishlistPage from "@/pages/admin/Wishlist.tsx";
import AdminOrdersPage from "@/pages/admin/Orders";
import AdminRevenuePage from "@/pages/admin/Revenue.tsx";
import AdminSettingsPage from "@/pages/admin/Settings.tsx";
import AdminSimpleLayout from "@/layout/AdminSimpleLayout.tsx";
import AdminCreateCategoriesPage from "@/pages/admin/CreateCategories.tsx";
import AdminProductDetailsPage from "@/pages/admin/ProductDetails.tsx";
import AdminCartPage from "@/pages/admin/Cart.tsx";
import AdminCartDetailPage from "@/pages/admin/CartDetails.tsx";
import AdminWishlistDetailPage from "@/pages/admin/WishlistDetails.tsx";
import AdminCreateDropoffPage from "@/pages/admin/CreateDropoff.tsx";
import AdminViewDropoffPage from "@/pages/admin/ViewDropoff.tsx";
import AdminVendorsPage from "@/pages/admin/Vendors.tsx";
import AdminCreateStaffPage from "@/pages/admin/CreateStaff.tsx";
import AdminEditStaffPage from "@/pages/admin/EditStaff.tsx";
import AdminCustomerDetailPage from "@/pages/admin/CustomerDetails.tsx";
import AdminVendorDetailPage from "@/pages/admin/VendorDetails.tsx";
import AdminCreateVendorPage from "@/pages/admin/CreateVendor.tsx";
import AdminSignInPage from "./pages/auth/admin/Signin.tsx";
import AdminEmailOTPPage from "./pages/auth/admin/email-otp.tsx";
import AdminForgotPasswordPage from "./pages/auth/admin/forgot-password.tsx";
import AdminAuthLayout from "./layout/AdminAuthLayout.tsx";
import VendorSignInPage from "./pages/auth/vendor/Signin.tsx";
import VendorEmailOTPPage from "./pages/auth/vendor/email-otp.tsx";
import VendorForgotPasswordPage from "./pages/auth/vendor/forgot-password.tsx";
import VendorAuthLayout from "./layout/VendorAuthLayout.tsx";
import CreatePasswordPage from "./pages/auth/CreatePassword.tsx";
import AdminDashboardPage from "./pages/admin/Dashboard.tsx";
import { Toaster } from "sonner";
import CheckoutPage from "./pages/consumer/Checkout.tsx";
import AdminCreateWarehousePage from "./pages/admin/CreateWarehouse.tsx";
import AdminWarehousesPage from "./pages/admin/Warehouses.tsx";
import AdminWarehouseDetailsPage from "./pages/admin/WarehouseDetails.tsx";
import AdminDropOffZonesPage from "@/pages/admin/DropOffZones.tsx";
import AdminSupportPage from "./pages/admin/Support.tsx";
import AdminDropOffZoneDetailsPage from "./pages/admin/DropOffDetails.tsx";
import ProductAddPage from "./pages/vendor/dashboard/CreateProduct.tsx";
import VendorProductDetailsPage from "./pages/vendor/dashboard/ProductDetails.tsx";
import VendorWishlistPage from "./pages/vendor/dashboard/Wishlist.tsx";
import AdminStaffDetailPage from "./pages/admin/StaffDetails.tsx";
import HomePage from "./pages/consumer/Home.tsx";
import ClientWebsiteLayout from "./layout/ClientHomeLayout.tsx";

function App() {
  return (
    <div>
      <main className="min-h-screen p-0">
        <BreadcrumbProvider>
          <Routes>
            <Route path="" element={<ClientWebsiteLayout />}>
              <Route index element={<HomePage />} />
            </Route>
            <Route path="" element={<WebsiteLayout />}>
              <Route path="/profile" element={<ProfileLayout />}>
                <Route index element={<MyAccountPage />} />
                <Route path="inbox" element={<InboxPage />} />

                <Route path="orders" element={<SimpleLayout />}>
                  <Route index element={<OrderHistoryPage />} />
                  <Route
                    path="details/:id"
                    element={<OrderHistoryDetailPage />}
                  />
                </Route>

                <Route path="history" element={<HistoryPage />} />
                <Route path="following" element={<FollowingPage />} />
                <Route path="settings" element={<ProfileSettingsPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
              </Route>

              <Route path="/wishlist" element={<WishListPage />} />

              <Route path="/cart" element={<SimpleLayout />}>
                <Route index element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>

              <Route path="/category" element={<CategoryLayout />}>
                <Route index element={<CategoryPage />} />
                <Route
                  path="product/:productId"
                  element={<ProductDetailPage />}
                />
                <Route
                  path="sub-category/:categoryId"
                  element={<SubCategoryPage />}
                />
                {/* Add this new route for types */}
                <Route
                  path="sub-category/:categoryId/type"
                  element={<TypePage />}
                />
                <Route path="vendor-profile" element={<VendorProfilePage />} />
              </Route>
              <Route path="/*" element={<PageNotFound />} />
            </Route>

            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<SigninPage />} />
              <Route path="signin" element={<SigninPage />} />
              <Route path="verify" element={<EmailOTPPage />} />
              <Route path="create-password" element={<CreatePasswordPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="signup" element={<SignupPage />} />
            </Route>

            <Route path="/admin/auth" element={<AdminAuthLayout />}>
              <Route index element={<AdminSignInPage />} />
              <Route path="signin" element={<AdminSignInPage />} />
              <Route path="verify" element={<AdminEmailOTPPage />} />
              <Route
                path="forgot-password"
                element={<AdminForgotPasswordPage />}
              />
            </Route>

            <Route path="/vendor/auth" element={<VendorAuthLayout />}>
              <Route index element={<VendorSignInPage />} />
              <Route path="signin" element={<VendorSignInPage />} />
              <Route path="verify" element={<VendorEmailOTPPage />} />
              <Route
                path="forgot-password"
                element={<VendorForgotPasswordPage />}
              />
            </Route>

            <Route path="kyc" element={<KYCLayout />}>
              <Route index element={<StepsContainer />} />
            </Route>

            <Route path="/vendor" element={<VendorDashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<SimpleLayout />}>
                <Route index element={<ProductsPage />} />
                <Route path="add-product" element={<ProductAddPage />} />
                <Route path="detail" element={<VendorProductDetailsPage />} />
              </Route>
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="wishlist" element={<VendorWishlistPage />} />
              <Route path="orders" element={<OrdersPage />} />

              <Route
                path="settings"
                element={<VendorSettingsDashboardLayout />}
              >
                <Route index element={<SettingsPage />} />
                <Route path="edit-store" element={<EditStore />} />
                <Route path="change-password" element={<CreatePassword />} />
              </Route>
            </Route>

            {/* Admin Routes - Updated to match AdminNavMain structure */}
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminDashboardPage />} />

              <Route path="users" element={<AdminSimpleLayout />}>
                <Route index element={<AdminUsersPage />} />
                <Route path="vendors" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminVendorsPage />} />
                  <Route path="create" element={<AdminCreateVendorPage />} />
                  <Route
                    path=":id/details"
                    element={<AdminVendorDetailPage />}
                  />
                </Route>
                <Route path="customers" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminCustomersPage />} />
                  <Route
                    path=":id/details"
                    element={<AdminCustomerDetailPage />}
                  />
                </Route>
                <Route path="staff" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminStaffPage />} />
                  <Route path="create" element={<AdminCreateStaffPage />} />
                  <Route
                    path=":id/details"
                    element={<AdminStaffDetailPage />}
                  />
                  <Route path=":id/edit" element={<AdminEditStaffPage />} />
                </Route>
              </Route>

              <Route path="categories" element={<AdminSimpleLayout />}>
                <Route index element={<AdminCategoriesPage />} />
                <Route
                  path="create-category"
                  element={<AdminCreateCategoriesPage />}
                />
              </Route>

              <Route path="products" element={<AdminSimpleLayout />}>
                <Route index element={<AdminProductApprovalsPage />} />
                <Route path="categories" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminCategoriesPage />} />
                  <Route
                    path="create-category"
                    element={<AdminCreateCategoriesPage />}
                  />
                </Route>
                <Route
                  path="approvals"
                  element={<AdminProductApprovalsPage />}
                />
                <Route
                  path=":productId/details"
                  element={<AdminProductDetailsPage />}
                />
                <Route path="wishlist" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminWishlistPage />} />
                  <Route
                    path=":productId/details"
                    element={<AdminWishlistDetailPage />}
                  />
                </Route>
                <Route path="cart" element={<AdminSimpleLayout />}>
                  <Route index element={<AdminCartPage />} />
                  <Route
                    path=":productId/details"
                    element={<AdminCartDetailPage />}
                  />
                </Route>
                <Route path="orders" element={<AdminOrdersPage />} />
              </Route>

              <Route path="logistics" element={<AdminSimpleLayout />}>
                <Route index element={<AdminDropOffZonesPage />} />
                <Route
                  path="drop-off-zones"
                  element={<AdminDropOffZonesPage />}
                />
                <Route path="warehouses" element={<AdminWarehousesPage />} />
                <Route
                  path=":id/warehouse-details"
                  element={<AdminWarehouseDetailsPage />}
                />
                <Route
                  path="create-warehouse"
                  element={<AdminCreateWarehousePage />}
                />
                <Route
                  path="create-dropoff"
                  element={<AdminCreateDropoffPage />}
                />
                <Route path="details" element={<AdminViewDropoffPage />} />
                <Route
                  path=":id/dropoff-details"
                  element={<AdminDropOffZoneDetailsPage />}
                />
              </Route>

              <Route path="revenue" element={<AdminRevenuePage />} />

              <Route path="settings" element={<AdminSettingsPage />} />

              <Route path="supoort" element={<AdminSimpleLayout />}>
                <Route index element={<AdminSupportPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            visibleToasts={3}
            offset={16}
          />
        </BreadcrumbProvider>
      </main>
    </div>
  );
}

export default App;
