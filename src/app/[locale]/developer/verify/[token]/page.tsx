'use client';

import { useParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "../../../../components/Switch/switch";
import { VerificationForm } from "../../../../components/developer/VerificationForm";

export default function VerificationPage() {
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6 font-sans">
      <div className="absolute top-6 right-6">
        <Switch />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <VerificationForm token={token} />
    </div>
  );
}
