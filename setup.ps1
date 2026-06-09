# JEE AI Platform - Full Setup Script
# Run: powershell -ExecutionPolicy Bypass -File setup.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Log  { param($msg) Write-Host "`n[INFO] $msg" -ForegroundColor Cyan }
function Ok   { param($msg) Write-Host "[OK]   $msg" -ForegroundColor Green }
function Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red; exit 1 }

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
Log "Working directory: $projectRoot"

# ----------------------------------------------------------
# STEP 1: Patch package.json - remove @radix-ui/react-badge
# ----------------------------------------------------------
Log "Step 1/6 - Patching frontend/package.json"

$pkgPath = Join-Path $projectRoot "frontend\package.json"
if (-not (Test-Path $pkgPath)) { $pkgPath = Join-Path $projectRoot "package.json" }

if (Test-Path $pkgPath) {
    $raw = [System.IO.File]::ReadAllText($pkgPath)
    if ($raw -match "radix-ui/react-badge") {
        $lines = Get-Content $pkgPath
        $filtered = $lines | Where-Object { $_ -notmatch "radix-ui/react-badge" }
        [System.IO.File]::WriteAllText($pkgPath, ($filtered -join "`n"), [System.Text.UTF8Encoding]::new($false))
        Ok "Removed @radix-ui/react-badge from $pkgPath"
    } else {
        Ok "package.json already clean"
    }
} else {
    Warn "package.json not found. Skipping."
}

# ----------------------------------------------------------
# STEP 2: Create local Badge shim + fix imports
# ----------------------------------------------------------
Log "Step 2/6 - Creating local Badge component shim"

$badgeShim = @'
import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const styles: Record<string, string> = {
  default:     "bg-primary text-primary-foreground",
  secondary:   "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline:     "border border-input text-foreground",
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  return <span className={`${base} ${styles[variant]} ${className}`} {...props} />
}
'@

foreach ($rel in @("frontend\src\components\ui", "src\components\ui")) {
    $dir = Join-Path $projectRoot $rel
    if (Test-Path $dir) {
        $badgeFile = Join-Path $dir "badge.tsx"
        if (-not (Test-Path $badgeFile)) {
            [System.IO.File]::WriteAllText($badgeFile, $badgeShim, [System.Text.UTF8Encoding]::new($false))
            Ok "Created badge shim at $badgeFile"
        } else {
            Ok "badge.tsx already exists - skipping"
        }
        break
    }
}

foreach ($rel in @("frontend\src", "src")) {
    $dir = Join-Path $projectRoot $rel
    if (-not (Test-Path $dir)) { continue }
    $files = Get-ChildItem $dir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
    foreach ($f in $files) {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        if ($content -match "radix-ui/react-badge") {
            $patched = $content -replace '(?m)^.*radix-ui/react-badge.*$', '// Badge: using local components/ui/badge.tsx shim'
            [System.IO.File]::WriteAllText($f.FullName, $patched, [System.Text.UTF8Encoding]::new($false))
            Ok "Patched badge import in: $($f.Name)"
        }
    }
}

# ----------------------------------------------------------
# STEP 3: Fix apiClient named -> default import
#   @/lib/api exports apiClient as DEFAULT, not named.
#   Fix:  import { apiClient } from '@/lib/api'
#   ->    import apiClient from '@/lib/api'
# ----------------------------------------------------------
Log "Step 3/6 - Fixing apiClient import style (named -> default)"

foreach ($rel in @("frontend\src", "src")) {
    $dir = Join-Path $projectRoot $rel
    if (-not (Test-Path $dir)) { continue }
    $files = Get-ChildItem $dir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
    foreach ($f in $files) {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        # Match: import { apiClient } from '@/lib/api'  or  "@/lib/api"
        # Also handles: import { apiClient, somethingElse } from '@/lib/api'
        # For mixed named+default we split them
        if ($content -match "import \{ apiClient") {
            # Case 1: apiClient is the only import  ->  import apiClient from '...'
            $p = $content -replace "import \{ apiClient \} from (['""])@/lib/api\1", "import apiClient from `$1@/lib/api`$1"
            # Case 2: apiClient mixed with other named exports
            # e.g. import { apiClient, foo } from '@/lib/api'
            # -> import apiClient from '@/lib/api'; import type { foo } from '@/lib/api'
            $p = $p -replace "import \{ apiClient, ([^}]+) \} from (['""])@/lib/api\2", "import apiClient from `$2@/lib/api`$2`nimport { `$1 } from `$2@/lib/api`$2"
            $p = $p -replace "import \{ ([^}]+), apiClient \} from (['""])@/lib/api\2", "import apiClient from `$2@/lib/api`$2`nimport { `$1 } from `$2@/lib/api`$2"
            if ($p -ne $content) {
                [System.IO.File]::WriteAllText($f.FullName, $p, [System.Text.UTF8Encoding]::new($false))
                Ok "Fixed apiClient import in: $($f.Name)"
            }
        }
    }
}

