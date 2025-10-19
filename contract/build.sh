#!/bin/bash

echo "🔨 Building Definition Contract..."

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 WASM file: target/wasm32-unknown-unknown/release/definition_contract.wasm"
    
    # Run tests
    echo ""
    echo "🧪 Running tests..."
    cargo test
    
    if [ $? -eq 0 ]; then
        echo "✅ All tests passed!"
        echo ""
        echo "🚀 Ready to deploy!"
        echo "Run: stellar contract deploy --wasm target/wasm32-unknown-unknown/release/definition_contract.wasm --source alice --network testnet --alias definition"
    else
        echo "❌ Tests failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi



