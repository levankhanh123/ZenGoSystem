import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Shops from "../pages/Shops";
import Orders from "../pages/Orders";
import Notifications from "../pages/Notifications";
import Shippers from "../pages/Shippers";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import {
    CampaignCreatePage,
    CampaignHomePage,
    CampaignListPage,
    CampaignOverviewPage,
    CampaignRegistrationsPage,
    CampaignShopVouchersPage,
    ComplaintConversationPage,
    ComplaintHomePage,
    ComplaintOverviewPage,
    ComplaintQueuePage,
    FinanceHomePage,
    FinanceLogsPage,
    FinanceOverviewPage,
    FinancePaymentsPage,
    FinanceRefundsPage,
    FinanceShipperSettlementsPage,
    FinanceShopSettlementsPage,
} from "../pages/SectionPages";

export const adminRouteConfig = [
    { index: true, redirectTo: "dashboard" },
    { path: "dashboard", element: Dashboard },
    { path: "users", element: Users },
    { path: "shops", element: Shops },
    { path: "orders", element: Orders },
    { path: "products", element: Products },
    { path: "categories", element: Categories },
    { path: "complaints", element: ComplaintHomePage },
    { path: "complaints/overview", element: ComplaintOverviewPage },
    { path: "complaints/cases", element: ComplaintQueuePage },
    { path: "complaints/conversations", element: ComplaintConversationPage },
    { path: "shippers", element: Shippers },
    { path: "finance", element: FinanceHomePage },
    { path: "finance/overview", element: FinanceOverviewPage },
    { path: "finance/payments", element: FinancePaymentsPage },
    { path: "finance/shop-settlements", element: FinanceShopSettlementsPage },
    { path: "finance/shipper-settlements", element: FinanceShipperSettlementsPage },
    { path: "finance/refunds", element: FinanceRefundsPage },
    { path: "finance/logs", element: FinanceLogsPage },
    { path: "campaigns", element: CampaignHomePage },
    { path: "campaigns/overview", element: CampaignOverviewPage },
    { path: "campaigns/list", element: CampaignListPage },
    { path: "campaigns/registrations", element: CampaignRegistrationsPage },
    { path: "campaigns/shop-vouchers", element: CampaignShopVouchersPage },
    { path: "campaigns/create", element: CampaignCreatePage },
    { path: "notifications", element: Notifications },
];