# server

拡張機能からのpostを受けて何かするサンプル

- server_rs : rust製、コマンドラインに投げるところまで
- server.py : python製
- server.ps1 : powershell scripts
- server.csx : C#製

## Usage (server_rs)

```bash
# echoコマンド
curl -X POST -H "Content-Type: application/json" -d '{"program" : "cmd", "args" : ["/C", "echo", "hoge"] }'  http://127.0.0.1:8000/api
# 戻り値
# {"is_busy":false,"data":null}
curl -X POST -H "Content-Type: application/json" -d '{"program" : "powershell", "args" : ["-Command", "ls", "|", "ConvertTo-Json" ] }'  http://localhost:8000/api

# yt-dlpで動画ファイルのformats取得
curl -X POST -H "Content-Type: application/json" -d '{"program" : "yt-dlp", "args" : ["https://www.youtube.com/watch?v=***", "--list-formats"] }'  http://127.0.0.1:8000/api
curl -X POST -H "Content-Type: application/json" -d '{"program" : "yt-dlp", "args" : ["https://www.youtube.com/watch?v=***", "--list-formats"], "option" : true }' http://127.0.0.1:8000/api
```