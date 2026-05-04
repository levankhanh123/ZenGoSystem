@extends('shipper.layouts.app')

@section('title', 'Lịch sử giao hàng')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0">Lịch sử giao hàng</h1>
            <p class="text-muted">Xem toàn bộ lịch sử giao hàng đã hoàn thành</p>
        </div>
    </div>

    <!-- Filter -->
    <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
            <form method="GET" class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Tháng</label>
                    <select name="month" class="form-select">
                        <option value="">-- Chọn tháng --</option>
                        @for($m = 1; $m <= 12; $m++)
                            <option value="{{ $m }}" {{ request('month') == $m ? 'selected' : '' }}>
                                Tháng {{ $m }}
                            </option>
                        @endfor
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Năm</label>
                    <select name="year" class="form-select">
                        <option value="">-- Chọn năm --</option>
                        @for($y = now()->year; $y >= 2023; $y--)
                            <option value="{{ $y }}" {{ request('year') == $y ? 'selected' : '' }}>
                                {{ $y }}
                            </option>
                        @endfor
                    </select>
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-search"></i> Tìm kiếm
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- History Table -->
    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Địa chỉ giao</th>
                            <th>Phí giao</th>
                            <th>Kết quả</th>
                            <th>Ngày giao</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($history as $item)
                            <tr>
                                <td>
                                    <span class="fw-bold text-primary">{{ $item->order->ma_don_hang ?? 'N/A' }}</span>
                                </td>
                                <td>
                                    <div>
                                        <p class="mb-0">{{ $item->order->ten_nguoi_nhan ?? 'N/A' }}</p>
                                        <small class="text-muted">{{ $item->order->so_dien_thoai_nguoi_nhan ?? 'N/A' }}</small>
                                    </div>
                                </td>
                                <td>{{ Str::limit($item->order->dia_chi_nhan ?? 'N/A', 30) }}</td>
                                <td>
                                    <span class="fw-bold">{{ number_format($item->order->phi_giao_hang ?? 0, 0, ',', '.') }}₫</span>
                                </td>
                                <td>
                                    @if($item->trang_thai === 'delivered')
                                        <span class="badge bg-success">
                                            <i class="fas fa-check-circle"></i> Giao thành công
                                        </span>
                                    @elseif($item->trang_thai === 'failed')
                                        <span class="badge bg-danger">
                                            <i class="fas fa-times-circle"></i> Giao thất bại
                                        </span>
                                    @elseif($item->trang_thai === 'returned')
                                        <span class="badge bg-warning">
                                            <i class="fas fa-undo"></i> Đã hoàn hàng
                                        </span>
                                    @elseif($item->trang_thai === 'cancelled')
                                        <span class="badge bg-dark">
                                            <i class="fas fa-ban"></i> Đã hủy
                                        </span>
                                    @endif
                                </td>
                                <td>{{ $item->ngay_giao_thuc_te ? $item->ngay_giao_thuc_te->format('d/m/Y H:i') : 'N/A' }}</td>
                                <td>
                                    <a href="{{ route('shipper.orders.detail', $item->id) }}" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye"></i> Chi tiết
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 d-block opacity-50"></i>
                                    Không có lịch sử giao hàng
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-white border-top">
            {{ $history->links() }}
        </div>
    </div>

    <!-- Summary Statistics -->
    <div class="row mt-4">
        <div class="col-md-4 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tổng đơn hoàn thành</p>
                            <h3 class="mb-0">
                                {{ $history->where('trang_thai', 'delivered')->count() }}
                            </h3>
                        </div>
                        <div class="text-success opacity-50">
                            <i class="fas fa-check-circle fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tổng đơn thất bại</p>
                            <h3 class="mb-0">
                                {{ $history->where('trang_thai', 'failed')->count() }}
                            </h3>
                        </div>
                        <div class="text-danger opacity-50">
                            <i class="fas fa-exclamation-circle fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tổng doanh thu</p>
                            <h3 class="mb-0">
                                {{ number_format($history->sum(function($item) { return $item->order->phi_giao_hang ?? 0; }), 0, ',', '.') }}₫
                            </h3>
                        </div>
                        <div class="text-info opacity-50">
                            <i class="fas fa-money-bill-wave fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
