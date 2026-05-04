@extends('shipper.layouts.app')

@section('title', 'Đối soát')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0">Đối soát</h1>
            <p class="text-muted">Xem chi tiết doanh thu và số tiền cần thanh toán</p>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tổng doanh thu</p>
                            <h3 class="mb-0">{{ number_format($summary['tong_doanh_thu'], 0, ',', '.') }}₫</h3>
                        </div>
                        <div class="text-success opacity-50">
                            <i class="fas fa-money-bill-wave fa-3x"></i>
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
                            <p class="mb-1 text-muted small">Đã nhận</p>
                            <h3 class="mb-0">{{ number_format($summary['tong_da_nhan'], 0, ',', '.') }}₫</h3>
                        </div>
                        <div class="text-info opacity-50">
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
                            <p class="mb-1 text-muted small">Còn nợ</p>
                            <h3 class="mb-0 text-danger">{{ number_format($summary['tong_con_no'], 0, ',', '.') }}₫</h3>
                        </div>
                        <div class="text-danger opacity-50">
                            <i class="fas fa-exclamation-circle fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="text-center">
                        <button class="btn btn-primary btn-sm w-100" data-bs-toggle="modal" data-bs-target="#filterModal">
                            <i class="fas fa-filter"></i> Bộ lọc
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter -->
    <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Từ ngày</label>
                    <input type="date" name="from_date" class="form-control" value="{{ request('from_date') }}">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Đến ngày</label>
                    <input type="date" name="to_date" class="form-control" value="{{ request('to_date') }}">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Trạng thái</label>
                    <select name="trang_thai" class="form-select">
                        <option value="">-- Tất cả --</option>
                        <option value="pending" {{ request('trang_thai') == 'pending' ? 'selected' : '' }}>Chờ xác nhận</option>
                        <option value="completed" {{ request('trang_thai') == 'completed' ? 'selected' : '' }}>Hoàn thành</option>
                        <option value="paid" {{ request('trang_thai') == 'paid' ? 'selected' : '' }}>Đã thanh toán</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-search"></i> Tìm kiếm
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Reconciliation Table -->
    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th>Mã đối soát</th>
                            <th>Thời gian</th>
                            <th>Số đơn hàng</th>
                            <th>Tổng tiền</th>
                            <th>Phí & Chi phí</th>
                            <th>Tiền phải trả</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($records as $record)
                            <tr>
                                <td>
                                    <span class="fw-bold text-primary">{{ $record->id ?? 'N/A' }}</span>
                                </td>
                                <td>{{ $record->ngay_tao->format('d/m/Y H:i') ?? 'N/A' }}</td>
                                <td class="text-center">
                                    <span class="badge bg-info">{{ $record->so_don_hang ?? 0 }}</span>
                                </td>
                                <td>{{ number_format($record->tong_tien ?? 0, 0, ',', '.') }}₫</td>
                                <td>{{ number_format($record->phi_va_chi_phi ?? 0, 0, ',', '.') }}₫</td>
                                <td>
                                    <span class="fw-bold text-success">{{ number_format($record->tien_phai_tra ?? 0, 0, ',', '.') }}₫</span>
                                </td>
                                <td>
                                    @php
                                        $statusColors = [
                                            'pending' => 'warning',
                                            'completed' => 'info',
                                            'paid' => 'success'
                                        ];
                                        $statusLabels = [
                                            'pending' => 'Chờ xác nhận',
                                            'completed' => 'Hoàn thành',
                                            'paid' => 'Đã thanh toán'
                                        ];
                                        $color = $statusColors[$record->trang_thai] ?? 'secondary';
                                    @endphp
                                    <span class="badge bg-{{ $color }}">
                                        {{ $statusLabels[$record->trang_thai] ?? 'N/A' }}
                                    </span>
                                </td>
                                <td>
                                    <a href="{{ route('shipper.reconciliation.detail', $record->id) }}" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye"></i> Chi tiết
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 d-block opacity-50"></i>
                                    Không có dữ liệu đối soát
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-white border-top">
            {{ $records->links() }}
        </div>
    </div>
</div>

<!-- Filter Modal -->
<div class="modal fade" id="filterModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Bộ lọc nâng cao</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="GET">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Từ ngày</label>
                        <input type="date" name="from_date" class="form-control" value="{{ request('from_date') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Đến ngày</label>
                        <input type="date" name="to_date" class="form-control" value="{{ request('to_date') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Trạng thái</label>
                        <select name="trang_thai" class="form-select">
                            <option value="">-- Tất cả --</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="paid">Đã thanh toán</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-primary">Áp dụng</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
