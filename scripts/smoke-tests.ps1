# FixItNow automated smoke tests (local)
# Usage: From project root, run:
#   powershell -ExecutionPolicy Bypass -File .\scripts\smoke-tests.ps1

$ErrorActionPreference = 'Stop'

function Section($t) { Write-Host "`n=== $t ===" }

$base = 'http://localhost:5000'
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$custEmail = "cust_$stamp@example.com"
$techEmail = "tech_$stamp@example.com"
$adminEmail = "admin_$stamp@example.com"

Write-Host "Using emails:" -ForegroundColor Cyan
Write-Host "  customer: $custEmail"
Write-Host "  technician: $techEmail"
Write-Host "  admin: $adminEmail"

# 1) Signup
Section 'SIGNUP USERS'
$r1 = $null; $r2 = $null; $r3 = $null
try { $r1 = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/signup') -Body (@{ name='QA Customer'; email=$custEmail; password='Test1234!'; role='user' } | ConvertTo-Json) -ContentType 'application/json' } catch { $r1 = $_.Exception.Message }
try { $r2 = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/signup') -Body (@{ name='QA Tech'; email=$techEmail; password='Test1234!'; role='tech' } | ConvertTo-Json) -ContentType 'application/json' } catch { $r2 = $_.Exception.Message }
try { $r3 = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/signup') -Body (@{ name='QA Admin'; email=$adminEmail; password='Test1234!'; role='admin' } | ConvertTo-Json) -ContentType 'application/json' } catch { $r3 = $_.Exception.Message }

@{ user=$r1; tech=$r2; admin=$r3 } | ConvertTo-Json -Depth 6 | Write-Host

# 2) Login
Section 'LOGIN USERS'
$lu = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/login') -Body (@{ email=$custEmail; password='Test1234!'; role='user' } | ConvertTo-Json) -ContentType 'application/json'
$lt = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/login') -Body (@{ email=$techEmail; password='Test1234!'; role='tech' } | ConvertTo-Json) -ContentType 'application/json'
$la = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/login') -Body (@{ email=$adminEmail; password='Test1234!'; role='admin' } | ConvertTo-Json) -ContentType 'application/json'

@{ user=$lu.success; tech=$lt.success; admin=$la.success } | ConvertTo-Json | Write-Host

$userToken = $lu.token
$techToken = $lt.token
$adminToken = $la.token

if (-not $userToken -or -not $techToken -or -not $adminToken) {
  throw 'One or more tokens missing from login responses.'
}

# 2b) Seed a technician profile for the generated tech email (admin utility)
Section 'SEED TECHNICIAN PROFILE'
try {
  $hAdmin = @{ Authorization = ('Bearer ' + $adminToken) }
  $seed = Invoke-RestMethod -Method Post -Headers $hAdmin -Uri ($base + '/api/technicians/seed') -Body (@{ email=$techEmail; lat=19.07; lng=72.87 } | ConvertTo-Json) -ContentType 'application/json'
  $seed | ConvertTo-Json -Depth 6 | Write-Host
} catch { Write-Host ('error=' + $_.Exception.Message) }

# 3) Nearby technicians
Section 'NEARBY TECHS'
try {
  $near = Invoke-RestMethod -Method Get -Uri ($base + '/api/tech/nearby?lat=19.07&lng=72.87&radius=20000&minRating=0')
  Write-Host ('count=' + (($near.technicians | Measure-Object).Count))
} catch { Write-Host ('error=' + $_.Exception.Message) }

# 4) Tech toggle active
Section 'TECH TOGGLE ACTIVE'
try {
  $hTech = @{ Authorization = ('Bearer ' + $techToken) }
  $on  = Invoke-RestMethod -Method Post -Headers $hTech -Uri ($base + '/api/tech/active') -Body (@{ active=$true }  | ConvertTo-Json) -ContentType 'application/json'
  $off = Invoke-RestMethod -Method Post -Headers $hTech -Uri ($base + '/api/tech/active') -Body (@{ active=$false } | ConvertTo-Json) -ContentType 'application/json'
  @{ on=$on; off=$off } | ConvertTo-Json -Depth 6 | Write-Host
} catch { Write-Host ('error=' + $_.Exception.Message) }

# 5) Admin lists
Section 'ADMIN LISTS'
try {
  $hAdmin = @{ Authorization = ('Bearer ' + $adminToken) }
  $cust = Invoke-RestMethod -Method Get -Headers $hAdmin -Uri ($base + '/api/customers?page=1&limit=5')
  $tecl = Invoke-RestMethod -Method Get -Headers $hAdmin -Uri ($base + '/api/technicians?page=1&limit=5')
  $book = Invoke-RestMethod -Method Get -Headers $hAdmin -Uri ($base + '/api/bookings?page=1&limit=5')
  Write-Host ("customers_count=$($cust.total) technicians_count=$($tecl.total) bookings_count=$($book.total)")
} catch { Write-Host ('error=' + $_.Exception.Message) }

# 6) Password reset request
Section 'PASSWORD RESET REQUEST'
try {
  $pr = Invoke-RestMethod -Method Post -Uri ($base + '/api/auth/request-password-reset') -Body (@{ email=$custEmail } | ConvertTo-Json) -ContentType 'application/json'
  $pr | ConvertTo-Json -Depth 6 | Write-Host
} catch { Write-Host ('error=' + $_.Exception.Message) }

Write-Host "`nSmoke tests completed." -ForegroundColor Green
