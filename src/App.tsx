// import './App.css'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import WebsiteLayout from "./layout/WebsiteLayout";
import PageNotFound from "./pages/PageNotFound";
import ConsumerHomePage from "./pages/consumer/ConsumerHome";
import AuthLayout from "./layout/AuthLayout";
import SigninPage from "./pages/auth/Signin";
import SignupPage from "./pages/auth/Signup";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import EmailOTPPage from "./pages/auth/email-otp";
import DashboardLayout from "./layout/DashboardLayout";
import ProfileLayout from "./layout/ProfileLayout";
import KYCLayout from "./layout/KYCLayout";
import StepsContainer from "./pages/KYC/StepsContainer";
import DashboardPage from "./pages/seller/dashboard/Dashboard";
import ProductsPage from "./pages/seller/dashboard/Products";
import RevenuePage from "./pages/seller/dashboard/Revenue";
import InventoryPage from "./pages/seller/dashboard/Inventory";
import OrdersPage from "./pages/seller/dashboard/Orders";
import SettingsPage from "./pages/seller/dashboard/Settings";
import SellerSettingsDashboardLayout from "./layout/SellerSettingsDashboardLayout";
import CreatePassword from "./pages/seller/dashboard/CreatePassword";
import { EditStore } from "./pages/seller/dashboard/EditStore";
import CartPage from "./pages/consumer/Cart";
import WishListPage from "./pages/consumer/Wishlist";
import ProductDetailPage from "./pages/consumer/ProductDetail";
import SubCategoryPage from "./pages/consumer/SubCategory";
import CategoryPage from "./pages/consumer/Category";
import CategoryLayout from "./layout/CategoryLayout";
import SellerProfilePage from "./pages/consumer/SellerProfile";
import InboxPage from "./pages/profile/Inbox";
import FollowingPage from "./pages/profile/Following";
import ReviewsPage from "./pages/profile/Reviews";
import MyAccountPage from "./pages/profile/MyAccount";
import OrderHistoryPage from "./pages/profile/Orders";
import OrderHistoryDetailPage from "./pages/profile/OrderDetails";
import SimpleLayout from "./layout/SimpleLayout";
import HistoryPage from "./pages/profile/History";
import ProfileSettingsPage from "./pages/profile/Settings";
import { BreadcrumbProvider } from "./context/BreadcrumbContext";
import TypePage from "./pages/consumer/Type";
import AddProductPage from "./pages/seller/dashboard/AddProduct";

function App() {
  return (
    <div>
      <main>
        <BreadcrumbProvider>
          <Router>
            <Routes>
              <Route path="" element={<WebsiteLayout />}>
                <Route index element={<ConsumerHomePage />} />
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
                <Route path="/cart" element={<CartPage />} />
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
                  <Route
                    path="seller-profile"
                    element={<SellerProfilePage />}
                  />
                </Route>
                <Route path="/*" element={<PageNotFound />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<SigninPage />} />
                <Route path="signin" element={<SigninPage />} />
                <Route path="verify" element={<EmailOTPPage />} />
                <Route
                  path="forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="signup" element={<SignupPage />} />
              </Route>
              <Route path="kyc" element={<KYCLayout />}>
                <Route index element={<StepsContainer />} />
              </Route>
              <Route path="/seller" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<SimpleLayout />}>
                  <Route index element={<ProductsPage />} />
                  <Route path="add-product" element={<AddProductPage />} />
                </Route>
                <Route path="revenue" element={<RevenuePage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="orders" element={<OrdersPage />} />

                <Route
                  path="settings"
                  element={<SellerSettingsDashboardLayout />}
                >
                  <Route index element={<SettingsPage />} />
                  <Route path="edit-store" element={<EditStore />} />
                  <Route path="change-password" element={<CreatePassword />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </BreadcrumbProvider>
      </main>
    </div>
  );
}

export default App;
