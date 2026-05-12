<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('project_shares')) {
            Schema::create('project_shares', function (Blueprint $table) {
                $table->id();
                // Explicit unsigned BIGINT to guarantee type match with projects.id / users.id
                $table->unsignedBigInteger('project_id');
                $table->unsignedBigInteger('user_id');
                $table->enum('permission', ['view', 'edit', 'admin'])->default('view');
                $table->timestamps();

                $table->unique(['project_id', 'user_id']);

                $table->foreign('project_id')
                    ->references('id')->on('projects')
                    ->onDelete('cascade');
                $table->foreign('user_id')
                    ->references('id')->on('users')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_shares');
    }
};
