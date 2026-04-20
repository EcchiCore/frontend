'use client';
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSdk } from "@/lib/sdk";

interface VerificationFormProps {
  token: string;
}

export function VerificationForm({ token }: VerificationFormProps) {
  const router = useRouter();
  const [realName, setRealName] = useState("");
  const [bankType, setBankType] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sdk = await getSdk();
      await sdk.developer.verifyDeveloper(token, {
        realName,
        bankType,
        bankName,
        bankAccount,
        swiftCode: bankType === "INTERNATIONAL" ? swiftCode : undefined,
        bankAddress: bankType === "INTERNATIONAL" ? bankAddress : undefined,
        citizenId: citizenId || undefined,
      });

      toast.success("Verification successful! You are now a developer.", { autoClose: 3000 });
      
      // Redirect to home or profile after success
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Failed to verify developer status. The link might be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg bg-gray-800/90 backdrop-blur-md shadow-xl rounded-xl border border-gray-700">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-white transition-transform hover:scale-110">
          <UserCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-3xl font-semibold text-gray-200">
          Developer Verification
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Please provide your details to complete the registration as a developer on Chanomhub.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="realName" className="text-sm font-medium text-gray-300">
              Full Name (As in bank account)
            </Label>
            <Input
              id="realName"
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Bank Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                <input
                  type="radio"
                  name="bankType"
                  checked={bankType === "LOCAL"}
                  onChange={() => setBankType("LOCAL")}
                  className="w-4 h-4 accent-green-600"
                />
                Thai Bank
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                <input
                  type="radio"
                  name="bankType"
                  checked={bankType === "INTERNATIONAL"}
                  onChange={() => setBankType("INTERNATIONAL")}
                  className="w-4 h-4 accent-green-600"
                />
                International Bank
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium text-gray-300">
              Bank Name
            </Label>
            <Input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              placeholder={bankType === "LOCAL" ? "e.g. Kasikorn Bank, SCB" : "e.g. Chase, HSBC"}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount" className="text-sm font-medium text-gray-300">
              {bankType === "LOCAL" ? "Bank Account Number" : "IBAN / Account Number"}
            </Label>
            <Input
              id="bankAccount"
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
              placeholder="123-4-56789-0"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
            />
          </div>

          {bankType === "INTERNATIONAL" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="swiftCode" className="text-sm font-medium text-gray-300">
                  SWIFT / BIC Code
                </Label>
                <Input
                  id="swiftCode"
                  type="text"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  required
                  placeholder="KASITHBK"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAddress" className="text-sm font-medium text-gray-300">
                  Bank Address
                </Label>
                <Input
                  id="bankAddress"
                  type="text"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  required
                  placeholder="Street, City, Country"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="citizenId" className="text-sm font-medium text-gray-300">
              Citizen ID / Passport (Optional)
            </Label>
            <Input
              id="citizenId"
              type="text"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              placeholder="13-digit number"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-700 text-gray-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-green-500"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Complete Verification"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center p-6 border-t border-gray-700">
        <Button
          variant="link"
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Cancel and Return Home
        </Button>
      </CardFooter>
    </Card>
  );
}
