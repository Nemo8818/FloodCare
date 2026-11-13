# FloodCare — บทวิดีโอเวอร์ชันผู้ยื่นคำร้องและเจ้าหน้าที่
อัดเองแยก 2 คลิป ไม่เกินคลิปละ 3 นาที พูดภาษาอังกฤษ ส่วนคำแปลไทยใช้อ่านเตรียม ไม่จำเป็นต้องอ่านทั้งสองภาษา เตรียมข้อมูลสมมติและรูปไม่เกิน 1 MB ไว้ก่อน ไม่แสดงรหัสผ่านในคลิป

## คลิป 1: Demo (เป้าหมายประมาณ 2:30–2:55 นาที)
### เปิดหน้าผู้ยื่นคำร้อง (0:00–0:20)
EN: This is FloodCare, a bilingual flood-support prototype. Residents and staff have separate pages. Both connect to the same Python server. This demonstration uses fictional information and is not connected to actual rescue services or government agencies.

TH: นี่คือ FloodCare ต้นแบบช่วยเหลือผู้ประสบภัยสองภาษา ผู้ยื่นคำร้องและเจ้าหน้าที่มีหน้าแยกกัน แต่เชื่อมเซิร์ฟเวอร์ Python เดียวกัน การสาธิตใช้ข้อมูลสมมติและไม่ได้เชื่อมหน่วยกู้ภัยหรือรัฐจริง

### กรอก SOS แนบรูปและส่ง (0:20–0:55)
EN: Here, I enter a contact name, the number of people, the emergency type, and a clear address. I can request device coordinates if available. I attach a small incident photo. The application supports up to two JPEG, PNG or WebP images, one megabyte each. I now submit the SOS.

TH: ฉันกรอกชื่อ จำนวนคน ประเภทเหตุ และที่อยู่ชัดเจน ขอพิกัดจากอุปกรณ์ได้หากรองรับ แล้วแนบรูปเหตุการณ์ขนาดเล็ก ระบบรองรับ JPG, PNG หรือ WebP ไม่เกินสองรูป รูปละหนึ่งเมกะไบต์ จากนั้นกดส่ง SOS

### แสดงสถานะ (0:55–1:15)
EN: The request first saves on this device. Once the server confirms receipt, its status changes to awaiting staff acknowledgement. Server receipt does not mean a rescue team has been dispatched. If the connection fails, the request remains local with a retry button.

TH: คำขอบันทึกในเครื่องก่อน เมื่อเซิร์ฟเวอร์ตอบรับจึงเปลี่ยนเป็นรอเจ้าหน้าที่รับเรื่อง ไม่ได้แปลว่าทีมกู้ภัยออกเดินทางแล้ว หากเชื่อมต่อไม่สำเร็จ ข้อมูลจะอยู่ในเครื่องพร้อมปุ่มลองส่งอีกครั้ง

### สลับหน้าเจ้าหน้าที่ที่เข้าสู่ระบบไว้แล้ว (1:15–1:55)
EN: On the separate staff page, I am already signed in. It checks the server every three seconds while open and connected. A new SOS produces an alert banner. Sound and desktop notifications depend on browser permission. Staff can inspect the contact details, address, and attached photo. Dismissing an alert does not acknowledge the request.

TH: หน้าเจ้าหน้าที่แยกออกมาและฉันเข้าสู่ระบบไว้แล้ว หน้านี้ตรวจข้อมูลทุกสามวินาทีเมื่อเปิดอยู่และเชื่อมต่อได้ SOS ใหม่ทำให้ขึ้นแถบเตือน เสียงและป๊อปอัปขึ้นกับสิทธิเบราว์เซอร์ เจ้าหน้าที่ดูผู้ติดต่อ ที่อยู่ และรูปได้ การปิดแถบเตือนไม่เท่ากับรับเรื่อง

### เปลี่ยนสถานะและกลับหน้าผู้ยื่น (1:55–2:20)
EN: I explicitly acknowledge this request. The server records the change in its history. Returning to the resident page, the status updates after its next successful check. Other residents cannot access these records using a different browser ownership key.

TH: ฉันเลือกรับเรื่องอย่างชัดเจน เซิร์ฟเวอร์เก็บประวัติ เมื่อกลับหน้าผู้ยื่น สถานะจะอัปเดตหลังการตรวจข้อมูลสำเร็จครั้งถัดไป ผู้ยื่นรายอื่นที่มีรหัสเจ้าของคำขอคนละชุดจะเข้าดูข้อมูลนี้ไม่ได้

### แสดงเยียวยาและสลับภาษา (2:20–2:50)
EN: Residents can also record damage information with photos and a sample preparation checklist. This is not an eligibility decision. Both pages support Thai and English. The current version demonstrates request submission, staff alerts, and progress tracking through one shared server. Staff alerts require the page to remain open; background push is not implemented.