# ----------------------------------------------------------
# STEP 4: Rename next.config.ts -> next.config.mjs
# ----------------------------------------------------------
Log "Step 4/6 - Checking next.config.ts"

foreach ($rel in @("frontend\next.config.ts", "next.config.ts")) {
    $tsPath = Join-Path $projectRoot $rel
    if (-not (Test-Path $tsPath)) { continue }
    $mjsPath = $tsPath -replace "\.ts$", ".mjs"
    $tsContent = [System.IO.File]::ReadAllText($tsPath)
    $mjsContent = $tsContent -replace '(?m)^import type.*$', ''
    $mjsContent = $mjsContent -replace ':\s*NextConfig', ''
    [System.IO.File]::WriteAllText($mjsPath, $mjsContent, [System.Text.UTF8Encoding]::new($false))
    Remove-Item $tsPath
    Ok "Renamed $rel -> next.config.mjs"
    break
}

# ----------------------------------------------------------
# STEP 5: Install Python local virtual environment dependencies
# ----------------------------------------------------------
Log "Step 5/6 - Installing Python dependencies in backend/.venv"
$venvPython = Join-Path $projectRoot "backend\.venv\Scripts\python.exe"
$venvPip = Join-Path $projectRoot "backend\.venv\Scripts\pip.exe"
$reqPath = Join-Path $projectRoot "backend\requirements.txt"

if (-not (Test-Path $venvPython)) {
    Log "Creating virtual environment at backend/.venv..."
    & python -m venv backend\.venv
    if ($LASTEXITCODE -ne 0) { Fail "Failed to create python virtual environment." }
}

Log "Upgrading pip and installing requirements..."
& $venvPip install --upgrade pip
& $venvPip install -r $reqPath
if ($LASTEXITCODE -ne 0) { Fail "pip install requirements failed." }
Ok "Python requirements installed successfully."

# ----------------------------------------------------------
# STEP 6: Local setup: database migrations, seed, RAG indexing, Ollama pull
# ----------------------------------------------------------
Log "Step 6/6 - Initializing local databases, seeding, and Ollama configuration"

# 1. Run migrations
Log "Running local database migrations (Alembic)..."
Set-Location (Join-Path $projectRoot "backend")
& .venv\Scripts\alembic upgrade head
if ($LASTEXITCODE -ne 0) { Fail "Alembic migrations failed." }
Ok "Local SQLite database migrations applied."

# 2. Seed database
Log "Seeding local database..."
& .venv\Scripts\python.exe scripts/seed_db.py
Ok "Database seeding complete."

# 3. Pull Ollama model
Log "Pulling Ollama models locally..."
$ollamaUrl = "http://127.0.0.1:11434"
try {
    $resp = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get -ErrorAction Stop
    $models = $resp.models | ForEach-Object { $_.name }
    
    foreach ($m in @("tim-tutor", "qwen2.5:0.5b", "nomic-embed-text")) {
        $mLatest = "$m:latest"
        if ($models -contains $m -or $models -contains $mLatest) {
            Ok "Model '$m' is already available locally in Ollama."
        } else {
            Log "Model '$m' not found. Pulling model '$m' locally via Ollama..."
            & ollama pull $m
            if ($LASTEXITCODE -ne 0) { Warn "Failed to pull model '$m' via Ollama command. Please make sure Ollama is running." }
            else { Ok "Model '$m' pulled successfully." }
        }
    }
} catch {
    Warn "Could not reach native Ollama on $ollamaUrl. Please verify Ollama is installed and running."
}

# 4. Populate RAG PDFs
Log "Generating study notes and indexing local file-based Qdrant RAG..."
& .venv\Scripts\python.exe ..\scripts\populate_rag_pdfs.py
if ($LASTEXITCODE -ne 0) { Warn "Local RAG population had errors." }
else { Ok "Local RAG database populated." }

# 5. Frontend node modules
Log "Installing frontend Node dependencies..."
Set-Location (Join-Path $projectRoot "frontend")
& npm install
if ($LASTEXITCODE -ne 0) { Fail "Frontend npm install failed." }
Ok "Frontend dependencies installed."

Set-Location $projectRoot
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Native local setup complete!" -ForegroundColor Green
Write-Host "  You can now run the servers in VS Code using tasks" -ForegroundColor Green
Write-Host "  or run these terminal commands:" -ForegroundColor Green
Write-Host "    Backend (FastAPI):" -ForegroundColor Green
Write-Host "      cd backend" -ForegroundColor White
Write-Host "      .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload" -ForegroundColor White
Write-Host "    Frontend (Next.js):" -ForegroundColor Green
Write-Host "      cd frontend" -ForegroundColor White
Write-Host "      npm run dev" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green