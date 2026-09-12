<?php

namespace App\Http\Controllers\Documents\Requests;

use App\Enums\ActivityLogAction;
use App\Http\Controllers\Controller;
use App\Models\AreaFiles;
use App\Models\AreaForms;
use App\Models\ExhibitFiles;
use App\Models\FilesOverview;
use App\Models\FileStatus;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $files = null;
        if ($user->Roles->role_name === 'Admin' || $user->Roles->role_name === 'Coordinator') {
            $files = FilesOverview::select('*')->get();
        } else {
            $name = $user->first_name.' '.$user->last_name;
            $files = FilesOverview::where('uploaded_by', 'ILIKE', $name)->get();
        }
        $files->map(function ($file) {
            if ($file->file_path && $file->file_name) {
                $file->file_path = Storage::url(Crypt::decryptString($file->file_path));
                $file->file_name = Crypt::decryptString($file->file_name);

                return $file;
            }

            return $file;
        });

        return inertia('admin/document/document-request', [
            'files' => $files,
        ]);
    }

    /**
     * Approve the specified resource in storage.
     */
    public function approve(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'array'],
            'file.*.file_id' => ['required', 'integer'],
            'file.*.file_type' => ['required', 'string'],
        ]);

        $this->updateFileStatus($validated['file'], 'Approved', ActivityLogAction::Approve);

        return redirect()->back()
            ->with('type', 'success')
            ->with('title', 'Success')
            ->with('message', 'File/s Approved Successfully');
    }

    /**
     * Reject the specified resource in storage.
     */
    public function reject(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'array'],
            'file.*.file_id' => ['required', 'integer'],
            'file.*.file_type' => ['required', 'string'],
            'file.*.rejection_reason' => ['required', 'string'],
        ]);

        foreach ($validated['file'] as $fileData) {
            $this->updateFileStatus(
                [$fileData],
                'Rejected',
                ActivityLogAction::Reject,
                $fileData['rejection_reason']
            );
        }

        return redirect()->back()
            ->with('type', 'success')
            ->with('title', 'Success')
            ->with('message', 'File/s Rejected Successfully');
    }

    /**
     * Revert the specified resource in storage.
     */
    public function revert(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'array'],
            'file.*.file_id' => ['required', 'integer'],
            'file.*.file_type' => ['required', 'string'],
        ]);

        $this->updateFileStatus($validated['file'], 'Pending', ActivityLogAction::Revert);

        return redirect()->back()
            ->with('type', 'success')
            ->with('title', 'Success')
            ->with('message', 'File/s Reverted Successfully');
    }

    private function resolveFileModel(string $fileType, int $fileId): AreaFiles|AreaForms|ExhibitFiles|null
    {
        $normalizedType = Str::lower($fileType);

        return match (true) {
            $normalizedType === 'exhibits' => ExhibitFiles::findOrFail($fileId),
            Str::contains($normalizedType, 'area-forms') => AreaForms::findOrFail($fileId),
            Str::contains($normalizedType, 'area') => AreaFiles::findOrFail($fileId),
            default => null,
        };
    }

    /**
     * @param  array<int,mixed>  $files
     */
    private function updateFileStatus(
        array $files,
        string $status_name,
        ActivityLogAction $activity,
        ?string $rejectionReason = null
    ): void {
        $status_id = FileStatus::where('status_name', $status_name)->first()->file_status_id;
        $user = Auth::user();

        foreach ($files as $fileData) {
            $file = $this->resolveFileModel($fileData['file_type'], $fileData['file_id']);

            if (! $file) {
                continue;
            }

            $file->file_status_id = $status_id;
            $file->file_rejection_reason = $rejectionReason ?? '';
            $file->save();

            ActivityLogService::fileManagementLog(
                activity: $activity,
                description: "{$activity->value} file: {$file->file_name}",
                userId: $user->user_id
            );
        }
    }
}
