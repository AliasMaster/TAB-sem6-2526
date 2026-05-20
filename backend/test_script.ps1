$ErrorActionPreference = "Stop"

Write-Host "Setting up ffmpeg path..."
$ffmpegDir = (Get-ChildItem -Path "ffmpeg2\*" -Directory).FullName + "\bin"
$env:Path += ";$ffmpegDir"

Write-Host "Starting FileStorage service..."
$proc = Start-Process -FilePath "dotnet" -ArgumentList "run --no-launch-profile --project src\Services\FileStorage\FileStorageService.csproj --urls http://localhost:5005" -RedirectStandardOutput "server_out.log" -RedirectStandardError "server_err.log" -PassThru -NoNewWindow

Start-Sleep -Seconds 10

Write-Host "Testing File Upload..."
$response = curl.exe -s -X POST http://localhost:5005/upload `
    -H "X-User-Role: Admin" `
    -F "file=@dummy.mp4"

Write-Host "Upload response:`n$response"

if ($response -match '"jobId":"([^"]+)"' -or $response -match '"JobId":"([^"]+)"') {
    $jobId = $matches[1]
    Write-Host "Job ID: $jobId"
    
    $completed = $false
    for ($i = 0; $i -lt 30; $i++) {
        $statusResp = curl.exe -s http://localhost:5005/status/$jobId
        Write-Host "Status: $statusResp"
        if ($statusResp -match '"status":"Completed"' -or $statusResp -match '"Status":"Completed"') {
            $completed = $true
            break
        }
        if ($statusResp -match '"status":"Failed"' -or $statusResp -match '"Status":"Failed"') {
            break
        }
        Start-Sleep -Seconds 2
    }
    
    if ($completed) {
        Write-Host "FFmpeg conversion completed successfully."
        $m3u8Resp = curl.exe -s -o test_playlist.m3u8 http://localhost:5005/files/$jobId/index.m3u8 -w "%{http_code}"
        Write-Host "M3U8 download status: $m3u8Resp"
    } else {
        Write-Host "FFmpeg conversion did not complete."
    }
} else {
    Write-Host "Failed to extract Job ID."
}

Write-Host "Stopping service..."
Stop-Process -Id $proc.Id -Force
