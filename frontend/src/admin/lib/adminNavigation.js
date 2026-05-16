export const adminNavigationGroups = [
    {
        title: "Tổng quan",
        modules: [
            {
                key: "dashboard",
                label: "Bảng điều khiển",
                description: "Toàn cảnh vận hành hệ thống",
                tag: "OPS",
                to: "/admin/dashboard",
                headerLabel: "Bảng điều khiển",
                headerDescription: "Toàn cảnh vận hành và thống kê hệ thống.",
            },
        ],
    },
    {
        title: "Quản lý vận hành",
        modules: [
            {
                key: "users",
                label: "Người dùng",
                description: "Quản lý tài khoản và hành vi",
                tag: "USR",
                to: "/admin/users",
                headerLabel: "Quản lý người dùng",
                headerDescription: "Theo dõi độ tin cậy và hành vi mua hàng của người dùng.",
            },
            {
                key: "shops",
                label: "Cửa hàng",
                description: "Phê duyệt và quản lý hồ sơ shop",
                tag: "SEL",
                to: "/admin/shops",
                headerLabel: "Quản lý cửa hàng",
                headerDescription: "Duyệt nhà bán hàng và kiểm soát hồ sơ cửa hàng.",
            },
            {
                key: "orders",
                label: "Đơn hàng",
                description: "Giám sát rủi ro và cam kết SLA",
                tag: "ORD",
                to: "/admin/orders",
                headerLabel: "Quản lý đơn hàng",
                headerDescription: "Theo dõi đơn hàng rủi ro, cam kết SLA và xác minh giao dịch.",
            },
            {
                key: "shippers",
                label: "Vận chuyển",
                description: "Hiệu suất vận chuyển và điều phối",
                tag: "SHP",
                to: "/admin/shippers",
                headerLabel: "Quản lý vận chuyển",
                headerDescription: "Theo dõi hiệu suất shipper và điều phối vận chuyển toàn sàn.",
            },
            {
                key: "products",
                label: "Sản phẩm",
                description: "Duyệt sản phẩm và kiểm soát vi phạm",
                tag: "PRO",
                to: "/admin/products",
                headerLabel: "Quản lý sản phẩm",
                headerDescription: "Kiểm duyệt sản phẩm mới và giám sát tuân thủ chính sách sàn.",
            },
            {
                key: "categories",
                label: "Danh mục",
                description: "Cấu trúc ngành hàng và phân loại",
                tag: "CAT",
                to: "/admin/categories",
                headerLabel: "Quản lý ngành hàng",
                headerDescription: "Thiết lập sơ đồ danh mục 3 cấp và điều phối thứ tự hiển thị.",
            },
        ],
    },
    {
        title: "Hỗ trợ khách hàng",
        modules: [
            {
                key: "complaints",
                label: "Khiếu nại & Hỗ trợ",
                description: "Xử lý khiếu nại và phản hồi",
                tag: "CS",
                to: "/admin/complaints",
                basePath: "/admin/complaints",
                headerLabel: "Trung tâm hỗ trợ",
                headerDescription: "Quản lý khiếu nại và các cuộc hội thoại hỗ trợ khách hàng.",
                children: [
                    {
                        key: "complaints-overview",
                        label: "Tổng quan",
                        to: "/admin/complaints/overview",
                        headerLabel: "Tổng quan hỗ trợ",
                        headerDescription: "Tổng hợp yêu cầu hỗ trợ, SLA và hội thoại tồn đọng.",
                    },
                    {
                        key: "complaints-queue",
                        label: "Hàng đợi khiếu nại",
                        to: "/admin/complaints/cases",
                        headerLabel: "Danh sách khiếu nại",
                        headerDescription: "Danh sách yêu cầu khiếu nại và điều phối xử lý.",
                    },
                    {
                        key: "complaints-conversations",
                        label: "Trung tâm phản hồi",
                        to: "/admin/complaints/conversations",
                        headerLabel: "Trung tâm chat hỗ trợ",
                        headerDescription: "Quản lý hội thoại hỗ trợ và nội dung phản hồi.",
                    },
                ],
            },
            {
                key: "notifications",
                label: "Thông báo",
                description: "Gửi tin và cảnh báo hệ thống",
                tag: "NTF",
                to: "/admin/notifications",
                headerLabel: "Quản lý thông báo",
                headerDescription: "Gửi thông báo hàng loạt và theo dõi cảnh báo hệ thống.",
            },
        ],
    },
    {
        title: "Tài chính & Tăng trưởng",
        modules: [
            {
                key: "finance",
                label: "Tài chính",
                description: "Đối soát, dòng tiền và hoàn tiền",
                tag: "FIN",
                to: "/admin/finance",
                basePath: "/admin/finance",
                headerLabel: "Quản lý tài chính",
                headerDescription: "Đối soát giao dịch, dòng tiền COD và xử lý hoàn tiền.",
                children: [
                    {
                        key: "finance-overview",
                        label: "Tổng quan",
                        to: "/admin/finance/overview",
                        headerLabel: "Tổng quan tài chính",
                        headerDescription: "Phân tích dòng tiền tổng hợp và chỉ số KPI tài chính.",
                    },
                    {
                        key: "finance-payments",
                        label: "Giao dịch",
                        to: "/admin/finance/payments",
                        headerLabel: "Lịch sử thanh toán",
                        headerDescription: "Đối soát giao dịch và xử lý thanh toán hàng loạt.",
                    },
                    {
                        key: "finance-shop-settlements",
                        label: "Đối soát nhà bán",
                        to: "/admin/finance/shop-settlements",
                        headerLabel: "Đối soát cửa hàng",
                        headerDescription: "Hàng đợi chi trả và quy trình đối soát nhà bán hàng.",
                    },
                    {
                        key: "finance-shipper-settlements",
                        label: "Công nợ vận chuyển",
                        to: "/admin/finance/shipper-settlements",
                        headerLabel: "Công nợ shipper",
                        headerDescription: "Theo dõi tiền COD tồn đọng và cảnh báo công nợ shipper.",
                    },
                    {
                        key: "finance-refunds",
                        label: "Hoàn tiền",
                        to: "/admin/finance/refunds",
                        headerLabel: "Quản lý hoàn tiền",
                        headerDescription: "Xử lý các yêu cầu hoàn tiền và bồi hoàn cho khách hàng.",
                    },
                    {
                        key: "finance-logs",
                        label: "Nhật ký biến động",
                        to: "/admin/finance/logs",
                        headerLabel: "Lịch sử biến động",
                        headerDescription: "Nhật ký kiểm toán các biến động tài chính hệ thống.",
                    },
                ],
            },
            {
                key: "campaigns",
                label: "Chiến dịch",
                description: "Mã giảm giá và duyệt đăng ký",
                tag: "MKT",
                to: "/admin/campaigns",
                basePath: "/admin/campaigns",
                headerLabel: "Quản lý chiến dịch",
                headerDescription: "Quản lý mã giảm giá và duyệt đăng ký tham gia của nhà bán.",
                children: [
                    {
                        key: "campaigns-overview",
                        label: "Tổng quan",
                        to: "/admin/campaigns/overview",
                        headerLabel: "Tổng quan chiến dịch",
                        headerDescription: "Biểu đồ chiến dịch, chỉ số hiệu quả và các mục ưu tiên.",
                    },
                    {
                        key: "campaigns-list",
                        label: "Danh sách chiến dịch",
                        to: "/admin/campaigns/list",
                        headerLabel: "Quản lý danh sách",
                        headerDescription: "Bộ lọc, theo dõi và cập nhật trạng thái các chiến dịch.",
                    },
                    {
                        key: "campaigns-registrations",
                        label: "Duyệt đăng ký",
                        to: "/admin/campaigns/registrations",
                        headerLabel: "Duyệt tham gia",
                        headerDescription: "Hàng đợi xét duyệt hồ sơ nhà bán tham gia chiến dịch.",
                    },
                    {
                        key: "campaigns-shop-vouchers",
                        label: "Quản lý Voucher Shop",
                        to: "/admin/campaigns/shop-vouchers",
                        headerLabel: "Voucher nhà bán",
                        headerDescription: "Giám sát và kiểm soát các mã giảm giá do nhà bán hàng tự phát hành.",
                    },
                    {
                        key: "campaigns-create",
                        label: "Tạo chiến dịch",
                        to: "/admin/campaigns/create",
                        headerLabel: "Khởi tạo chiến dịch",
                        headerDescription: "Thiết lập mã giảm giá và chiến dịch khuyến mãi mới.",
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
