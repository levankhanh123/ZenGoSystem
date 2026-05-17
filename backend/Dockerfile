FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
        default-mysql-client \
    && docker-php-ext-install pdo_mysql mbstring zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .

RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

CMD php artisan config:clear \
    && php artisan migrate --force \
    && php artisan serve --host 0.0.0.0 --port ${PORT:-8000}
