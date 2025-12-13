'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flower } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import axios from "axios";
import Cookies from 'js-cookie';
import { supabase } from "@/lib/supabaseClient";

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const t = useTranslations('Login');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || t('unexpectedErrorMessage'));
    }
  };

  const exchangeSupabaseToken = async (session: any) => {
    try {
      if (!session?.access_token) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login-supabase`,
        { accessToken: session.access_token }
      );

      if (response.data.user?.token) {
        toast.success(t('successMessage'), { autoClose: 2000 });
        Cookies.set("token", response.data.user.token, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        // Force reload to update auth state or redirect
        setTimeout(() => router.push("/"), 1000);
      }
    } catch (error) {
      console.error("SSO Exchange Error:", error);
      toast.error(t('invalidResponseMessage'));
    }
  };

  // Check for Supabase session on mount (handling redirect from OAuth)
  // Check for Supabase session on mount (handling redirect from OAuth)
  useEffect(() => {
    const handleSession = async () => {
      // Check if we have a hash with access_token (Implicit Grant)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          // Supabase client should automatically parse the hash and set the session
          // We just need to wait a tick or check getSession again
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session) {
            exchangeSupabaseToken(session);
            // Clear the hash to look cleaner
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        } catch (e) {
          console.error("Error processing hash session:", e);
        }
      }

      // Normal session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          exchangeSupabaseToken(session);
        }
      });
    };

    handleSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        exchangeSupabaseToken(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Login with Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 border-t border-gray-700">
        <Button
          variant="link"
          onClick={onSwitch}
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
  );
}