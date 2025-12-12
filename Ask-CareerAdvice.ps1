$baseUrl = "http://127.0.0.1:8000/api/chat/ask"
$sessionId = "test_session1"

function Send-Message($msg) {
    $body = @{ session_id = $sessionId; message = $msg } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $body -ContentType "application/json"
    return $response
}

# Initial message
$response1 = Send-Message "I am in 10th and I like coding"
Write-Host "`nUser: I am in 10th and I like coding"
Write-Host "Bot Response:"
$response1 | ConvertTo-Json -Depth 5 | Write-Host

# If bot asks stage
if ($response1.type -eq "ask_stage") {
    $response2 = Send-Message "10th"
    Write-Host "`nUser: 10th"
    Write-Host "Bot Response:"
    $response2 | ConvertTo-Json -Depth 5 | Write-Host
}

# If bot gives options, select first automatically
if ($response2.type -eq "options") {
    $firstOptionId = $response2.options[0].id
    $response3 = Send-Message "SELECT:$firstOptionId"
    Write-Host "`nUser: SELECT:$firstOptionId"
    Write-Host "Bot Response (Specialty + Mentors):"
    $response3 | ConvertTo-Json -Depth 5 | Write-Host
}
