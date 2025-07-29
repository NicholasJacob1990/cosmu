#!/bin/bash
cd "/Users/nicholasjacob/Downloads/GalaxIA  "

echo "🚀 Testing server startup..."

# Start server in background
npm run dev:server &
SERVER_PID=$!

# Wait a bit for startup
sleep 5

# Test if server is responding
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Server is running and healthy!"
    
    # Test subscription endpoint
    if curl -s http://localhost:3001/api/subscriptions/plans > /dev/null; then
        echo "✅ Subscription API is accessible!"
    else
        echo "❌ Subscription API not accessible"
    fi
else
    echo "❌ Server health check failed"
fi

# Stop server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "🏁 Server test completed"