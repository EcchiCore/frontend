// D:\sever\nextjs\src\app\[locale]\page.tsx

// หน้านี้ปิดให้บริการชั่วคราว 🏖️
// นักพัฒนาไปเที่ยว อือิ~ จะกลับมาเปิดอีกครั้งวันที่ 1 เดือนหน้า
// This page is temporarily unavailable.
// The developer is on vacation and will return on the 1st of next month.

export default function Page() {
  return (
    <div style={{ textAlign: 'center', marginTop: '20vh', fontFamily: 'sans-serif' }}>
      <h1>⛱️ We&#39;ll be back soon!</h1>
      <p>The developer is on vacation and will return on the 1st of next month.</p>
      <hr style={{ margin: '2rem auto', width: '50%' }} />
      <h2>🏖️ กลับมาเร็ว ๆ นี้!</h2>
      <p>นักพัฒนาไปเที่ยว อือิ~ เปิดอีกทีวันที่ 1 เดือนหน้า</p>
    </div>
  );
}

/*
import HomePage from './home/page'

export default function Page() {
  return <HomePage />;
}
*/
