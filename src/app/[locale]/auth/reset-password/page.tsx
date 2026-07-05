'use client';

import "react-toastify/dist/ReactToastify.css";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
