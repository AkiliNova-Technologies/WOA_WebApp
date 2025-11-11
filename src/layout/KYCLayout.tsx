// import { useState } from "react";
import NavbarMinimalSection from "@/components/NavbarMinimal";
import { ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";

export default function KYCLayout() {
  return (
    <div className="flex flex-1 flex-col p-0 h-full">
      <div className="flex flex-1 flex-col p-0 h-full">
        <div className="fixed z-1000 w-full">
          <NavbarMinimalSection isKYC />
        </div>

        <div className="flex flex-col gap-4 md:gap-6 top-0 relative min-h-screen">
          <ConfigProvider
          theme={
            {
                components:{
                    Steps: {
                        colorPrimary: "#CC5500",
                        iconSize: 42,
                    }

                }
            }
          }>
            <Outlet />
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
}
