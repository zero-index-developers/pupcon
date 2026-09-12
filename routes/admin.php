<?php

use App\Http\Controllers\Areas\Forms\AreaFormsController;
use App\Http\Controllers\Content\AboutController;
use App\Http\Controllers\Content\AdministrationController;
use App\Http\Controllers\Content\ContentController;
use App\Http\Controllers\Content\FacilitiesController;
use App\Http\Controllers\Content\FacultyStaffController;
use App\Http\Controllers\Content\HistoryController;
use App\Http\Controllers\Content\LocalTaskForceController;
use App\Http\Controllers\Content\ManageAreasController;
use App\Http\Controllers\Content\OtherServicesController;
use App\Http\Controllers\Content\ProgramContentController;
use App\Http\Controllers\Content\VmgoController;
use App\Http\Controllers\Content\WelcomeController;
use App\Http\Controllers\Documents\DocumentRatingsController;
use App\Http\Controllers\Documents\Requests\DocumentRequestController;
use App\Http\Controllers\Exhibits\ExhibitFilesController;
use App\Http\Controllers\Exhibits\ExhibitOutlinesFileController;
use App\Http\Controllers\Exhibits\ManageExhibitsController;
use App\Http\Controllers\Parameters\AreaParameterController;
use App\Http\Controllers\Parameters\AreaParameterOutlinesController;
use App\Http\Controllers\Parameters\ImportParametersController;
use App\Http\Controllers\Programs\LevelsController;
use App\Http\Controllers\Programs\ManageProgramController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'update.password', 'admin'])->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('users', 'index')->name('users');
        Route::post('users', 'store')->name('users.store');
        Route::patch('users/updatePrivileges', 'updateUserPrivileges')->name('users.update.roles');
        Route::patch('users/disable', 'disable')->name('users.disable');
        Route::patch('users/enable', 'enable')->name('users.enable');
    });

    Route::controller(ManageExhibitsController::class)->group(function () {
        Route::get('manage-exhibits', 'index')->name('manage.exhibits');
        Route::post('exhibits/store', 'store')->name('exhibits.store');
        Route::patch('exhibits/{exhibit_id}/update', 'store')->name('exhibits.update');
        Route::delete('exhibits/{exhibit_id}/delete', 'destroy')->name('exhibits.delete');
    });

    Route::controller(ExhibitOutlinesFileController::class)->group(function () {
        Route::post('exhibit-outline/upload', 'upload')->name('exhibit.outline.file.upload');
        // Route::get('exhibit-outline/{exhibit_file_id}/download', 'download')->name('exhibit.outline.file.download');
        Route::delete('exhibit-outline/{outline_id}/delete', 'destroy')->name('exhibit.outline.file.delete');
    });

    Route::controller(ExhibitFilesController::class)->group(function () {
        Route::post('exhibit-file/upload', '__invoke')->name('exhibit.file.upload');
    });

    Route::get('ratings', [DocumentRatingsController::class, 'index'])->name('ratings');

    Route::get('other-services', [OtherServicesController::class, 'index'])->name('other-services');
    Route::post('other-services/update', [OtherServicesController::class, 'update'])->name('other.services.update');

    Route::controller(ManageProgramController::class)->group(function () {
        Route::post('manage-programs/store', 'store')->name('manage.program.store');
        Route::patch('manage-programs/{program_id}/update', 'update')->name('manage.program.update');
        Route::delete('manage-programs/{program_id}/delete', 'destroy')->name('manage.program.delete');
    });

    Route::post('manage-programs/{program_id}/update_content', ProgramContentController::class)
        ->name('manage.program.update.content');

    Route::controller(LevelsController::class)->group(function () {
        Route::post('manage-programs/{program_id}/levels/store', 'store')->name('manage.level.store');
        Route::patch('manage-programs/{program_id}/levels/update', 'update')->name('manage.level.update');
    });

    Route::controller(ManageAreasController::class)->group(function () {
        Route::post('manage-programs/{program_id}/{level_id}/area/store', 'store')->name('manage.area.store');
        Route::post('manage-programs/{program_id}/{level_id}/area/{area_id}/update', 'update')->name('manage.area.update');
        Route::delete('manage-programs/{program_id}/{level_id}/area/{area_id}/delete', 'destroy')->name('manage.area.delete');
    });

    Route::prefix('manage-programs/{program_id}/{level_id}/{area_id}')->as('manage.area.')->group(function () {
        Route::controller(ImportParametersController::class)->group(function () {
            Route::get('/download_parameter_template', 'download')->name('download.template');
            Route::post('/import_parameters', 'import')->name('import.parameters');
        });

        Route::controller(AreaFormsController::class)->group(function () {
            Route::post('/add_form', 'store')->name('add.area.form');
            Route::delete('/{form_id}/delete_form', 'destroy')->name('delete.area.form');
        });

        Route::controller(AreaParameterController::class)->group(function () {
            Route::post('/store_parameter', 'store')->name('add.parameter');
            Route::patch('/{parameter_id}/update_parameter', 'update')->name('update.parameter');
            Route::delete('/{parameter_id}/delete_parameter', 'destroy')->name('delete.parameter');
        });

        Route::controller(AreaParameterOutlinesController::class)->group(function () {
            Route::post('/store_benchmark', 'store')->name('add.benchmark');
            Route::patch('/{outline_id}/edit_benchmark', 'edit')->name('edit.benchmark');
            Route::delete('/{outline_id}/delete_benchmark', 'destroy')->name('delete.benchmark');
        });
    });

    Route::get('main-content/', ContentController::class)->name('content.main');
    Route::post('main-content/welcome/update', WelcomeController::class)->name('content.welcome.update');
    Route::post('main-content/about/update', AboutController::class)->name('content.about.update');
    Route::post('main-content/vmgo/update', VmgoController::class)->name('content.vmgo.update');
    Route::post('main-content/history/update', HistoryController::class)->name('content.history.update');
    Route::post('main-content/administration/update', AdministrationController::class)->name('content.administration.update');
    Route::post('main-content/facilities/update', FacilitiesController::class)->name('content.facilities.update');
    Route::post('main-content/faculty_staff/update', FacultyStaffController::class)->name('content.faculty_staff.update');
    Route::post('main-content/local_task_force/update', LocalTaskForceController::class)->name('content.local_task_force.update');
});

Route::middleware(['auth', 'verified', 'update.password', 'admin.or.coordinator'])->group(function () {
    Route::controller(DocumentRequestController::class)->prefix('requests')->group(function () {
        Route::post('/approveDocument', 'approve')->name('approveDocument');
        Route::post('/rejectDocument', 'reject')->name('rejectDocument');
        Route::post('/revertDocument', 'revert')->name('revertDocument');
    });
});
