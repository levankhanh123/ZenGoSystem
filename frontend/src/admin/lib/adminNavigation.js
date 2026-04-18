export const adminNavigationGroups = [
    {
        title: "Tong quan",
        modules: [
            {
                key: "dashboard",
                label: "Dashboard",
                description: "Toan canh van hanh san",
                tag: "OPS",
                to: "/admin/dashboard",
                headerLabel: "Dashboard",
                headerDescription: "Toan canh van hanh san.",
            },
        ],
    },
    {
        title: "Van hanh san",
        modules: [
            {
                key: "users",
                label: "Nguoi dung",
                description: "Buyer trust va hanh vi mua",
                tag: "USR",
                to: "/admin/users",
                headerLabel: "Nguoi dung",
                headerDescription: "Buyer trust va hanh vi mua.",
            },
            {
                key: "shops",
                label: "Cua hang",
                description: "Duyet seller va ho so shop",
                tag: "SEL",
                to: "/admin/shops",
                headerLabel: "Cua hang",
                headerDescription: "Duyet seller va ho so shop.",
            },
            {
                key: "orders",
                label: "Don hang",
                description: "Don rui ro, SLA, xac minh",
                tag: "ORD",
                to: "/admin/orders",
                headerLabel: "Don hang",
                headerDescription: "Don rui ro, SLA va xac minh.",
            },
            {
                key: "shippers",
                label: "Giao hang",
                description: "Hieu suat shipper va can thiep",
                tag: "SHP",
                to: "/admin/shippers",
                headerLabel: "Giao hang",
                headerDescription: "Hieu suat shipper va can thiep.",
            },
        ],
    },
    {
        title: "Cham soc khach hang",
        modules: [
            {
                key: "complaints",
                label: "CSKH",
                description: "Khieu nai va hoi thoai ho tro",
                tag: "CS",
                to: "/admin/complaints",
                basePath: "/admin/complaints",
                headerLabel: "CSKH",
                headerDescription: "Khieu nai va hoi thoai ho tro.",
                children: [
                    {
                        key: "complaints-overview",
                        label: "Tong quan",
                        to: "/admin/complaints/overview",
                        headerLabel: "Tong quan CSKH",
                        headerDescription: "Tong hop case, SLA va chat ton dong.",
                    },
                    {
                        key: "complaints-queue",
                        label: "Queue khieu nai",
                        to: "/admin/complaints/cases",
                        headerLabel: "Queue khieu nai",
                        headerDescription: "Danh sach case va dieu phoi xu ly.",
                    },
                    {
                        key: "complaints-conversations",
                        label: "Trung tam chat",
                        to: "/admin/complaints/conversations",
                        headerLabel: "Trung tam chat CSKH",
                        headerDescription: "Hoi thoai ho tro va transcript phan hoi.",
                    },
                ],
            },
            {
                key: "notifications",
                label: "Thong bao",
                description: "Broadcast va canh bao he thong",
                tag: "NTF",
                to: "/admin/notifications",
                headerLabel: "Thong bao",
                headerDescription: "Broadcast va canh bao he thong.",
            },
        ],
    },
    {
        title: "Tai chinh va tang truong",
        modules: [
            {
                key: "finance",
                label: "Tai chinh",
                description: "Doi soat, COD, hoan tien",
                tag: "FIN",
                to: "/admin/finance",
                basePath: "/admin/finance",
                headerLabel: "Tai chinh",
                headerDescription: "Doi soat, COD va hoan tien.",
                children: [
                    {
                        key: "finance-overview",
                        label: "Tong quan",
                        to: "/admin/finance/overview",
                        headerLabel: "Tong quan tai chinh",
                        headerDescription: "Dong tien tong hop va KPI tai chinh.",
                    },
                    {
                        key: "finance-payments",
                        label: "Giao dich",
                        to: "/admin/finance/payments",
                        headerLabel: "Giao dich thanh toan",
                        headerDescription: "Doi soat giao dich va batch payment ops.",
                    },
                    {
                        key: "finance-shop-settlements",
                        label: "Doi soat shop",
                        to: "/admin/finance/shop-settlements",
                        headerLabel: "Doi soat shop",
                        headerDescription: "Payout queue va van hanh doi soat seller.",
                    },
                    {
                        key: "finance-shipper-settlements",
                        label: "Cong no shipper",
                        to: "/admin/finance/shipper-settlements",
                        headerLabel: "Cong no shipper",
                        headerDescription: "Theo doi COD ton va canh bao shipper.",
                    },
                    {
                        key: "finance-refunds",
                        label: "Hoan tien",
                        to: "/admin/finance/refunds",
                        headerLabel: "Hoan tien",
                        headerDescription: "Xu ly refund va tien hoan buyer.",
                    },
                    {
                        key: "finance-logs",
                        label: "Nhat ky",
                        to: "/admin/finance/logs",
                        headerLabel: "Nhat ky tai chinh",
                        headerDescription: "Audit log cua cac bien dong tai chinh.",
                    },
                ],
            },
            {
                key: "campaigns",
                label: "Campaign",
                description: "Voucher va duyet dang ky shop",
                tag: "MKT",
                to: "/admin/campaigns",
                basePath: "/admin/campaigns",
                headerLabel: "Campaign",
                headerDescription: "Voucher va duyet dang ky shop.",
                children: [
                    {
                        key: "campaigns-overview",
                        label: "Tong quan",
                        to: "/admin/campaigns/overview",
                        headerLabel: "Tong quan campaign",
                        headerDescription: "Heat map campaign, chi so va case can uu tien.",
                    },
                    {
                        key: "campaigns-list",
                        label: "Danh sach chien dich",
                        to: "/admin/campaigns/list",
                        headerLabel: "Danh sach chien dich",
                        headerDescription: "Loc, theo doi va cap nhat campaign dang chay.",
                    },
                    {
                        key: "campaigns-registrations",
                        label: "Duyet dang ky",
                        to: "/admin/campaigns/registrations",
                        headerLabel: "Duyet dang ky tham gia",
                        headerDescription: "Queue duyet ho so seller tham gia campaign.",
                    },
                    {
                        key: "campaigns-create",
                        label: "Tao chien dich",
                        to: "/admin/campaigns/create",
                        headerLabel: "Tao chien dich",
                        headerDescription: "Khoi tao voucher va campaign moi.",
                    },
                ],
            },
        ],
    },
];

export const adminModules = adminNavigationGroups.flatMap((group) => group.modules);
export const adminNavigationItems = adminModules.flatMap((module) =>
    module.children?.length ? module.children : [module]
);

export function findActiveModule(pathname) {
    return (
        adminModules.find((module) => pathname.startsWith(module.basePath || module.to)) ||
        adminModules[0]
    );
}

export function findActiveNavigationItem(pathname) {
    return (
        adminNavigationItems.find((item) => pathname === item.to) ||
        adminNavigationItems.find((item) => pathname.startsWith(item.to + "/")) ||
        adminModules.find((module) => pathname === module.to) ||
        adminNavigationItems[0]
    );
}
