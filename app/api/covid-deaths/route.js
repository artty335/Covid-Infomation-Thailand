import { NextResponse } from 'next/server';

// 🏷️ Mapping จังหวัดจากไทย → อังกฤษ เพื่อให้ตรงกับ GeoJSON
const provinceMapping = {
  "กรุงเทพมหานคร": "Bangkok",
  "เชียงใหม่": "Chiang Mai",
  "เชียงราย": "Chiang Rai",
  "ภูเก็ต": "Phuket",
  "นครราชสีมา": "Nakhon Ratchasima",
  "ขอนแก่น": "Khon Kaen",
  "อุดรธานี": "Udon Thani",
  "สุราษฎร์ธานี": "Surat Thani",
  "ตรัง": "Trang",
  "พังงา": "Phang Nga",
  "สตูล": "Satun",
  "กระบี่": "Krabi",
  "นครสวรรค์": "Nakhon Sawan",
  "สมุทรสาคร": "Samut Sakhon",
  "ปัตตานี": "Pattani",
  "เพชรบุรี": "Phetchaburi",
  "เลย": "Loei",
  "อุบลราชธานี": "Ubon Ratchathani",
  "บุรีรัมย์": "Buri Ram",
  "พัทลุง": "Phatthalung",
  "บึงกาฬ": "Bueng Kan",
  "ตาก": "Tak",
  "พิษณุโลก": "Phitsanulok",
  "ราชบุรี": "Ratchaburi",
  "สงขลา": "Songkhla",
  "ลำปาง": "Lampang",
  "ชลบุรี": "Chon Buri",
  "ยะลา": "Yala",
  "ฉะเชิงเทรา": "Chachoengsao",
  "ชัยภูมิ": "Chaiyaphum",
  "กาญจนบุรี": "Kanchanaburi",
  "สิงห์บุรี": "Sing Buri",
  "สระบุรี": "Saraburi",
  "สุโขทัย": "Sukhothai",
  "สุพรรณบุรี": "Suphan Buri",
  "ระยอง": "Rayong",
  "แม่ฮ่องสอน": "Mae Hong Son",
  "ลพบุรี": "Lop Buri",
  "สมุทรปราการ": "Samut Prakan",
  "นครศรีธรรมราช": "Nakhon Si Thammarat",
  "อุตรดิตถ์": "Uttaradit",
  "อุทัยธานี": "Uthai Thani",
  "พระนครศรีอยุธยา": "Phra Nakhon Si Ayutthaya",
  "ตราด": "Trat",
  "ศรีสะเกษ": "Si Sa Ket",
  "นครปฐม": "Nakhon Pathom",
  "แพร่": "Phrae",
  "ปราจีนบุรี": "Prachin Buri",
  "ร้อยเอ็ด": "Roi Et",
  "จันทบุรี": "Chanthaburi",
  "เพชรบูรณ์": "Phetchabun",
  "กำแพงเพชร": "Kamphaeng Phet",
  "อ่างทอง": "Ang Thong",
  "กาฬสินธุ์": "Kalasin",
  "ปทุมธานี": "Pathum Thani",
  "นครนายก": "Nakhon Nayok",
  "นนทบุรี": "Nonthaburi",
  "ประจวบคีรีขันธ์": "Prachuap Khiri Khan",
  "สระแก้ว": "Sa Kaeo",
  "ชุมพร": "Chumphon",
  "ระนอง": "Ranong",
  "หนองคาย": "Nong Khai",
  "สกลนคร": "Sakon Nakhon",
  "น่าน": "Nan",
  "มหาสารคาม": "Maha Sarakham",
  "หนองบัวลำภู": "Nong Bua Lamphu",
  "อำนาจเจริญ": "Amnat Charoen",
  "นครพนม": "Nakhon Phanom",
  "สมุทรสงคราม": "Samut Songkhram",
  "นราธิวาส": "Narathiwat",
  "ลำพูน": "Lamphun",
  "สุรินทร์": "Surin",
  "พิจิตร": "Phichit",
  "พะเยา": "Phayao",
  "มุกดาหาร": "Mukdahan"
};

// 🏷️ ฟังก์ชันดึงข้อมูล API พร้อม Retry Mechanism (ถ้าล้มเหลว)
async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching COVID data... Attempt ${i + 1}`);
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // 🏷️ ลองอ่าน response แบบ text ก่อน (กัน API ส่งกลับมาไม่สมบูรณ์)
      const rawText = await res.text();
      console.log("Raw API Response:", rawText);

      if (!rawText) {
        throw new Error("API response is empty");
      }

      const json = JSON.parse(rawText);
      return json;
    } catch (error) {
      console.error(`Error fetching API: ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function GET() {
  try {
    const apiUrl = 'https://covid19.ddc.moph.go.th/api/Deaths/round-4-line-list';
    const json = await fetchWithRetry(apiUrl);
    
    if (!json || !json.data) {
      throw new Error('Invalid API response format');
    }

    const latestUpdateDate = json.data[0]?.update_date || "ไม่ระบุ";

    // 🏷️ รวมจำนวนผู้เสียชีวิตแยกตามจังหวัด
    const deathsByProvince = json.data.reduce((acc, record) => {
      const provinceThai = record.province ? record.province.trim() : "";
      const provinceEng = provinceMapping[provinceThai] || provinceThai; // ถ้าไม่มีใน mapping ให้ใช้ชื่อไทย

      if (!provinceEng) return acc;
      acc[provinceEng] = (acc[provinceEng] || 0) + 1;
      return acc;
    }, {});

    console.log('Processed Data:', deathsByProvince);
    return NextResponse.json({ deathsByProvince, update_date: latestUpdateDate }, { status: 200 });

  } catch (error) {
    console.error('Error fetching or processing COVID data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
