# PowerShell build script for Windows

Write-Host "🔨 Building Definition Contract..." -ForegroundColor Cyan

# Build the contract
cargo build --target wasm32-unknown-unknown --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📦 WASM file: target/wasm32-unknown-unknown/release/definition_contract.wasm" -ForegroundColor Yellow
    
    # Run tests
    Write-Host ""
    Write-Host "🧪 Running tests..." -ForegroundColor Cyan
    cargo test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
        Write-Host "Run: stellar contract deploy ``" -ForegroundColor Yellow
        Write-Host "  --wasm target/wasm32-unknown-unknown/release/definition_contract.wasm ``" -ForegroundColor Yellow
        Write-Host "  --source alice ``" -ForegroundColor Yellow
        Write-Host "  --network testnet ``" -ForegroundColor Yellow
        Write-Host "  --alias definition" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Tests failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}



