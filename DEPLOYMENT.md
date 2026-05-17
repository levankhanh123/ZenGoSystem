# Deploy ZenGo

## Frontend: Vercel

Root directory: `frontend`

Build command:

```bash
npm install && npm run build
```

Output directory:

```bash
dist
```

Environment variables:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_SOCKET_SERVER_URL=https://your-socket-server.onrender.com
```

## Backend: Render

Root directory: `backend`

Build command:

```bash
composer install --no-dev --optimize-autoloader
```

Start command:

```bash
php artisan config:clear && php artisan migrate --force && php artisan serve --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
APP_NAME=ZenGo
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CORS_SUPPORTS_CREDENTIALS=false

DB_CONNECTION=mysql
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_DATABASE=your-aiven-db
DB_USERNAME=your-aiven-user
DB_PASSWORD=your-aiven-password
MYSQL_ATTR_SSL_CA=/etc/secrets/ca.pem
MYSQL_SSL_VERIFY_SERVER_CERT=false

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Generate `APP_KEY` locally with:

```bash
php artisan key:generate --show
```

For Aiven MySQL SSL, add the CA certificate as a Render Secret File and set `MYSQL_ATTR_SSL_CA` to that file path.

## Socket Server: Render

Root directory: `socket-server`

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```env
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```
