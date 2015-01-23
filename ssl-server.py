print("Starting HTTPS server on localhost:8888...")

from SimpleHTTPServer import SimpleHTTPRequestHandler
import BaseHTTPServer
import ssl

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

httpd = BaseHTTPServer.HTTPServer(('localhost', 8888), CORSRequestHandler)

httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./certificate.pem', server_side=True)

print "done."
httpd.serve_forever()