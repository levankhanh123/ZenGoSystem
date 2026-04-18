<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocketRelayService
{
    public function emit(string $event, array $payload = [], array $rooms = []): void
    {
        if (! config('services.socket_relay.enabled')) {
            return;
        }

        $url = config('services.socket_relay.url');
        $token = config('services.socket_relay.token');

        if (! $url || ! $token) {
            return;
        }

        try {
            Http::timeout(2)
                ->withHeaders([
                    'X-Socket-Relay-Token' => $token,
                ])
                ->post($url, [
                    'event' => $event,
                    'payload' => $payload,
                    'rooms' => $rooms,
                ])
                ->throw();
        } catch (\Throwable $exception) {
            Log::warning('Socket relay emit failed.', [
                'event' => $event,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}