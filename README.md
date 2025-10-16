## Data COVID-19 Death Dashboard

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-blue?logo=vercel)](https://data-covid-19-death.vercel.app/)

📌 **Data COVID-19 Death** เป็นเว็บแอปพลิเคชันที่ใช้แสดงข้อมูลเกี่ยวกับการเสียชีวิตจากโรค COVID-19 ในประเทศไทย โดยดึงข้อมูลจาก **กรมควบคุมโรค (DDC Thailand)** ผ่าน API อย่างเป็นทางการ.

## 🔗 **Demo**
👉 [ดูเว็บไซต์จริงที่นี่](https://data-covid-19-death.vercel.app/)

## 🛠️ **เทคโนโลยีที่ใช้**
- **Next.js** (React Framework) - ใช้ในการพัฒนาเว็บแอป
- **Tailwind CSS** - ใช้สำหรับจัดการ UI
- **MUI (Material-UI)** - ใช้สร้างองค์ประกอบ UI ที่ทันสมัย
- **PostgreSQL** - ใช้เป็นฐานข้อมูล
- **Vercel** - ใช้สำหรับ Deployment
- **GitHub** - ใช้เป็น version control และ repository

## 🌐 **API ข้อมูลจาก DDC Thailand**
โปรเจกต์นี้ใช้ข้อมูลจาก API ของกรมควบคุมโรค:
- **Endpoint:** [`https://covid19.ddc.moph.go.th/api/Deaths/round-4-line-list`](https://covid19.ddc.moph.go.th/api/Deaths/round-4-line-list)
- **ข้อมูลที่ได้รับ:**
  - `id` → หมายเลขผู้เสียชีวิต
  - `age` → อายุของผู้เสียชีวิต
  - `gender` → เพศ
  - `province` → จังหวัดที่เสียชีวิต
  - `risk` → ปัจจัยเสี่ยงต่อการเสียชีวิต
  - `date` → วันที่เสียชีวิต

## 🚀 **วิธีติดตั้งและใช้งาน**
### 1️⃣ **Clone โปรเจกต์**
```sh
git clone https://github.com/artty335/Data-COVID-19-Death.git
cd Data-COVID-19-Death
