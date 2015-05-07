print("Starting HTTPS server on localhost:8888...")

import http.server, ssl

class CORSRequestHandler (http.server.SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', 'https://www.wunderlist.com')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

server_address = ('localhost', 8888)
httpd = http.server.HTTPServer(server_address, CORSRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='certificate.pem',
                               ssl_version=ssl.PROTOCOL_TLSv1)
print("done.")
httpd.serve_forever()


# class CORSRequestHandler (SimpleHTTPRequestHandler):
#     def end_headers (self):
#         self.send_header('Access-Control-Allow-Origin', '*')
#         SimpleHTTPRequestHandler.end_headers(self)

# httpd = BaseHTTPServer.HTTPServer(('localhost', 8888), CORSRequestHandler)

# httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./certificate.pem', server_side=True)

# print("done.")
# httpd.serve_forever()