import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // Import js-cookie
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const Switch = () => {
  const t = useTranslations("Switch");
  const [, setHasToken] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if token is in cookie
    const token = Cookies.get("token"); // Read from cookie
    if (token) {
      setHasToken(true);
      setShowWarning(true); // Show warning popup
    }
  }, []);

  const handleConfirmSwitchAccount = () => {
    // Switch account
    Cookies.remove("token"); // Remove token from cookie
    setShowWarning(false); // Hide popup
    router.push("/login"); // Go to login page
  };

  const handleCancelSwitchAccount = () => {
    // Close warning popup
    setShowWarning(false);
  };

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              {t("alreadyLoggedIn")}
            </h3>
            <p className="mb-4">
              {t("switchWarning")}
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleConfirmSwitchAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                {t("switchAccount")}
              </button>
              <button
                onClick={handleCancelSwitchAccount}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                {t("cancel")}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {t("disconnectWarning")}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Switch;