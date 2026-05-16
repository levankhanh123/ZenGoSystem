import React from "react";
import Campaigns from "./Campaigns";
import Complaints from "./Complaints";
import Finance from "./Finance";

function ModuleHubPage() {
    return null;
}

export function ComplaintHomePage() {
    return <ModuleHubPage />;
}

export function FinanceHomePage() {
    return <ModuleHubPage />;
}

export function CampaignHomePage() {
    return <ModuleHubPage />;
}

export function CampaignOverviewPage() {
    return <Campaigns view="overview" />;
}

export function CampaignListPage() {
    return <Campaigns view="list" />;
}

export function CampaignRegistrationsPage() {
    return <Campaigns view="registrations" />;
}

export function CampaignShopVouchersPage() {
    return <Campaigns view="shop-vouchers" />;
}

export function CampaignCreatePage() {
    return <Campaigns view="create" />;
}

export function ComplaintOverviewPage() {
    return <Complaints view="overview" />;
}

export function ComplaintQueuePage() {
    return <Complaints view="complaints" />;
}

export function ComplaintConversationPage() {
    return <Complaints view="conversations" />;
}

export function FinanceOverviewPage() {
    return <Finance view="overview" />;
}

export function FinancePaymentsPage() {
    return <Finance view="payments" />;
}

export function FinanceShopSettlementsPage() {
    return <Finance view="shop-settlements" />;
}

export function FinanceShipperSettlementsPage() {
    return <Finance view="shipper-settlements" />;
}

export function FinanceRefundsPage() {
    return <Finance view="refunds" />;
}

export function FinanceLogsPage() {
    return <Finance view="logs" />;
}
