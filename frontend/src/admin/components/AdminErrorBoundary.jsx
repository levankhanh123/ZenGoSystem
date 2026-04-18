import React from "react";

export default class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: "" };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error?.message || "Đã xảy ra lỗi không xác định.",
        };
    }

    componentDidCatch(error) {
        console.error("Admin runtime error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-100 px-4 py-10">
                    <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Trang admin gặp lỗi runtime
                        </h1>
                        <p className="mt-3 text-sm text-slate-600">
                            Web không còn bị trắng trang. Bạn đang ở đường dẫn {window.location.pathname}.
                        </p>
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {this.state.errorMessage}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}