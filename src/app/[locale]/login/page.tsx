'use client';
import { useRouter } from "@/i18n/navigation";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");

  return (
    <AuthLayout>
      <LoginForm
        onSwitch={() => router.push("/register")}
        title={t('title')}
        emailPlaceholder={t('emailPlaceholder')}
        passwordPlaceholder={t('passwordPlaceholder')}
        loginButtonText={t('loginButton')}
        registerLinkText={t('registerLink')}
      />
    </AuthLayout>
  );
}