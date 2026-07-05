'use client';
import { useRouter } from "@/i18n/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Register");

  return (
    <AuthLayout>
      <RegisterForm
        onSwitch={() => router.push("/login")}
        title={t('title')}
        usernamePlaceholder={t('usernamePlaceholder')}
        emailPlaceholder={t('emailPlaceholder')}
        passwordPlaceholder={t('passwordPlaceholder')}
        confirmPasswordPlaceholder={t('confirmPasswordPlaceholder')}
        registerButtonText={t('registerButton')}
        loginLinkText={t('loginLink')}
        loginLinkActionText={t('loginLinkText')}
      />
    </AuthLayout>
  );
}
