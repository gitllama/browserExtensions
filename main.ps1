
Function DoPost($request, $response){
  try {
    # リクエストボディの読み込み
    $bodyStream = $request.InputStream
    $reader = New-Object IO.StreamReader($bodyStream, [System.Text.Encoding]::UTF8)
    $body = $reader.ReadToEnd()
    $reader.Close()

    # $jsonData = $body | ConvertFrom-Json
    # switch ($jsonData.kind) {
    #   "page" {
    #     break
    #   }
    #   "link" {
    #     break
    #   }
    #   default {
    #     Write-Host "Unknown kind: $($jsonData.kind)"
    #   }
    # }
    $pythonOutput = & python ../local_scripts/generater.py $body | ConvertFrom-Json
    Write-Host "pythonOutput: $($pythonOutput)"
    Invoke-Expression $pythonOutput.command

    # レスポンスの設定
    $response.StatusCode = 200
    $response.ContentType = "text/plain"
    $content = [System.Text.Encoding]::UTF8.GetBytes("Request received successfully!")
    $response.OutputStream.Write($content, 0, $content.Length)
  } catch {
    Write-Error $_.Exception.Message
    $response.StatusCode = 500
    $errorContent = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
    $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
  }
}

Function RunServer($prefixes){
  $listener = New-Object Net.HttpListener
  $listener.Prefixes.Add($prefixes)
  try {
    $listener.Start()
    Write-Host "Server is running on $prefixes"
    while ($true) {
      $context = $listener.GetContext()
      $request = $context.Request
      $response = $context.Response
      if ($request.HttpMethod -eq "POST") {
        DoPost $request $response
      } else {
        # POST以外のリクエストに対する応答
        $response.StatusCode = 405
        $content = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
        $response.OutputStream.Write($content, 0, $content.Length)
      }
      $response.Close()
    }
  } catch {
    Write-Error $_.Exception.Message
  } finally {
    $listener.Stop()
    Write-Host "Server stopped."
  }
}

RunServer "http://localhost:8000/"
