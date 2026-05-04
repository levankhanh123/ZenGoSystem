@extends('shipper.layouts.app')

@section('title', 'Chi tiết đối soát')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-md-8">
            <h1 class="h3 mb-0">Chi tiết đối soát</h1>
            <p class="text-muted">Mã đối soát: #{{ $record->id }}</p>
        </div>
        <div class="col-md-4 text-md-end">
            <a href="{{ route('shipper.reconciliation.index') }}" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left"></i> Quay lại
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <!-- Order Details -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Thông tin chung</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Mã đối soát</p>
                            <p class="fw-bold">#{{ $record->id }}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Ngày tạo</p>
                            <p class="fw-bold">{{ $record->ngay_tao->format('d/m/Y H:i') ?? 'N/A' }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Số lượng đơn hàng</p>
                            <p class="fw-bold">{{ $record->so_don_hang ?? 0 }} đơn</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Thời gian xử lý</p>
                            <p class="fw-bold">
                                @if($record->ngay_xac_nhan)
                                    {{ $record->ngay_xac_nhan->diffInHours($record->ngay_tao) }} giờ
                                @else
                                    Chưa xác nhận
                                @endif
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Chi tiết tài chính</h5>
                </div>
                <div class="card-body">
                    <div class="row text-center mb-3">
                        <div class="col-md-4">
                            <p class="text-muted small mb-2">Tổng doanh thu</p>
                            <h4 class="text-success">{{ number_format($record->tong_tien ?? 0, 0, ',', '.') }}₫</h4>
                        </div>
                        <div class="col-md-4">
                            <p class="text-muted small mb-2">Phí & Chi phí</p>
                            <h4 class="text-danger">- {{ number_format($record->phi_va_chi_phi ?? 0, 0, ',', '.') }}₫</h4>
                        </div>
                        <div class="col-md-4">
                            <p class="text-muted small mb-2">Tiền phải trả</p>
                            <h4 class="text-primary">{{ number_format($record->tien_phai_tra ?? 0, 0, ',', '.') }}₫</h4>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Phí giao hàng (khấu trừ)</p>
                            <p class="fw-bold">- {{ number_format($record->phi_khau_tru ?? 0, 0, ',', '.') }}₫</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted small mb-1">Thưởng (nếu có)</p>
                            <p class="fw-bold">+ {{ number_format($record->thuong ?? 0, 0, ',', '.') }}₫</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Orders Included -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Danh sách đơn hàng trong kỳ</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Phí giao</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($record->giao_hang ?? [] as $order)
                                    <tr>
                                        <td>{{ $order->order->ma_don_hang ?? 'N/A' }}</td>
                                        <td>{{ $order->order->ten_nguoi_nhan ?? 'N/A' }}</td>
                                        <td>{{ number_format($order->order->phi_giao_hang ?? 0, 0, ',', '.') }}₫</td>
                                        <td>
                                            <span class="badge bg-success">{{ ucfirst($order->trang_thai) }}</span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center py-4 text-muted">
                                            Không có đơn hàng
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
            <!-- Status Card -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Trạng thái</h5>
                </div>
                <div class="card-body">
                    @php
                        $statusConfig = [
                            'pending' => ['badge' => 'warning', 'icon' => 'hourglass-half', 'label' => 'Chờ xác nhận'],
                            'completed' => ['badge' => 'info', 'icon' => 'check-circle', 'label' => 'Hoàn thành'],
                            'paid' => ['badge' => 'success', 'icon' => 'credit-card', 'label' => 'Đã thanh toán']
                        ];
                        $config = $statusConfig[$record->trang_thai] ?? ['badge' => 'secondary', 'icon' => 'question', 'label' => 'Không xác định'];
                    @endphp
                    
                    <div class="text-center mb-4">
                        <i class="fas fa-{{ $config['icon'] }} fa-3x text-{{ str_replace('badge ', '', $config['badge']) }} mb-2"></i>
                        <h5>{{ $config['label'] }}</h5>
                    </div>

                    @if($record->ngay_xac_nhan)
                        <div class="mb-3">
                            <small class="text-muted d-block">Xác nhận lúc</small>
                            <p class="fw-bold">{{ $record->ngay_xac_nhan->format('d/m/Y H:i') }}</p>
                        </div>
                    @endif

                    @if($record->ngay_thanh_toan)
                        <div class="mb-3">
                            <small class="text-muted d-block">Thanh toán lúc</small>
                            <p class="fw-bold">{{ $record->ngay_thanh_toan->format('d/m/Y H:i') }}</p>
                        </div>
                    @endif

                    @if($record->ghi_chu)
                        <div class="alert alert-info">
                            <strong>Ghi chú:</strong><br>
                            {{ $record->ghi_chu }}
                        </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Hành động</h5>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary w-100 mb-2" onclick="window.print()">
                        <i class="fas fa-print"></i> In báo cáo
                    </button>
                    <button class="btn btn-outline-secondary w-100" onclick="downloadPDF()">
                        <i class="fas fa-download"></i> Tải PDF
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section('extra-js')
<script>
    function downloadPDF() {
        alert('Tính năng tải PDF sẽ được triển khai sớm');
    }
</script>
@endsection
