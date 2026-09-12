<?php

use App\Http\Middleware\AccreditorPrivileges;
use App\Http\Middleware\AccreditorRestriction;
use App\Http\Middleware\Admin as AdminPrivileges;
use App\Http\Middleware\AdminOrCoordinator;
use App\Http\Middleware\EnsureAccreditationLevelExists;
use App\Http\Middleware\EnsureMustUpdatePassword;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\MustUpdatePassword;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\UserAreaPrivileges;
use App\Http\Middleware\UserProgramPrivileges;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',  // ← Add this line
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // SecurityHeaders::class,
        ]);
        /* $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]); */

        $middleware->alias([
            'admin' => AdminPrivileges::class,
            'admin.or.coordinator' => AdminOrCoordinator::class,
            'user.accreditor.restriction' => AccreditorRestriction::class,
            'user.program.role' => UserProgramPrivileges::class,
            'program.level.exists' => EnsureAccreditationLevelExists::class,
            'user.area.role' => UserAreaPrivileges::class,
            'accreditor' => AccreditorPrivileges::class,
            'update.password' => MustUpdatePassword::class,
            'ensure.update.password' => EnsureMustUpdatePassword::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
