import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // นำเข้า js-cookie
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const Switch = () => {
  const [, setHasToken] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // เช็คว่า token อยู่ใน cookie หรือไม่
    const token = Cookies.get("token"); // อ่านค่าจาก cookie
    if (token) {
      setHasToken(true);
      setShowWarning(true); // แสดงป็อปอัพเตือน
    }
  }, []);

  const handleConfirmSwitchAccount = () => {
    // สลับบัญชี (ลบ token เก่าแล้วทำการล็อกอินใหม่)
    Cookies.remove("token"); // ลบ token จาก cookie
    setShowWarning(false); // ซ่อนป็อปอัพ
    router.push("/login"); // ไปที่หน้า login
  };

  const handleCancelSwitchAccount = () => {
    // ปิดป็อปอัพเตือน
    setShowWarning(false);
  };

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              คุณมีบัญชีที่ล็อกอินอยู่แล้ว
            </h3>
            <p className="mb-4">
              หากคุณทำการล็อกอิน/ลงทะเบียนอีกครั้งจะเป็นการสลับบัญชี
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleConfirmSwitchAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                สลับบัญชี
              </button>
              <button
                onClick={handleCancelSwitchAccount}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                ยกเลิก
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              หากคุณกด สลับบัญชี เราจะทำการตัดการเชื่อมต่อกับบัญชีปัจจุบันของคุณ
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Switch;