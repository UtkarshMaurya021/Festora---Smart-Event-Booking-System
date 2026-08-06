@echo off
echo ===================================================
echo 🚀 STARTING FESTORA FULL MICROSERVICES ECOSYSTEM
echo ===================================================

echo [1/3] Starting Razorpay Payment Microservice (Port 8081)...
start "Festora Payment Microservice (Port 8081)" cmd /k "cd /d F:\Festora\festora-payment-microservice && .\mvnw.cmd spring-boot:run"

echo [2/3] Starting Main Festora Backend (Port 8080)...
start "Festora Main Backend (Port 8080)" cmd /k "cd /d F:\Festora\Festora-backend && .\mvnw.cmd spring-boot:run"

echo [3/3] Starting React Frontend (Port 5173)...
start "Festora Frontend (Port 5173)" cmd /k "cd /d F:\Festora\festora-frontend && npm run dev"

echo ===================================================
echo ✅ All 3 services are launching in separate windows!
echo Open Frontend in browser: http://localhost:5173
echo ===================================================
