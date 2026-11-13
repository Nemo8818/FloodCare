"""FloodCare classroom server. Python 3.10+, standard library only."""
import argparse
import base64
import datetime as dt
import hmac
import ipaddress
import json
import os
from pathlib import Path
import secrets
import socket
import sqlite3
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import webbrowser

ROOT = Path(__file__).resolve().parent
STAGES = ['รับเรื่องแล้ว', 'ขอข้อมูลเพิ่ม', 'นัดตรวจพื้นที่', 'กำลังดำเนินการ', 'ปิดงาน']
STATIC = {'index.html', 'staff.html', 'style.css', 'app.js', 'staff.js', 'i18n.js', 'sw.js'}
MAX_IMAGE = 1024 * 1024
MAX_BODY = 3 * 1024 * 1024


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def validate_record(data):
    if not isinstance(data, dict):
        raise ValueError('Invalid request')
    result = {}
    for key, limit in [('id',80),('type',10),('name',80),('phone',30),('address',1000),('reason',1500)]:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip() or len(value) > limit:
            raise ValueError('Missing or invalid field: ' + key)
        result[key] = value.strip()
    if result['type'] not in ('SOS', 'CLAIM'):
        raise ValueError('Invalid request type')
    if result['type'] == 'SOS':
        try:
            people = int(data.get('people', 0))
        except (TypeError, ValueError):
            raise ValueError('Invalid people count')
        if not 1 <= people <= 999:
            raise ValueError('Invalid people count')
        result['people'] = people
    else:
        result['date'] = dt.date.fromisoformat(str(data.get('date',''))).isoformat()
    for key in ['vulnerable', 'identity', 'home', 'photos']:
        result[key] = bool(data.get(key))
    loc = data.get('location')
    if loc is not None:
        if not isinstance(loc, dict):
            raise ValueError('Invalid coordinates')
        lat, lng, accuracy = float(loc['lat']), float(loc['lng']), float(loc['accuracy'])
        if not (-90 <= lat <= 90 and -180 <= lng <= 180 and 0 <= accuracy <= 100000):
            raise ValueError('Invalid coordinates')
        stamp = dt.datetime.fromisoformat(str(loc['at']).replace('Z','+00:00')).isoformat()
        result['location'] = dict(lat=lat, lng=lng, accuracy=accuracy, at=stamp)
    attachments = data.get('attachments', [])
    if not isinstance(attachments, list) or len(attachments) > 2:
        raise ValueError('Maximum two images')
    result['attachments'] = []
    for item in attachments:
        if not isinstance(item, dict) or not isinstance(item.get('data'), str):
            raise ValueError('Invalid image')
        prefix, encoded = item['data'].split(',',1)
        raw = base64.b64decode(encoded, validate=True)
        mime = {'data:image/jpeg;base64': 'image/jpeg', 'data:image/png;base64': 'image/png', 'data:image/webp;base64': 'image/webp'}.get(prefix)
        valid = (mime == 'image/jpeg' and raw.startswith(b'\xff\xd8\xff')) or (mime == 'image/png' and raw.startswith(b'\x89PNG\r\n\x1a\n')) or (mime == 'image/webp' and raw.startswith(b'RIFF') and raw[8:12] == b'WEBP')
        if not valid or not 0 < len(raw) <= MAX_IMAGE:
            raise ValueError('Only JPEG, PNG, WebP up to 1 MiB each')
        result['attachments'].append({'data': prefix + ',' + base64.b64encode(raw).decode('ascii')})
    return result


class AppServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def server_bind(self):
        if os.name == "nt" and hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()

    def __init__(self, address, database, password):
        self.database = str(database)
        self.password = password.strip()
        self.sessions = {}
        self.attempts = {}
        self.lock = threading.Lock()
        with sqlite3.connect(self.database) as db:
            db.execute('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, owner TEXT NOT NULL, payload TEXT NOT NULL)')
        super().__init__(address, Handler)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        token = self.headers.get('X-Staff-Session', '')
        with self.server.lock:
            expiry = self.server.sessions.get(token, 0)
        return expiry > time.time()

    def valid_origin(self):
        host = self.headers.get('Host', '')
        try:
            hostname = urlsplit('http://' + host).hostname
            local = hostname == 'localhost' or ipaddress.ip_address(hostname).is_private
        except (ValueError, TypeError):
            local = False
        origin = self.headers.get('Origin')
        return local and (not origin or origin in ('http://' + host, 'https://' + host))

    def do_GET(self):
        if not self.valid_origin():
            return self.reply(403, {'error':'Origin not allowed'})
        path = urlsplit(self.path).path
        if path == '/api/requests':
            staff = self.authorized()
            owner = self.headers.get('X-Owner', '')
            if not staff and len(owner) < 32:
                return self.reply(401, {'error':'Authentication required'})
            with sqlite3.connect(self.server.database) as db:
                query = 'SELECT payload FROM requests' if staff else 'SELECT payload FROM requests WHERE owner=?'
                found = db.execute(query, () if staff else (owner,)).fetchall()
            return self.reply(200, {'records':[json.loads(r[0]) for r in found]})
        filename = path.lstrip('/') or 'index.html'
        if filename not in STATIC:
            return self.reply(404, {'error':'Not found'})
        content = (ROOT / filename).read_bytes()
        mime = 'text/html' if filename.endswith('.html') else 'text/css' if filename.endswith('.css') else 'text/javascript'
        self.send_response(200)
        self.send_header('Content-Type', mime + '; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        if not self.valid_origin():
            return self.reply(403, {'error':'Origin not allowed'})
        if self.headers.get('Content-Type','').split(';')[0] != 'application/json':
            return self.reply(415, {'error':'JSON required'})
        try:
            length = int(self.headers.get('Content-Length',0))
            if not 0 < length <= MAX_BODY:
                return self.reply(413, {'error':'Request too large'})
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('Invalid JSON object')
            path = urlsplit(self.path).path
            if path == '/api/login':
                client = self.client_address[0]
                with self.server.lock:
                    tries = [t for t in self.server.attempts.get(client,[]) if t > time.time()-60]
                    if len(tries) >= 10:
                        return self.reply(429, {'error':'Too many attempts. Wait one minute.'})
                    self.server.attempts[client] = tries + [time.time()]
                if not hmac.compare_digest(str(data.get('password','')).strip().encode('utf-8'), self.server.password.encode('utf-8')):
                    return self.reply(401, {'error':'Incorrect staff password'})
                token = secrets.token_urlsafe(32)
                with self.server.lock:
                    self.server.sessions = {k:v for k,v in self.server.sessions.items() if v > time.time()}
                    self.server.sessions[token] = time.time() + 8*3600
                return self.reply(200, {'session':token})
            if path == '/api/logout':
                with self.server.lock:
                    self.server.sessions.pop(self.headers.get('X-Staff-Session',''),None)
                return self.reply(200, {'ok':True})
            if path == '/api/requests':
                owner = self.headers.get('X-Owner','')
                if not 32 <= len(owner) <= 100:
                    return self.reply(401, {'error':'Owner token required'})
                record = validate_record(data)
                record.update(created=now(), status='ถึงเซิร์ฟเวอร์แล้ว — รอเจ้าหน้าที่รับเรื่อง', history=[])
                with sqlite3.connect(self.server.database) as db:
                    old = db.execute('SELECT owner,payload FROM requests WHERE id=?',(record['id'],)).fetchone()
                    if old:
                        if not hmac.compare_digest(old[0],owner):
                            return self.reply(409, {'error':'Request ID conflict'})
                        return self.reply(200, {'record':json.loads(old[1])})
                    db.execute('INSERT INTO requests VALUES (?,?,?)',(record['id'],owner,json.dumps(record,ensure_ascii=False)))
                return self.reply(201, {'record':record})
            if path == '/api/status':
                if not self.authorized():
                    return self.reply(401, {'error':'Staff authentication required'})
                if data.get('status') not in STAGES:
                    raise ValueError('Invalid status')
                with sqlite3.connect(self.server.database) as db:
                    old = db.execute('SELECT payload FROM requests WHERE id=?',(str(data.get('id','')),)).fetchone()
                    if not old:
                        return self.reply(404, {'error':'Request not found'})
                    record = json.loads(old[0]);record['status'] = data['status']
                    record['history'].append({'status':data['status'], 'at':now()})
                    db.execute('UPDATE requests SET payload=? WHERE id=?',(json.dumps(record,ensure_ascii=False),record['id']))
                return self.reply(200, {'record':record})
            return self.reply(404, {'error':'Not found'})
        except (ValueError, TypeError, KeyError, OverflowError):
            self.reply(400, {'error':'Invalid fields or image. Use JPEG, PNG or WebP, max 2 images, 1 MiB each.'})
        except sqlite3.Error:
            self.reply(503, {'error':'Storage unavailable. Retry later.'})


def main():
    parser = argparse.ArgumentParser(description='FloodCare local classroom prototype')
    parser.add_argument('--port', type=int, default=8765, help='Server port (default 8765)')
    parser.add_argument('--lan', action='store_true', help='Allow devices on the same trusted Wi-Fi')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    data_dir = ROOT / 'data';data_dir.mkdir(exist_ok=True)
    password = os.environ.get('FLOODCARE_STAFF_PASSWORD') or secrets.token_urlsafe(9)
    try:
        with AppServer(('0.0.0.0' if args.lan else '127.0.0.1',args.port), data_dir/'floodcare.sqlite3',password) as server:
            print(f'Citizen: http://127.0.0.1:{args.port}')
            print(f'Staff:   http://127.0.0.1:{args.port}/staff.html')
            print('Staff password:',password)
            if args.lan:
                print(f'LAN enabled. On the other device use http://<this-computer-IPv4>:{args.port}/staff.html')
                print('Run ipconfig in another terminal to find the Wi-Fi IPv4. Allow private-network firewall access if prompted.')
            print('Educational prototype only. Keep staff page open for alerts. Ctrl+C to stop.')
            webbrowser.open(f'http://127.0.0.1:{args.port}/staff.html')
            server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    except OSError as error:
        print('Cannot start:',error)


if __name__ == '__main__':
    main()
