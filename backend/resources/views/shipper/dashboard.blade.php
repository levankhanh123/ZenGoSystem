@extends('shipper.layouts.app')

@section('title', 'Dashboard - Người Giao Hàng')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-md-8">
            <h1 class="h3 mb-0">Xin chào, {{ $shipper->ho_ten }}</h1>
            <p class="text-muted">Hôm nay: {{ now()->format('d/m/Y') }}</p>
        </div>
        <div class="col-md-4 text-md-end">
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#updateStatusModal">
                <i class="fas fa-plus"></i> Cập nhật trạng thái
            </button>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Đơn hôm nay</p>
                            <h3 class="mb-0">{{ $stats['tong_don_hom_nay'] }}</h3>
                        </div>
                        <div class="text-primary opacity-50">
                            <i class="fas fa-box fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Đã giao</p>
                            <h3 class="mb-0">{{ $stats['don_da_giao'] }}</h3>
                        </div>
                        <div class="text-success opacity-50">
                            <i class="fas fa-check-circle fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Chờ giao</p>
                            <h3 class="mb-0">{{ $stats['don_cho_giao'] }}</h3>
                        </div>
                        <div class="text-warning opacity-50">
                            <i class="fas fa-hourglass-half fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Doanh thu</p>
                            <h3 class="mb-0">{{ number_format($stats['doanh_thu_hom_nay'], 0, ',', '.') }}₫</h3>
                        </div>
                        <div class="text-info opacity-50">
                            <i class="fas fa-money-bill-wave fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="row">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Đơn hàng gần đây</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Địa chỉ giao</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentOrders as $order)
                                    <tr>
                                        <td>
                                            <span class="fw-bold text-primary">{{ $order->order->ma_don_hang }}</span>
                                        </td>
                                        <td>{{ $order->order->ten_nguoi_nhan }}</td>
                                        <td>{{ Str::limit($order->order->dia_chi_nhan, 30) }}</td>
                                        <td>
                                            <span class="badge bg-{{ $order->trang_thai == 'delivered' ? 'success' : ($order->trang_thai == 'failed' ? 'danger' : 'warning') }}">
                                                {{ __('shipper.status.' . $order->trang_thai) }}
                                            </span>
                                        </td>
                                        <td>
                                            <a href="{{ route('shipper.orders.detail', $order->id) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center py-4 text-muted">
                                            Không có đơn hàng
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white border-top">
                    <a href="{{ route('shipper.orders.list') }}" class="btn btn-sm btn-outline-secondary">
                        Xem tất cả
                    </a>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Tiện ích nhanh</h5>
                </div>
                <div class="card-body">
                    <a href="{{ route('shipper.orders.list') }}" class="btn btn-outline-primary btn-sm w-100 mb-2">
                        <i class="fas fa-list"></i> Danh sách đơn hàng
                    </a>
                    <a href="{{ route('shipper.reconciliation.index') }}" class="btn btn-outline-primary btn-sm w-100 mb-2">
                        <i class="fas fa-exchange-alt"></i> Đối soát
                    </a>
                    <a href="{{ route('shipper.history') }}" class="btn btn-outline-primary btn-sm w-100 mb-2">
                        <i class="fas fa-history"></i> Lịch sử giao hàng
                    </a>
                    <a href="{{ route('shipper.statistics') }}" class="btn btn-outline-primary btn-sm w-100">
                        <i class="fas fa-chart-bar"></i> Thống kê
                    </a>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Tài khoản</h5>
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <small class="text-muted">Email</small>
                        <p class="mb-2">{{ $shipper->email }}</p>
                    </div>
                    <div class="mb-3">
                        <small class="text-muted">Điện thoại</small>
                        <p class="mb-2">{{ $shipper->so_dien_thoai }}</p>
                    </div>
                    <a href="{{ route('shipper.account.profile') }}" class="btn btn-outline-secondary btn-sm w-100">
                        <i class="fas fa-user-edit"></i> Quản lý tài khoản
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