TH: ผู้ยื่นบันทึกความเสียหายพร้อมรูปและเช็กลิสต์ตัวอย่างได้ ซึ่งไม่ใช่การตัดสินสิทธิ ทั้งสองหน้าเลือกไทยหรืออังกฤษได้ เวอร์ชันนี้แสดงการส่งคำขอ แจ้งเตือนเจ้าหน้าที่ และติดตามสถานะผ่านเซิร์ฟเวอร์ร่วมกัน หน้าเจ้าหน้าที่ต้องเปิดค้างไว้ ยังไม่มี Push เมื่อปิดเว็บ

## คลิป 2: Presentation (เป้าหมายประมาณ 2:15–2:45 นาที)
### Problem
EN: During a flood, residents need to explain where they are, who needs help, and how serious the situation is. Later, they may need to organize damage information for assistance. Travelling to an office can be difficult. Staff also need a clear overview of incoming requests. My project explores how a small program can make these steps easier to follow.

TH: เมื่อน้ำท่วม ผู้ประสบภัยต้องอธิบายว่าอยู่ที่ไหน ใครต้องการความช่วยเหลือ และเหตุรุนแรงแค่ไหน หลังจากนั้นต้องรวบรวมความเสียหายเพื่อติดต่อขอความช่วยเหลือ การไปสำนักงานทำได้ยาก เจ้าหน้าที่ก็ต้องเห็นคำขอที่เข้ามาอย่างเป็นระบบ โปรเจกต์นี้จึงสำรวจว่าโปรแกรมเล็กจะทำให้ขั้นตอนเหล่านี้ง่ายขึ้นอย่างไร

### Why it matters
EN: Clear information matters during stressful situations. A photo can help explain damage, and a visible status can show whether information reached the server or whether staff acknowledged it. These are different events, so the interface should not confuse them or promise help before anyone accepts the request.

TH: ข้อมูลชัดเจนสำคัญในภาวะเครียด รูปช่วยอธิบายความเสียหาย และสถานะช่วยแยกว่าข้อมูลถึงเซิร์ฟเวอร์หรือเจ้าหน้าที่รับเรื่องแล้ว ทั้งสองเป็นคนละขั้น ระบบจึงไม่ควรทำให้สับสนหรือรับปากว่ามีคนช่วยก่อนมีผู้รับเรื่อง

### Solution
EN: FloodCare separates the citizen portal from an authenticated staff dashboard. Residents submit SOS or damage information with optional photos. A Python backend stores requests in SQLite. Staff can review requests, see new-SOS alerts, and update status. Residents then see the updated progress. Both interfaces support Thai and English. Local saving and retry help preserve information when communication is interrupted.

TH: FloodCare แยกหน้าผู้ยื่นออกจากหน้าเจ้าหน้าที่ที่ต้องเข้าสู่ระบบ ผู้ยื่นส่ง SOS หรือข้อมูลความเสียหายพร้อมรูปได้ เซิร์ฟเวอร์ Python เก็บคำขอใน SQLite เจ้าหน้าที่ตรวจคำขอ รับการเตือน SOS ใหม่ และอัปเดตสถานะ ผู้ยื่นจึงเห็นความคืบหน้า ทั้งสองหน้าใช้ได้ทั้งไทยและอังกฤษ การบันทึกในเครื่องและลองส่งใหม่ช่วยเก็บข้อมูลเมื่อการสื่อสารขัดข้อง

### Scope and next steps
EN: This prototype can connect two devices on the same trusted Wi-Fi without an internet uplink if they can reach the shared server. But with no communication path, requests cannot leave the device. Alerts use polling while the staff page is open, not guaranteed background push. The system does not dispatch real rescue teams, approve compensation, or connect to government databases. A real deployment would need an agency partner, secure hosting, individual staff accounts, and tested response procedures. The current project provides a working, small-scale demonstration of a clearer flood-support workflow.

TH: ต้นแบบเชื่อมสองอุปกรณ์ใน Wi-Fi เดียวกันได้โดยไม่ต้องมีอินเทอร์เน็ตออกนอกเครือข่าย หากเข้าถึงเซิร์ฟเวอร์ร่วมกันได้ แต่เมื่อไม่มีช่องทางสื่อสาร คำขอออกจากเครื่องไม่ได้ การแจ้งเตือนใช้การตรวจข้อมูลเป็นระยะขณะหน้าเจ้าหน้าที่เปิดอยู่ ไม่ใช่ Push ที่รับประกันได้เมื่อปิดเว็บ ระบบไม่สั่งกู้ภัยจริง ไม่อนุมัติเงิน และไม่เชื่อมฐานข้อมูลรัฐ การใช้งานจริงต้องมีหน่วยงานร่วม โฮสติ้งปลอดภัย บัญชีเจ้าหน้าที่รายบุคคล และขั้นตอนรับเหตุที่ผ่านการทดสอบ โปรเจกต์นี้แสดงขั้นตอนช่วยเหลือน้ำท่วมที่ชัดเจนขึ้นในขนาดเล็กที่ทำงานได้
