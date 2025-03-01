import http.server
import socketserver
import json

PORT = 8000
class MyHandler(http.server.SimpleHTTPRequestHandler):
  def do_POST(self):
    content_len  = int(self.headers.get("content-length"))
    data = json.loads(self.rfile.read(content_len).decode('utf-8'))
    print(json.dumps(data, indent=2))
  
    self.send_response(200)
    self.send_header('Content-type', 'application/json;charset=utf-8')
    self.end_headers()
    body_json = json.dumps({ 'state' : True }, sort_keys=False, indent=4, ensure_ascii=False) 
    self.wfile.write(body_json.encode("utf-8"))
    self.end_headers()

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
  print("serving at port", PORT)
  httpd.serve_forever()