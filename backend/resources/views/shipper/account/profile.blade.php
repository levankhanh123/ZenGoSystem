@extends('shipper.layouts.app')

@section('title', 'Quản lý tài khoản')

@section('content')
<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="h3 mb-0">Quản lý tài khoản</h1>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-3 mb-4">
            <!-- Profile Avatar -->
            <div class="card border-0 shadow-sm text-center">
                <div class="card-body">
                    @if($shipper->anh_dai_dien)
                        <img src="{{ asset('storage/' . $shipper->anh_dai_dien) }}" alt="Avatar" class="rounded-circle mb-3" width="150" height="150">
                    @else
                        <div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" style="width: 150px; height: 150px;">
                            <i class="fas fa-user fa-5x text-white"></i>
                        </div>
                    @endif
                    <h5>{{ $shipper->ho_ten }}</h5>
                    <p class="text-muted small">{{ $shipper->email }}</p>
                    <span class="badge bg-success">Đang hoạt động</span>
                </div>
            </div>
        </div>

        <div class="col-lg-9">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-content" type="button" role="tab">
                        <i class="fas fa-user"></i> Thông tin cá nhân
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="password-tab" data-bs-toggle="tab" data-bs-target="#password-content" type="button" role="tab">
                        <i class="fas fa-lock"></i> Đổi mật khẩu
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="vehicle-tab" data-bs-toggle="tab" data-bs-target="#vehicle-content" type="button" role="tab">
                        <i class="fas fa-truck"></i> Phương tiện
                    </button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Profile Tab -->
                <div class="tab-pane fade show active" id="profile-content" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom">
                            <h5 class="mb-0">Thông tin cá nhân</h5>
                        </div>
                        <form method="POST" action="{{ route('shipper.account.update') }}" enctype="multipart/form-data">
                            @csrf
                            @method('PUT')
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Họ và tên <span class="text-danger">*</span></label>
                                        <input type="text" name="ho_ten" class="form-control @error('ho_ten') is-invalid @enderror" value="{{ old('ho_ten', $shipper->ho_ten) }}" required>
                                        @error('ho_ten')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Email <span class="text-danger">*</span></label>
                                        <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email', $shipper->email) }}" required>
                                        @error('email')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Số điện thoại <span class="text-danger">*</span></label>
                                        <input type="text" name="so_dien_thoai" class="form-control @error('so_dien_thoai') is-invalid @enderror" value="{{ old('so_dien_thoai', $shipper->so_dien_thoai) }}" required>
                                        @error('so_dien_thoai')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Ảnh đại diện</label>
                                        <input type="file" name="anh_dai_dien" class="form-control @error('anh_dai_dien') is-invalid @enderror" accept="image/*">
                                        <small class="text-muted">JPG, PNG, GIF (Max: 2MB)</small>
                                        @error('anh_dai_dien')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-bold">Địa chỉ <span class="text-danger">*</span></label>
                                    <textarea name="dia_chi" class="form-control @error('dia_chi') is-invalid @enderror" rows="3" required>{{ old('dia_chi', $shipper->dia_chi ?? '') }}</textarea>
                                    @error('dia_chi')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="card-footer bg-white border-top">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Password Tab -->
                <div class="tab-pane fade" id="password-content" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom">
                            <h5 class="mb-0">Đổi mật khẩu</h5>
                        </div>
                        <form method="POST" action="{{ route('shipper.account.change-password') }}">
                            @csrf
                            <div class="card-body">
                                <div class="alert alert-info mb-4">
                                    <i class="fas fa-info-circle"></i> Nhập mật khẩu cũ và mật khẩu mới để đổi mật khẩu
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-bold">Mật khẩu cũ <span class="text-danger">*</span></label>
                                    <input type="password" name="mat_khau_cu" class="form-control @error('mat_khau_cu') is-invalid @enderror" required>
                                    @error('mat_khau_cu')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-bold">Mật khẩu mới <span class="text-danger">*</span></label>
                                    <input type="password" name="mat_khau_moi" class="form-control @error('mat_khau_moi') is-invalid @enderror" required>
                                    <small class="text-muted">Tối thiểu 6 ký tự</small>
                                    @error('mat_khau_moi')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-bold">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                                    <input type="password" name="mat_khau_moi_confirmation" class="form-control" required>
                                    @error('mat_khau_moi')
                                        <div class="invalid-feedback d-block">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="card-footer bg-white border-top">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-lock"></i> Đổi mật khẩu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Vehicle Tab -->
                <div class="tab-pane fade" id="vehicle-content" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom">
                            <h5 class="mb-0">Thông tin phương tiện</h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p class="text-muted small mb-1">Loại phương tiện</p>
                                    <p class="fw-bold">{{ $shipper->loai_phuong_tien ?? 'Chưa cập nhật' }}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="text-muted small mb-1">Biển số xe</p>
                                    <p class="fw-bold">{{ $shipper->bien_so_xe ?? 'Chưa cập nhật' }}</p>
                                </div>
                            </div>
                            <hr>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> Để thay đổi thông tin phương tiện, vui lòng liên hệ với quản trị viên
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
