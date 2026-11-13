# นำโค้ดที่ตรงกับเว็บออนไลน์ขึ้น GitHub

ชุดนี้มี README.md ใหม่, SOURCE_VERSION.json และโฟลเดอร์ web-online ที่มีโค้ดตรงกับเว็บออนไลน์เวอร์ชันปัจจุบัน รวมแท็บปิดงานแล้ว ไม่ใช่โค้ดมือถือ และไม่ใช่เวอร์ชัน Python เดิม

## ทางเลือกที่แยกเวอร์ชันชัดที่สุด
สร้าง repository ใหม่ชื่อ FloodCare-Web เลือก Public แล้วนำชุดนี้ขึ้นตามขั้นตอนด้านล่าง ใช้ลิงก์ repository ใหม่นี้เป็นลิงก์ส่งอาจารย์
หากใช้ Nemo8818/FloodCare เดิมก็ได้: แทน README.md ที่หน้าหลักด้วยไฟล์ใหม่ และเพิ่มโฟลเดอร์ web-online โดย README ใหม่จะอธิบายว่าไฟล์ Python เดิมเป็นต้นแบบก่อนหน้า

## อัปโหลดด้วยหน้าเว็บ GitHub ทีละชุด
โค้ดมี 129 ไฟล์ จึงแบ่งอัปโหลดสองชุดเพื่อให้ไม่เกินขีดจำกัด 100 ไฟล์ต่อการอัปโหลดด้วยเบราว์เซอร์

### A. ไฟล์คำอธิบายหน้าหลัก
1. แตก ZIP ก่อน
2. ใน GitHub repository เลือก Add file > Upload files
3. อัปโหลด README.md, SOURCE_VERSION.json และ GITHUB_UPLOAD_TH.md จากโฟลเดอร์ FloodCare_GitHub_Matching
4. Commit changes (ถ้า README เดิมมีอยู่ จะเป็นการแทนไฟล์เดิมด้วย README ใหม่)

### B. สร้างโฟลเดอร์ web-online
1. เลือก Add file > Create new file
2. ตั้งชื่อไฟล์ `web-online/README.md`
3. เปิด README.md ภายในโฟลเดอร์ web-online ของชุด ZIP ด้วย Notepad แล้วคัดลอกเนื้อหาทั้งหมดมาใส่
4. Commit changes จากนั้นคลิกเข้าโฟลเดอร์ web-online ใน GitHub

### C. อัปโหลด source ชุดแรก
1. ขณะอยู่ใน web-online บน GitHub กด Add file > Upload files
2. เปิด File Explorer เข้า web-online ของไฟล์ที่แตกแล้ว
3. เลือกโฟลเดอร์ components เพียงโฟลเดอร์เดียว แล้วลากลงในหน้า Upload files ของ GitHub (62 ไฟล์)
4. รอเสร็จแล้ว Commit changes

### D. อัปโหลด source ชุดที่สอง
1. กลับไป web-online บน GitHub แล้วกด Add file > Upload files
2. ใน File Explorer ที่อยู่ใน web-online เลือกไฟล์และโฟลเดอร์ทั้งหมด ยกเว้น components ที่อัปโหลดไปแล้ว
3. ลากลงหน้าอัปโหลด (67 ไฟล์) อย่าลากโฟลเดอร์ web-online ซ้ำเข้าไปข้างในจนกลายเป็น web-online/web-online
4. รอเสร็จแล้ว Commit changes

ถ้า Windows ซ่อนไฟล์หรือโฟลเดอร์ชื่อขึ้นต้นด้วยจุด ให้เปิด View > Show > Hidden items ขณะเตรียม source เพื่อให้รวมไฟล์กำหนดค่าในชุดด้วย ไม่ต้องเพิ่มไฟล์อื่นนอก ZIP

## ตรวจหลังอัปโหลด
- หน้าหลัก repository มี README ใหม่และโฟลเดอร์ web-online
- ใน web-online มี package.json, package-lock.json, app, lib, db, drizzle, scripts, tests และ worker
- README หน้าหลักระบุ commit 69b13a4108a744084f8729939f48478643dadb24 และลิงก์เว็บออนไลน์
- อย่าอัปโหลดเฉพาะ ZIP เพราะอาจารย์ต้องเปิดอ่านโค้ดได้
- ไม่ต้องเอา data ของโปรแกรม Python เดิม ไฟล์รูปส่วนตัว .dev.vars หรือ node_modules มาใส่

## ใช้ส่งงาน
GitHub: ลิงก์ repository ที่อัปโหลดชุดนี้เสร็จ
Demo: อัดเว็บออนไลน์ผู้ยื่นและเจ้าหน้าที่จากโดเมนเดียวกัน ไม่ใช้ localhost เก่าปะปน
Presentation: เล่าปัญหา ความสำคัญ แนวทางแก้ และข้อจำกัด
เว็บออนไลน์ยังจำกัดสิทธิ์ผู้เข้าถึง การอัปโหลดโค้ดไม่ได้เพิ่มสิทธิ์ให้อาจารย์เข้าดูเว็บ ต้องแยกการให้สิทธิ์กับการส่ง source

ชุดนี้ไม่ได้อัปโหลดหรือแทนไฟล์ใน GitHub ของผู้ใช้ให้อัตโนมัติ และไม่ได้เปลี่ยนเว็บที่เผยแพร่อยู่
