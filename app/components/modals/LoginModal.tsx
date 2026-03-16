'use client';

import { useState } from "react";
import Modal from "./Modal";
import CustomButton from "../forms/CustomButton";
import useLoginModal from "@/hooks/useLoginModal";
import useSignupModal from "@/hooks/useSignupModal";
import { loginUser } from "@/hooks/useAuth";

const LoginModal = () => {
  const loginModal = useLoginModal();
  const signupModal = useSignupModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: string[] = [];
    if (!email) errs.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push("Invalid email format");
    if (!password) errs.push("Password is required");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setIsLoading(true);
    try {
      await loginUser(email, password);
      setEmail(""); setPassword("");
      loginModal.close();
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : "Login failed, please try again"]);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-1">
          {errors.map((e, i) => <p key={i} className="text-sm text-red-600">• {e}</p>)}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb ${errors.some(e => e.includes("mail")) ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb ${errors.some(e => e.includes("assword")) ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
      </div>
      <CustomButton label={isLoading ? "Logging in..." : "Log in"} onClick={handleSubmit} className="w-full mt-2" />
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={() => { loginModal.close(); signupModal.open(); }}
          className="font-semibold text-airbnb hover:underline">Sign up</button>
      </p>
    </div>
  );

  return <Modal label="Log in" content={content} isOpen={loginModal.isOpen} onClose={loginModal.close} />;
};

export default LoginModal;
