@extends('shipper.layouts.app')

@section('title', 'Danh sách đơn hàng - Người Giao Hàng')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0">Danh sách đơn hàng</h1>
        </div>
    </div>

    <!-- Filter -->
    <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Trạng thái</label>
                    <select name="status" class="form-select">
                        <option value="">-- Tất cả --</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Chờ xác nhận</option>
                        <option value="confirmed" {{ request('status') == 'confirmed' ? 'selected' : '' }}>Đã xác nhận</option>
                        <option value="picking_up" {{ request('status') == 'picking_up' ? 'selected' : '' }}>Đang lấy hàng</option>
                        <option value="picked_up" {{ request('status') == 'picked_up' ? 'selected' : '' }}>Đã lấy hàng</option>
                        <option value="in_transit" {{ request('status') == 'in_transit' ? 'selected' : '' }}>Đang vận chuyển</option>
                        <option value="delivering" {{ request('status') == 'delivering' ? 'selected' : '' }}>Đang giao</option>
                        <option value="delivered" {{ request('status') == 'delivered' ? 'selected' : '' }}>Đã giao</option>
                        <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Giao thất bại</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Ngày</label>
                    <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Tìm kiếm</label>
                    <input type="text" name="search" class="form-control" placeholder="Mã đơn hàng..." value="{{ request('search') }}">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-search"></i> Tìm kiếm
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Orders Table -->
    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Địa chỉ giao</th>
                            <th>Địa chỉ lấy</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($orders as $order)
                            <tr>
                                <td>
                                    <span class="fw-bold text-primary">{{ $order->order->ma_don_hang ?? 'N/A' }}</span>
                                </td>
                                <td>
                                    <div>
                                        <p class="mb-0">{{ $order->order->ten_nguoi_nhan ?? 'N/A' }}</p>
                                        <small class="text-muted">{{ $order->order->so_dien_thoai_nguoi_nhan ?? 'N/A' }}</small>
                                    </div>
                                </td>
                                <td>{{ Str::limit($order->order->dia_chi_nhan ?? 'N/A', 25) }}</td>
                                <td>{{ Str::limit($order->order->cua_hang->dia_chi ?? 'N/A', 25) }}</td>
                                <td>
                                    @php
                                        $statusColors = [
                                            'pending' => 'secondary',
                                            'confirmed' => 'info',
                                            'picking_up' => 'warning',
                                            'picked_up' => 'info',
                                            'in_transit' => 'primary',
                                            'delivering' => 'warning',
                                            'delivered' => 'success',
                                            'failed' => 'danger',
                                            'returned' => 'danger',
                                            'cancelled' => 'dark'
                                        ];
                                        $color = $statusColors[$order->trang_thai] ?? 'secondary';
                                    @endphp
                                    <span class="badge bg-{{ $color }}">
                                        {{ ucfirst(str_replace('_', ' ', $order->trang_thai)) }}
                                    </span>
                                </td>
                                <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <a href="{{ route('shipper.orders.detail', $order->id) }}" class="btn btn-outline-primary" title="Xem chi tiết">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <button class="btn btn-outline-success update-status-btn" data-order-id="{{ $order->id }}" title="Cập nhật">
                                            <i class="fas fa-sync"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 d-block opacity-50"></i>
                                    Không có đơn hàng
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-white border-top">
            {{ $orders->links() }}
        </div>
    </div>
</div>

<!-- Update Status Modal -->
<div class="modal fade" id="updateStatusModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Cập nhật trạng thái</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="updateStatusForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Trạng thái mới</label>
                        <select name="trang_thai" class="form-select" required>
                            <option value="">-- Chọn --</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="picking_up">Đang lấy hàng</option>
                            <option value="picked_up">Đã lấy hàng</option>
                            <option value="in_transit">Đang vận chuyển</option>
                            <option value="delivering">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="failed">Giao thất bại</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ghi chú</label>
                        <textarea name="ghi_chu" class="form-control" rows="3" placeholder="Thêm ghi chú (nếu cần)"></textarea>
                    </div>
                    <div id="failureReason" class="mb-3" style="display: none;">
                        <label class="form-label">Lý do không giao được</label>
                        <textarea name="ly_do_that_bai" class="form-control" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@section('extra-js')
<script>
    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const form = document.getElementById('updateStatusForm');
            form.action = `/shipper/orders/${orderId}/status`;
            
            const statusSelect = form.querySelector('select[name="trang_thai"]');
            statusSelect.addEventListener('change', function() {
                const failureReason = document.getElementById('failureReason');
                failureReason.style.display = this.value === 'failed' ? 'block' : 'none';
            });
            
            const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
            modal.show();
        });
    });
</script>
@endsection
