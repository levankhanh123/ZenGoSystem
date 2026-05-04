@extends('shipper.layouts.app')

@section('title', 'Chi tiết đơn hàng')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-md-8">
            <h1 class="h3 mb-0">Chi tiết đơn hàng</h1>
            <p class="text-muted">{{ $giao_hang->order->ma_don_hang }}</p>
        </div>
        <div class="col-md-4 text-md-end">
            <a href="{{ route('shipper.orders.list') }}" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left"></i> Quay lại
            </a>
        </div>
    </div>

    <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
            <!-- Order Status -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Trạng thái đơn hàng</h5>
                </div>
                <div class="card-body">
                    <div class="order-timeline">
                        @php
                            $statuses = [
                                'pending' => 'Chờ xác nhận',
                                'confirmed' => 'Đã xác nhận',
                                'picking_up' => 'Đang lấy hàng',
                                'picked_up' => 'Đã lấy hàng',
                                'in_transit' => 'Đang vận chuyển',
                                'delivering' => 'Đang giao',
                                'delivered' => 'Đã giao',
                                'failed' => 'Giao thất bại',
                            ];
                            $currentIndex = array_search($giao_hang->trang_thai, array_keys($statuses));
                        @endphp
                        <div class="row">
                            @foreach($statuses as $status => $label)
                                @php
                                    $index = array_search($status, array_keys($statuses));
                                    $isCompleted = $index <= $currentIndex;
                                    $isCurrent = $status === $giao_hang->trang_thai;
                                @endphp
                                <div class="col-6 col-md-3 mb-3">
                                    <div class="text-center">
                                        <div class="timeline-item">
                                            <div class="timeline-dot {{ $isCompleted ? 'completed' : '' }} {{ $isCurrent ? 'current' : '' }}">
                                                <i class="fas fa-{{ $isCompleted ? 'check' : 'circle' }}"></i>
                                            </div>
                                            <p class="small mt-2">{{ $label }}</p>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted d-block">Trạng thái hiện tại</small>
                            <h5 class="mb-0">
                                <span class="badge bg-primary">{{ $statuses[$giao_hang->trang_thai] ?? 'N/A' }}</span>
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted d-block">Cập nhật lần cuối</small>
                            <p class="mb-0">{{ $giao_hang->updated_at->format('d/m/Y H:i:s') }}</p>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-top">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#updateStatusModal">
                        <i class="fas fa-sync"></i> Cập nhật trạng thái
                    </button>
                </div>
            </div>

            <!-- Shipping Information -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Thông tin giao hàng</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <h6 class="text-muted small mb-2">Lấy hàng từ</h6>
                            <p class="mb-0 fw-bold">{{ $giao_hang->order->cua_hang->ten_cua_hang ?? 'N/A' }}</p>
                            <p class="text-muted small mb-0">{{ $giao_hang->order->cua_hang->dia_chi ?? 'N/A' }}</p>
                            <p class="text-muted small mb-0">
                                <i class="fas fa-phone"></i> {{ $giao_hang->order->cua_hang->so_dien_thoai ?? 'N/A' }}
                            </p>
                            @if($giao_hang->ngay_nhan_don)
                                <p class="text-success small mt-2">
                                    <i class="fas fa-check-circle"></i> Đã lấy: {{ $giao_hang->ngay_nhan_don->format('d/m/Y H:i') }}
                                </p>
                            @endif
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted small mb-2">Giao đến</h6>
                            <p class="mb-0 fw-bold">{{ $giao_hang->order->ten_nguoi_nhan }}</p>
                            <p class="text-muted small mb-0">{{ $giao_hang->order->dia_chi_nhan }}</p>
                            <p class="text-muted small mb-0">
                                <i class="fas fa-phone"></i> {{ $giao_hang->order->so_dien_thoai_nguoi_nhan }}
                            </p>
                            @if($giao_hang->ngay_giao_thuc_te)
                                <p class="text-success small mt-2">
                                    <i class="fas fa-check-circle"></i> Đã giao: {{ $giao_hang->ngay_giao_thuc_te->format('d/m/Y H:i') }}
                                </p>
                            @else
                                @if($giao_hang->ngay_giao_du_kien)
                                    <p class="text-warning small mt-2">
                                        <i class="fas fa-clock"></i> Dự kiến: {{ $giao_hang->ngay_giao_du_kien->format('d/m/Y H:i') }}
                                    </p>
                                @endif
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Details -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Chi tiết đơn hàng</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Mã vận đơn</p>
                            <p class="fw-bold">{{ $giao_hang->ma_van_don ?? 'Chưa có' }}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Loại hàng</p>
                            <p class="fw-bold">{{ $giao_hang->order->loai_hang ?? 'N/A' }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Phí giao hàng</p>
                            <p class="fw-bold">{{ number_format($giao_hang->order->phi_giao_hang ?? 0, 0, ',', '.') }}₫</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">COD (Thu hộ)</p>
                            <p class="fw-bold">{{ number_format($giao_hang->cod_thu_ho ?? 0, 0, ',', '.') }}₫</p>
                        </div>
                    </div>
                    @if($giao_hang->ghi_chu)
                        <div class="alert alert-info mb-0">
                            <strong>Ghi chú:</strong> {{ $giao_hang->ghi_chu }}
                        </div>
                    @endif
                </div>
            </div>

            <!-- Failure Reason (if applicable) -->
            @if($giao_hang->trang_thai === 'failed' && $giao_hang->ly_do_that_bai)
                <div class="card border-0 shadow-sm border-danger mb-4">
                    <div class="card-header bg-danger-light border-danger">
                        <h5 class="mb-0 text-danger">Lý do giao thất bại</h5>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">{{ $giao_hang->ly_do_that_bai }}</p>
                        @if($giao_hang->so_lan_giao_lai)
                            <p class="text-muted small mt-2">Lần giao lại: {{ $giao_hang->so_lan_giao_lai }}</p>
                        @endif
                    </div>
                </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
            <!-- Order Summary -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Tóm tắt</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted d-block">Ngày tạo</small>
                            <p class="mb-0">{{ $giao_hang->created_at->format('d/m/Y') }}</p>
                        </div>
                        <div class="col-6">
                            <small class="text-muted d-block">Ngày cập nhật</small>
                            <p class="mb-0">{{ $giao_hang->updated_at->format('d/m/Y') }}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-12">
                            <small class="text-muted d-block">Người bán</small>
                            <p class="fw-bold mb-2">{{ $giao_hang->order->cua_hang->ten_cua_hang ?? 'N/A' }}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-12">
                            <small class="text-muted d-block">Khách hàng</small>
                            <p class="fw-bold">{{ $giao_hang->order->buyer->ho_ten ?? 'N/A' }}</p>
                            <p class="text-muted small">{{ $giao_hang->order->buyer->so_dien_thoai ?? 'N/A' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Hành động</h5>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary w-100 mb-2" data-bs-toggle="modal" data-bs-target="#updateStatusModal">
                        <i class="fas fa-sync"></i> Cập nhật trạng thái
                    </button>
                    <button class="btn btn-outline-secondary w-100" onclick="window.print()">
                        <i class="fas fa-print"></i> In thông tin
                    </button>
                </div>
            </div>
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
            <form method="POST" action="{{ route('shipper.orders.update-status', $giao_hang->id) }}">
                @csrf
                @method('PUT')
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Trạng thái mới <span class="text-danger">*</span></label>
                        <select name="trang_thai" class="form-select" id="statusSelect" required>
                            <option value="">-- Chọn trạng thái --</option>
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
                    <div id="failureSection" style="display: none;">
                        <hr>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Lý do giao thất bại <span class="text-danger">*</span></label>
                            <textarea name="ly_do_that_bai" class="form-control" rows="3" placeholder="Vui lòng ghi rõ lý do"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Số lần giao lại</label>
                            <input type="number" name="so_lan_giao_lai" class="form-control" min="0" value="0">
                        </div>
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
    document.getElementById('statusSelect').addEventListener('change', function() {
        const failureSection = document.getElementById('failureSection');
        failureSection.style.display = this.value === 'failed' ? 'block' : 'none';
    });
</script>
@endsection

<style>
    .timeline-dot {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #e9ecef;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .timeline-dot.completed {
        background-color: #198754;
        color: white;
    }

    .timeline-dot.current {
        background-color: #0d6efd;
        color: white;
        box-shadow: 0 0 0 6px rgba(13, 110, 253, 0.25);
    }
</style>
