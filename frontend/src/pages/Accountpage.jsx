// pages/AccountPage.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AccountSidebar from "../components/account/Accountsidebar.jsx";
import ProfileTab     from "../components/account/Profiletab.jsx";
import AddressTab     from "../components/account/Addresstab.jsx";
import WalletTab      from "../components/account/Wallettab.jsx";
import OrderHistoryTab from "../components/account/Orderhistorytab.jsx";
import NotificationTab from "../components/account/Notificationtab.jsx";
import { useProfile, useNotifications } from "../hooks/useAccount.js";

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

  // Load profile + unread count ở top level để sidebar luôn có data
  const { user, loading: profileLoading, updateProfile, updateAvatar, changePassword } = useProfile();
  const { unread } = useNotifications();

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (profileLoading) return <PageSkeleton />;
  if (!user) return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center">
      <p className="text-gray-400">Vui lòng đăng nhập để xem trang này.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileTab
            user={user}
            onUpdate={updateProfile}
            onAvatarChange={updateAvatar}
            onChangePassword={changePassword}
          />
        );
      case "address":
        return <AddressTab />;
      case "wallet":
        return <WalletTab />;
      case "orders":
        return <OrderHistoryTab />;
      case "notifications":
        return <NotificationTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#fdf5f0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xin chào, <span className="font-bold text-[#e8175d]">{user.ho_ten}</span>!
            Quản lý thông tin và đơn hàng của bạn.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:sticky lg:top-24">
            <AccountSidebar
              user={user}
              activeTab={activeTab}
              onChange={handleTabChange}
              unreadNoti={unread}
            />
          </div>
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="w-full bg-[#fdf5f0] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
        <div className="grid grid-cols-4 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="col-span-3 h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
