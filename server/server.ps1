<#
標準出力を色付き文字として表示しながらシリアライズ
Args:
  args (str) : url
Returns:
  str or None: Return value
#>
Function CallProcess($command) {
  $output = ""
  Write-Host "--------invoke : $command--------" -ForegroundColor Blue
  & Invoke-Expression $command | ForEach-Object {
    $output += $_ + "`n"
    Write-Host $_ -ForegroundColor Blue
  }
  return ConvertFrom-Yaml $output
}

Function DoPost($request, $response){
  try {
    # リクエストボディの読み込み
    $bodyStream = $request.InputStream
    $reader = New-Object IO.StreamReader($bodyStream, [System.Text.Encoding]::UTF8)
    $body = $reader.ReadToEnd()
    $reader.Close()

    # & python ../local_scripts/generater.py
    $command = "python ../local_scripts/generater.py $body"
    $output = CallProcess $command
    Invoke-Expression $outputObj.command

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
  $stopServer = $false  # サーバー停止用のフラグ
  try {
    $listener.Start()
    Write-Host "Server is running on $prefixes"

    while (-not $stopServer) {

      $context = $listener.GetContext()
      $request = $context.Request
      $response = $context.Response
      switch ($request.HttpMethod) { # if ($request.HttpMethod -eq "POST") {}
        "POST" {
          DoPost $request $response
          break
        }
        default {
          # POST以外のリクエストに対する応答
          $response.StatusCode = 405
          $content = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
          $response.OutputStream.Write($content, 0, $content.Length)
        }
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
