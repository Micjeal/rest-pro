# PowerShell script to create admin user
Write-Host "Creating admin user..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/create-admin" -Method POST -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Response: $($data.message)"
    if ($data.user) {
        Write-Host "User created: $($data.user.email) - $($data.user.name)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "Done. Press Enter to exit..."
Read-Host
