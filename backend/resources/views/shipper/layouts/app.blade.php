<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Shipper - ZenGo')</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: #0d6efd;
            --secondary-color: #6c757d;
        }

        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .navbar {
            background: linear-gradient(135deg, var(--primary-color) 0%, #0b5ed7 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .sidebar {
            background-color: #fff;
            border-right: 1px solid #e9ecef;
            min-height: calc(100vh - 56px);
            position: fixed;
            width: 250px;
            left: 0;
            top: 56px;
            padding: 20px 0;
            overflow-y: auto;
        }

        .sidebar .nav-link {
            color: #495057;
            padding: 10px 20px;
            border-left: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .sidebar .nav-link:hover,
        .sidebar .nav-link.active {
            background-color: #f8f9fa;
            border-left-color: var(--primary-color);
            color: var(--primary-color);
        }

        .sidebar .nav-link i {
            width: 20px;
            margin-right: 10px;
        }

        .main-content {
            margin-left: 250px;
            margin-top: 56px;
            padding: 20px;
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                width: 100%;
                z-index: 999;
            }

            .sidebar.show {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }
        }

        .card {
            border-radius: 8px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
        }

        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }

        .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #0b5ed7;
        }

        .badge {
            padding: 5px 10px;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .table-hover tbody tr:hover {
            background-color: rgba(13, 110, 253, 0.05);
        }

        .alert {
            border-radius: 8px;
            border: none;
        }

        .form-control, .form-select {
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }

        .form-control:focus, .form-select:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
    </style>
    @yield('extra-css')
</head>
<body>
    <!-- Top Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
        <div class="container-fluid">
            <button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand ms-2" href="{{ route('shipper.dashboard') }}">
                <i class="fas fa-truck"></i> ZenGo Shipper
            </a>
            <div class="ms-auto d-flex align-items-center">
                <div class="dropdown">
                    <button class="btn btn-link text-white dropdown-toggle no-arrow" type="button" id="userDropdown" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle fa-2x"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="{{ route('shipper.account.profile') }}">
                            <i class="fas fa-user"></i> Tài khoản
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <nav class="nav flex-column">
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.dashboard' ? 'active' : '' }}" 
               href="{{ route('shipper.dashboard') }}">
                <i class="fas fa-home"></i> <span>Dashboard</span>
            </a>
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.orders.list' ? 'active' : '' }}" 
               href="{{ route('shipper.orders.list') }}">
                <i class="fas fa-box"></i> <span>Đơn hàng</span>
            </a>
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.reconciliation.index' ? 'active' : '' }}" 
               href="{{ route('shipper.reconciliation.index') }}">
                <i class="fas fa-exchange-alt"></i> <span>Đối soát</span>
            </a>
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.history' ? 'active' : '' }}" 
               href="{{ route('shipper.history') }}">
                <i class="fas fa-history"></i> <span>Lịch sử</span>
            </a>
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.statistics' ? 'active' : '' }}" 
               href="{{ route('shipper.statistics') }}">
                <i class="fas fa-chart-bar"></i> <span>Thống kê</span>
            </a>
            <hr class="mx-3 my-2">
            <a class="nav-link {{ Route::currentRouteName() == 'shipper.account.profile' ? 'active' : '' }}" 
               href="{{ route('shipper.account.profile') }}">
                <i class="fas fa-user-cog"></i> <span>Tài khoản</span>
            </a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Lỗi:</strong>
                <ul class="mb-0">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle"></i> {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        @yield('content')
    </div>

    <!-- Logout Form -->
    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
    </form>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery (optional) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script>
        // Auto close alerts after 5 seconds
        document.querySelectorAll('.alert').forEach(alert => {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });

        // Mobile sidebar toggle
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    const sidebar = document.getElementById('sidebar');
                    sidebar.classList.remove('show');
                }
            });
        });
    </script>
    @yield('extra-js')
</body>
</html>
