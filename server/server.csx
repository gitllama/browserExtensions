#r "System.Net.Http"

using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Drawing;

const string prefixes = "http://localhost:8000/";
static Task task = Task.CompletedTask;

var listener = new HttpListener();
listener.Prefixes.Add(prefixes);
listener.Start();

Console.WriteLine($"Server is running at {prefixes}");
Console.WriteLine("Press Ctrl+C to stop the server.");

while (true) {

  (int, string) postprocess(HttpListenerRequest request) {
    try {
      Console.WriteLine($"StreamReader");
      using (var reader = new StreamReader(request.InputStream, request.ContentEncoding)) {
        var rcd = reader.ReadToEnd();
        Console.WriteLine($"Received data: {rcd}");
        var action = fromYaml(rcd)["action"].Parse<string>();
        var payload = fromYaml(rcd)["payload"];
        var menuItemId = payload["menuItemId"].Parse<string>();
        
        switch(menuItemId) {
          case "link":
            task = Task.Run(() => { dl_streaming(payload["linkUrl"].Parse<string>()); });
            return ((int)HttpStatusCode.OK, $$""" { "action" : "log", "message" : "hoge" } """);
          default:
            Console.WriteLine($"unknown {menuItemId}");
            return ((int)HttpStatusCode.OK, "{}");
        };
      }
    } catch(Exception e) {
      Console.WriteLine($"{e}");
      return ((int)HttpStatusCode.InternalServerError, toJson(new { message = e.Message }));
    }
  }
  
  var context = await listener.GetContextAsync();
  var request = context.Request;
  var response = context.Response;

  var (status , buffer) = (request.HttpMethod, task.IsCompleted) switch {
    ("POST", true) => postprocess(request),
    (_, false) => ((int)HttpStatusCode.MethodNotAllowed, toJson(new { message = "busy" })),
    _ => ((int)HttpStatusCode.MethodNotAllowed, toJson(new { message = "Method Not Allowed" }))
  };

  response.StatusCode = status;
  response.ContentType = "text/plain";
  //response.ContentLength64 = buffer.Length;
  byte[] bytes = Encoding.UTF8.GetBytes(buffer);
  await response.OutputStream.WriteAsync(bytes, 0, bytes.Length);
  response.OutputStream.Close();
}