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
            <Route path="/kyc" element={<KYCLayout />}>
              <Route index element={<StepsContainer />} />
            </Route>
            <Route path="/seller-dashboard" element={<DashboardLayout />}>
              <Route index element={<ConsumerHomePage />} />
            </Route>
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
