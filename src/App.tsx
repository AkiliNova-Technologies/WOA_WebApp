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
import AccountSettingsPage from "./pages/seller/AccountSetting";
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

function App() {
  return (
    <div>
      <main>
        <Router>
          <Routes>
            <Route path="" element={<WebsiteLayout />}>
              <Route index element={<ConsumerHomePage />} />
              <Route path="/profile" element={<ProfileLayout />}>
                <Route index element={<AccountSettingsPage />} />
              </Route>
              <Route path="/*" element={<PageNotFound />} />
            </Route>
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<SigninPage />} />
              <Route path="signin" element={<SigninPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="verify" element={<EmailOTPPage />} />
              <Route path="signup" element={<SignupPage />} />
            </Route>
            <Route path="kyc" element={<KYCLayout />}>
              <Route index element={<StepsContainer />} />
            </Route>
            <Route path="/seller" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
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
      </main>
    </div>
  );
}

export default App;
