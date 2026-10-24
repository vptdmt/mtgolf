#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Server Web Check-in Giải Golf Đại Hội Mường Thanh 2026
Khởi chạy web server phục vụ các thiết bị (Laptop, iPad, iPhone, Android)
qua mạng nội bộ LAN / Wi-Fi tại Sân Golf Tràng An, Ninh Bình.
"""

import http.server
import socketserver
import json
import os
import socket
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    """Lấy địa chỉ IP nội bộ của máy tính để các máy khác cùng mạng Wi-Fi truy cập"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class CheckInRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/golfers':
            json_path = os.path.join(DIRECTORY, 'golfers.json')
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
                return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                # Lưu đồng bộ vào golfers.json
                json_path = os.path.join(DIRECTORY, 'golfers.json')
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                # Đồng thời cập nhật file data.js để chạy offline được luôn
                js_content = 'window.INITIAL_GOLFERS = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
                with open(os.path.join(DIRECTORY, 'data.js'), 'w', encoding='utf-8') as f:
                    f.write(js_content)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok', 'saved': len(data)}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
                return

        super().do_POST()

def main():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    
    print("=" * 65)
    print("  ỨNG DỤNG WEB CHECK-IN GIẢI GOLF ĐẠI HỘI MƯỜNG THANH 2026")
    print("  Sân Golf Tràng An - Ninh Bình • 25.10.2026")
    print("=" * 65)
    print(f"\n[+] Máy tính này truy cập tại:  http://localhost:{PORT}")
    print(f"[+] iPad / Điện thoại truy cập: http://{local_ip}:{PORT}")
    print("\nNhấn Ctrl + C để dừng máy chủ.\n" + "-" * 65)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CheckInRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã tắt máy chủ.")

if __name__ == '__main__':
    main()
