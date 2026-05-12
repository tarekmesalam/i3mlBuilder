<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Data migration: free up subdomains and custom domains on already
 * soft-deleted projects so they don't keep blocking other users from
 * claiming those identifiers. Going forward, ProjectObserver::deleting()
 * handles this automatically.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            return;
        }

        // Only touch trashed rows so live projects are never affected.
        DB::table('projects')
            ->whereNotNull('deleted_at')
            ->where(function ($query) {
                $query->whereNotNull('subdomain')
                    ->orWhereNotNull('custom_domain');
            })
            ->update([
                'subdomain' => null,
                'custom_domain' => null,
                'custom_domain_verified' => false,
                'custom_domain_ssl_status' => null,
                'custom_domain_verified_at' => null,
            ]);
    }

    public function down(): void
    {
        // Data migration — nothing to reverse.
    }
};
