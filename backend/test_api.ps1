$payload = @{
    userId = "user123"
    domain = "youtube.com"
    limitMinutes = 180
    category = "Entertainment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5005/api/wellbeing/limits" -Method Post -ContentType "application/json" -Body $payload
    Write-Output $response
} catch {
    Write-Output "ERROR CAUGHT:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorMsg = $reader.ReadToEnd()
    Write-Output $errorMsg
}
