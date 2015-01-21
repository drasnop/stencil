print("Starting HTTPS server on localhost:8888...")

import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('localhost', 8888), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./certificate.pem', server_side=True)
print "done."
httpd.serve_forever()