"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flower } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import axios from "axios";
import Switch from "../components/Switch/switch";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.chanomhub.online/api/users/login",
        { user: { email, password } }
      );

      if (response.data.user?.token) {
        toast.success(t('successMessage'), { autoClose: 2000 });
        Cookies.set("token", response.data.user.token, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        setTimeout(() => router.push("/"), 2000);
      } else {
        toast.error(t('invalidResponseMessage'));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('invalidCredentialsMessage'));
      } else {
        toast.error(t('unexpectedErrorMessage'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <Switch />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Card className="w-full max-w-lg bg-gray-800/90 backdrop-blur-md shadow-xl rounded-xl border border-gray-700">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center text-white transition-transform hover:scale-110">
            <Flower className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-semibold text-gray-200">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('passwordPlaceholder')}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-indigo-500"
              disabled={loading}
            >
              {loading ? t('loading') : t('loginButton')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-6 border-t border-gray-700">
          <Button
            variant="link"
            onClick={() => router.push("/register")}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {t('registerLink')}
          </Button>
          <Button
            variant="link"
            onClick={() => router.push("/")}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {t('homeLink')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}