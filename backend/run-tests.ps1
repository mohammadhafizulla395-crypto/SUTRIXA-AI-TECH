$ErrorActionPreference = "Stop"
$backend = "C:\Users\hafiz\OneDrive\Desktop\Sutrixa Tech Bussiness website\backend"
$serverLog = "C:\Users\hafiz\AppData\Local\Temp\opencode\server.log"

# Start the backend server in a background process
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx tsx src/index.ts > server.log 2>&1" -WorkingDirectory $backend -PassThru -WindowStyle Hidden

# Wait for the server to start
$healthOk = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $healthOk = $true; break }
    } catch {}
}
if (-not $healthOk) {
    Write-Host "SERVER FAILED TO START"
    Write-Host "--- server.log ---"
    if (Test-Path "$backend\server.log") { Get-Content "$backend\server.log" }
    exit 1
}

Write-Host "=== SERVER STARTED ==="
Write-Host ""

try {
    # ===== TEST 1: CR#5 - Health check
    Write-Host "--- TEST 1: Health check ---"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing
    Write-Host "Health: $($r.Content)"
    Write-Host ""

    # ===== TEST 2: CR#5/CR#2 - Public products (should return [])
    Write-Host "--- TEST 2: GET /api/products (public, draft isolation) ---"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/products" -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "Success: $($data.success) | Products returned: $($data.data.Count)"
    if ($data.data.Count -eq 0) { Write-Host "PASS: 0 published products (all 50 are drafts)" } else { Write-Host "FAIL: Expected 0, got $($data.data.Count)" }
    Write-Host ""

    # ===== TEST 3: CR#3 - Admin list without token (should FAIL 401)
    Write-Host "--- TEST 3: GET /api/admin/products WITHOUT token ---"
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products" -UseBasicParsing -TimeoutSec 5
        Write-Host "FAIL: Should have returned 401, got $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "Got status: $status"
        if ($status -eq 401) { Write-Host "PASS: Admin endpoint blocked without token" } else { Write-Host "FAIL: Expected 401" }
    }
    Write-Host ""

    # ===== TEST 4: CR#3 - Create product without token (should FAIL 401)
    Write-Host "--- TEST 4: POST /api/admin/products WITHOUT token ---"
    try {
        $body = '{"title":"Hack","slug":"hack","description":"x","category":"Business"}'
        $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
        Write-Host "FAIL: Should have returned 401, got $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) { Write-Host "PASS: Create blocked without token" } else { Write-Host "FAIL: Expected 401, got $status" }
    }
    Write-Host ""

    # ===== TEST 5: CR#3 - Delete without token (should FAIL 401)
    Write-Host "--- TEST 5: DELETE /api/admin/products/:id WITHOUT token ---"
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products/prod-001" -Method DELETE -UseBasicParsing -TimeoutSec 5
        Write-Host "FAIL: Should have returned 401, got $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) { Write-Host "PASS: Delete blocked without token" } else { Write-Host "FAIL: Expected 401, got $status" }
    }
    Write-Host ""

    # ===== TEST 6: CR#3 - Login with wrong password
    Write-Host "--- TEST 6: Login with WRONG credentials ---"
    try {
        $body = '{"email":"admin@sutrixa.ai","password":"wrongpass"}'
        $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
        Write-Host "FAIL: Should have returned 401, got $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) { Write-Host "PASS: Wrong password rejected" } else { Write-Host "FAIL: Expected 401, got $status" }
    }
    Write-Host ""

    # ===== TEST 7: CR#3 - Login with correct credentials
    Write-Host "--- TEST 7: Login with CORRECT credentials ---"
    $body = '{"email":"admin@sutrixa.ai","password":"admin123"}'
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    $loginData = $r.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "Success: $($loginData.success) | Token received: $(if ($token) {'yes'} else {'no'})"
    if ($token) { Write-Host "PASS: Login works, JWT received" } else { Write-Host "FAIL: No token" }
    Write-Host ""

    # ===== TEST 8: CR#5 - Admin list with token (should return 50)
    Write-Host "--- TEST 8: GET /api/admin/products WITH token ---"
    $headers = @{ Authorization = "Bearer $token" }
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $data = $r.Content | ConvertFrom-Json
    Write-Host "Success: $($data.success) | Admin products: $($data.data.Count)"
    if ($data.data.Count -eq 50) { Write-Host "PASS: Exactly 50 products" } else { Write-Host "FAIL: Expected 50, got $($data.data.Count)" }
    Write-Host ""

    # ===== TEST 9: CR#5 - Status breakdown of 50 products
    Write-Host "--- TEST 9: Product status breakdown ---"
    $draft = @($data.data | Where-Object { $_.status -eq 'draft' }).Count
    $published = @($data.data | Where-Object { $_.status -eq 'published' }).Count
    $archived = @($data.data | Where-Object { $_.status -eq 'archived' }).Count
    Write-Host "Draft: $draft | Published: $published | Archived: $archived"
    if ($draft -eq 50 -and $published -eq 0 -and $archived -eq 0) { Write-Host "PASS: All 50 are drafts" } else { Write-Host "FAIL: Status counts wrong" }
    Write-Host ""

    # ===== TEST 10: CR#4 - Publish a product, verify public API returns it
    Write-Host "--- TEST 10: Publish prod-001, verify public API ---"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products/prod-001/status" -Method PATCH -Headers $headers -Body '{"status":"published"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    $pubData = $r.Content | ConvertFrom-Json
    Write-Host "Publish result: success=$($pubData.success) status=$($pubData.data.status)"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/products" -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "Public products after publish: $($data.data.Count)"
    if ($data.data.Count -eq 1) { Write-Host "PASS: Published product now visible publicly" } else { Write-Host "FAIL: Expected 1, got $($data.data.Count)" }
    Write-Host ""

    # ===== TEST 11: CR#4 - Draft stays hidden. Create a draft, verify not public
    Write-Host "--- TEST 11: Create draft product, verify NOT public ---"
    $createBody = '{"title":"Draft Test","slug":"draft-test-new","description":"A draft product","category":"Business","price":99,"status":"draft"}'
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products" -Method POST -Headers $headers -Body $createBody -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    $createData = $r.Content | ConvertFrom-Json
    $newId = $createData.data.id
    Write-Host "Created draft: id=$newId status=$($createData.data.status)"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/products" -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    if ($data.data.Count -eq 1) { Write-Host "PASS: Draft stays hidden (still only 1 published)" } else { Write-Host "FAIL: Draft leaked, got $($data.data.Count)" }
    Write-Host ""

    # ===== TEST 12: CR#4 - Unpublish prod-001, verify public API hides it
    Write-Host "--- TEST 12: Unpublish prod-001, verify public API ---"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products/prod-001/status" -Method PATCH -Headers $headers -Body '{"status":"draft"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    $unpubData = $r.Content | ConvertFrom-Json
    Write-Host "Unpublish result: success=$($unpubData.success) status=$($unpubData.data.status)"
    $r = Invoke-WebRequest -Uri "http://localhost:4000/api/products" -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    if ($data.data.Count -eq 0) { Write-Host "PASS: Unpublished product hidden from public" } else { Write-Host "FAIL: Expected 0, got $($data.data.Count)" }
    Write-Host ""

    Write-Host "=== ALL TESTS COMPLETE ==="
} finally {
    # Clean up: restore prod-001 to draft (if not already), publish test cleanup
    try {
        $headers = @{ Authorization = "Bearer $token" }
        Invoke-WebRequest -Uri "http://localhost:4000/api/admin/products/prod-001/status" -Method PATCH -Headers $headers -Body '{"status":"draft"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 | Out-Null
    } catch {}
    # Stop the server
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
