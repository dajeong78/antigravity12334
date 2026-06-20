# 대학 전공 추천 서비스 - 로컬 실행 서버 (run-server.ps1)
# Node.js나 Python 설치 없이 Windows PowerShell로 로컬 웹 서버를 구동합니다.

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " 대학 전공 추천 서비스 로컬 서버 구동 시작" -ForegroundColor Cyan
Write-Host " 서버 주소: http://localhost:$port/" -ForegroundColor Green
Write-Host " 종료하려면 이 창에서 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan

try {
    $listener.Start()
    # 기본 브라우저로 접속
    Start-Process "http://localhost:$port/"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }
        
        # 파일 경로 계산
        $filePath = Join-Path (Get-Location) $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # MIME 타입 설정 (CORS 이슈 및 JS 모듈 해석 방지)
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            
            # CORS 헤더 추가
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # 404 에러 반환
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>파일을 찾을 수 없습니다: $path</p>")
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        
        $response.OutputStream.Close()
    }
}
catch {
    Write-Host "서버 구동 오류: $_" -ForegroundColor Red
}
finally {
    $listener.Close()
    Write-Host "서버가 종료되었습니다." -ForegroundColor Yellow
}
