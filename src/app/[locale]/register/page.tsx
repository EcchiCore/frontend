"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import axios from "axios";
import Cookies from 'js-cookie';
import Navbar from './../components/Navbar';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const t = useTranslations('Register');
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (Object.values(formData).some((value) => !value)) {
      toast.error(t('fillAllFieldsMessage'));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatchMessage'));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.chanomhub.online/api/users",
        {
          user: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }
        }
      );

      if (response.data.user?.token) {
        Cookies.set('token', response.data.user.token, {
          expires: 7,
          secure: true,
          sameSite: 'strict'
        });

        toast.success(t('successMessage'), { autoClose: 2000 });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(t('invalidResponseMessage'));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Registration error:", error);
        const errorMessage = error.response?.data?.errors?.body?.[0] ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          t('registrationFailedMessage');
        toast.error(errorMessage);
      } else {
        console.error("Unexpected error:", error);
        toast.error(t('unexpectedErrorMessage'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="card w-full max-w-lg bg-gray-800/90 backdrop-blur-md shadow-xl rounded-xl border border-gray-700">
          <div className="card-body p-6">
            <h2 className="text-3xl font-semibold text-center text-gray-200">{t('title')}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {Object.keys(formData).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium text-gray-300">
                    {t(key)}
                  </Label>
                  <Input
                    id={key}
                    type={key === 'password' || key === 'confirmPassword' ? 'password' : key === 'email' ? 'email' : 'text'}
                    name={key}
                    value={formData[key as keyof FormData]}
                    onChange={handleChange}
                    required
                    placeholder={t(`${key}Placeholder`)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
                  />
                </div>
              ))}
              <Button
                type="submit"
                className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-indigo-500"
                disabled={loading}
              >
                {loading ? t('loading') : t('registerButton')}
              </Button>
            </form>
            <p className="text-center mt-4 text-gray-300">
              {t('loginLink')}{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                {t('loginLinkText')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}