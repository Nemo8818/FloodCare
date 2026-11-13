"""Integration tests. Run python -m unittest -v test_server.py"""
import base64
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
import json
from run import AppServer


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name)/'test.sqlite3'
        self.server = AppServer(('127.0.0.1',0),self.db,'staff-test-password')
        self.thread = threading.Thread(target=self.server.serve_forever,daemon=True)
        self.thread.start()
        self.base = 'http://127.0.0.1:'+str(self.server.server_port)
        self.owner = 'owner-token-aaaaaaaaaaaaaaaaaaaaaaaa'
        self.other = 'owner-token-bbbbbbbbbbbbbbbbbbbbbbbb'

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        self.temp.cleanup()

    def call(self,path,data=None,headers=None):
        h={'Content-Type':'application/json',**(headers or {})}
        req=Request(self.base+path,data=json.dumps(data).encode() if data is not None else None,headers=h)
        try:
            with urlopen(req,timeout=5) as r:return r.status,json.loads(r.read())
        except HTTPError as e:return e.code,json.loads(e.read())

    def payload(self):
        return dict(id='SOS-test',type='SOS',name='Demo',phone='0000000000',address='Fictional',reason='Flood',people=3,vulnerable=True,attachments=[])

    def login(self):
        status,data=self.call('/api/login',{'password':'staff-test-password'})
        self.assertEqual(status,200)
        return {'X-Staff-Session':data['session']}

    def test_roles_images_round_trip_and_persistence(self):
        image='data:image/png;base64,'+base64.b64encode(bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082')).decode()
        payload=self.payload();payload['attachments']=[{'data':image}]
        code,data=self.call('/api/requests',payload,{'X-Owner':self.owner})
        self.assertEqual(code,201);self.assertIn('รอเจ้าหน้าที่',data['record']['status'])
        self.assertEqual(self.call('/api/requests')[0],401)
        self.assertEqual(self.call('/api/requests',headers={'X-Owner':self.other})[1]['records'],[])
        self.assertEqual(self.call('/api/status',{'id':'SOS-test','status':'รับเรื่องแล้ว'},{'X-Owner':self.owner})[0],401)
        self.assertEqual(self.call('/api/login',{'password':'wrong'})[0],401)
        staff=self.login()
        records=self.call('/api/requests',headers=staff)[1]['records']
        self.assertEqual(len(records),1);self.assertEqual(records[0]['attachments'][0]['data'],image)
        code,data=self.call('/api/status',{'id':'SOS-test','status':'รับเรื่องแล้ว'},staff)
        self.assertEqual(code,200);self.assertEqual(len(data['record']['history']),1)
        self.assertEqual(self.call('/api/requests',headers={'X-Owner':self.owner})[1]['records'][0]['status'],'รับเรื่องแล้ว')
        # Retry never duplicates a request or resets staff status.
        code,data=self.call('/api/requests',payload,{'X-Owner':self.owner})
        self.assertEqual(code,200);self.assertEqual(data['record']['status'],'รับเรื่องแล้ว')
        self.assertEqual(self.call('/api/requests',payload,{'X-Owner':self.other})[0],409)
        other=AppServer(('127.0.0.1',0),self.db,'new-password')
        import sqlite3
        with sqlite3.connect(other.database) as db:self.assertEqual(db.execute('SELECT count(*) FROM requests').fetchone()[0],1)
        other.server_close()
        self.call('/api/logout',{},staff)
        self.assertEqual(self.call('/api/requests',headers=staff)[0],401)

    def test_requested_password_with_browser_origin(self):
        self.server.password = 'FCSFight'
        code,data=self.call('/api/login',{'password':' FCSFight '},{'Origin':self.base,'X-Staff-Session':''})
        self.assertEqual(code,200)
        self.assertIn('session',data)

    def test_validation_and_no_private_files(self):
        p=self.payload();p['people']=0
        self.assertEqual(self.call('/api/requests',p,{'X-Owner':self.owner})[0],400)
        p=self.payload();p['attachments']=[{'data':'data:image/svg+xml;base64,PHN2Zz4='}]
        self.assertEqual(self.call('/api/requests',p,{'X-Owner':self.owner})[0],400)
        p['attachments']=[{'data':'data:image/png;base64,'+base64.b64encode(b'not an image').decode()}]
        self.assertEqual(self.call('/api/requests',p,{'X-Owner':self.owner})[0],400)
        p['attachments']=[{'data':'data:image/jpeg;base64,'+base64.b64encode(b'\xff\xd8\xff'+b'a'*(1024*1024)).decode()}]
        self.assertEqual(self.call('/api/requests',p,{'X-Owner':self.owner})[0],400)
        self.assertEqual(self.call('/data/floodcare.sqlite3')[0],404)
        self.assertEqual(self.call('/run.py')[0],404)
        self.assertEqual(self.call('/api/login',{'password':'staff-test-password'},{'Origin':'https://example.org'})[0],403)
        with urlopen(self.base+'/staff.html') as r:self.assertIn(b'staff.js',r.read())
        with urlopen(self.base+'/') as r:self.assertNotIn(b'id="staff"',r.read())


if __name__=='__main__':unittest.main()
