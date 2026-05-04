@extends('shipper.layouts.app')

@section('title', 'Thống kê hiệu suất')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0">Thống kê hiệu suất</h1>
            <p class="text-muted">Xem chi tiết hiệu suất giao hàng của bạn</p>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tổng đơn giao</p>
                            <h3 class="mb-0">{{ $stats['tong_so_don_giao'] }}</h3>
                            <small class="text-success">
                                <i class="fas fa-arrow-up"></i> +12% so với tháng trước
                            </small>
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
                            <p class="mb-1 text-muted small">Đơn thành công</p>
                            <h3 class="mb-0">{{ $stats['tong_don_thanh_cong'] }}</h3>
                            <small class="text-muted">
                                {{ round(($stats['tong_don_thanh_cong'] / max($stats['tong_so_don_giao'], 1)) * 100, 1) }}% thành công
                            </small>
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
                            <p class="mb-1 text-muted small">Đơn thất bại</p>
                            <h3 class="mb-0">{{ $stats['tong_don_that_bai'] }}</h3>
                            <small class="text-danger">
                                {{ round(($stats['tong_don_that_bai'] / max($stats['tong_so_don_giao'], 1)) * 100, 1) }}% thất bại
                            </small>
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
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-muted small">Tỉ lệ thành công</p>
                            <h3 class="mb-0">{{ round($stats['ty_le_thanh_cong'], 1) }}%</h3>
                            <small class="text-success">
                                <i class="fas fa-star"></i> Tốt
                            </small>
                        </div>
                        <div class="text-warning opacity-50">
                            <i class="fas fa-chart-pie fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Performance Chart -->
    <div class="row mb-4">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Biểu đồ hiệu suất</h5>
                </div>
                <div class="card-body">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Đánh giá</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <small class="text-muted d-block mb-2">Điểm trung bình</small>
                        <div class="d-flex align-items-center">
                            <h3 class="mb-0 me-2">{{ round($stats['trung_binh_danh_gia'], 1) }}/5.0</h3>
                            <div class="flex-grow-1">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= round($stats['trung_binh_danh_gia']))
                                        <i class="fas fa-star text-warning"></i>
                                    @else
                                        <i class="fas fa-star text-muted opacity-50"></i>
                                    @endif
                                @endfor
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div>
                        <small class="text-muted d-block mb-2">Bình luận tích cực</small>
                        <p class="fw-bold text-success mb-0">95%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Stats -->
    <div class="row">
        <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Thống kê theo trạng thái</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Giao thành công</span>
                            <span class="fw-bold">{{ $stats['tong_don_thanh_cong'] }} đơn</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-success" style="width: {{ round(($stats['tong_don_thanh_cong'] / max($stats['tong_so_don_giao'], 1)) * 100) }}%"></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Giao thất bại</span>
                            <span class="fw-bold">{{ $stats['tong_don_that_bai'] }} đơn</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-danger" style="width: {{ round(($stats['tong_don_that_bai'] / max($stats['tong_so_don_giao'], 1)) * 100) }}%"></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Đang xử lý</span>
                            <span class="fw-bold">{{ $stats['tong_so_don_giao'] - $stats['tong_don_thanh_cong'] - $stats['tong_don_that_bai'] }} đơn</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-warning" style="width: {{ round((($stats['tong_so_don_giao'] - $stats['tong_don_thanh_cong'] - $stats['tong_don_that_bai']) / max($stats['tong_so_don_giao'], 1)) * 100) }}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0">Thống kê doanh thu</h5>
                </div>
                <div class="card-body">
                    <div class="row text-center mb-3">
                        <div class="col-6">
                            <small class="text-muted d-block">Tháng này</small>
                            <h4 class="text-primary">{{ number_format($stats['doanh_thu_thang_nay'] ?? 0, 0, ',', '.') }}₫</h4>
                        </div>
                        <div class="col-6">
                            <small class="text-muted d-block">Trung bình/ngày</small>
                            <h4 class="text-info">
                                {{ number_format(round(($stats['doanh_thu_thang_nay'] ?? 0) / 30), 0, ',', '.') }}₫
                            </h4>
                        </div>
                    </div>
                    <hr>
                    <div class="alert alert-info mb-0">
                        <small>
                            <i class="fas fa-info-circle"></i>
                            Doanh thu được tính dựa trên phí giao hàng sau khi khấu trừ
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Target vs Achievement -->
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">Mục tiêu vs Thực tế</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <div class="text-center">
                        <h6 class="text-muted mb-3">Mục tiêu đơn hàng/tháng</h6>
                        <canvas id="targetChart1" style="max-height: 150px;"></canvas>
                        <small class="text-muted">{{ $stats['tong_so_don_giao'] }} / 300 đơn</small>
                    </div>
                </div>

                <div class="col-md-4 mb-3">
                    <div class="text-center">
                        <h6 class="text-muted mb-3">Tỉ lệ thành công</h6>
                        <canvas id="targetChart2" style="max-height: 150px;"></canvas>
                        <small class="text-muted">{{ round($stats['ty_le_thanh_cong'], 1) }}% / 95%</small>
                    </div>
                </div>

                <div class="col-md-4 mb-3">
                    <div class="text-center">
                        <h6 class="text-muted mb-3">Doanh thu</h6>
                        <canvas id="targetChart3" style="max-height: 150px;"></canvas>
                        <small class="text-muted">{{ number_format($stats['doanh_thu_thang_nay'] ?? 0, 0, ',', '.') }} / 50,000,000₫</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section('extra-js')
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
<script>
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [
                {
                    label: 'Đơn giao thành công',
                    data: [45, 52, 48, 55, 60, 58, 62, 65, 68, 70, 72, 75],
                    backgroundColor: '#198754',
                    borderRadius: 4
                },
                {
                    label: 'Đơn giao thất bại',
                    data: [5, 4, 6, 3, 2, 4, 2, 3, 2, 1, 1, 2],
                    backgroundColor: '#dc3545',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Target Charts
    const createDoughnutChart = (canvasId, actual, target, label) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const percentage = (actual / target) * 100;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        percentage >= 80 ? '#198754' : (percentage >= 60 ? '#ffc107' : '#dc3545'),
                        '#e9ecef'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    };

    createDoughnutChart('targetChart1', {{ $stats['tong_so_don_giao'] }}, 300, 'Đơn hàng');
    createDoughnutChart('targetChart2', {{ $stats['ty_le_thanh_cong'] }}, 95, 'Tỉ lệ');
    createDoughnutChart('targetChart3', {{ ($stats['doanh_thu_thang_nay'] ?? 0) }}, 50000000, 'Doanh thu');
</script>
@endsection
