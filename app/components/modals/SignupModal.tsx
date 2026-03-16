'use client';

import { useState } from "react";
import Modal from "./Modal";
import CustomButton from "../forms/CustomButton";
import useLoginModal from "@/hooks/useLoginModal";
import useSignupModal from "@/hooks/useSignupModal";
import { signupUser } from "@/hooks/useAuth";

const SignupModal = () => {
  const loginModal = useLoginModal();
  const signupModal = useSignupModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required");
    else if (name.trim().length < 2) errs.push("Name must be at least 2 characters");
    if (!email) errs.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push("Invalid email format");
    if (!password1) errs.push("Password is required");
    else if (password1.length < 8) errs.push("Password must be at least 8 characters");
    else if (!/[A-Za-z]/.test(password1) || !/[0-9]/.test(password1)) errs.push("Password must contain letters and numbers");
    if (!password2) errs.push("Please confirm your password");
    else if (password1 !== password2) errs.push("Passwords do not match");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setIsLoading(true);
    try {
      await signupUser(name, email, password1, password2);
      setName(""); setEmail(""); setPassword1(""); setPassword2("");
      signupModal.close();
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : "Sign up failed, please try again"]);
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
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input type="password" value={password1} onChange={e => setPassword1(e.target.value)} placeholder="At least 8 characters with letters and numbers"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Re-enter your password"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb" />
      </div>
      <CustomButton label={isLoading ? "Signing up..." : "Sign up"} onClick={handleSubmit} className="w-full mt-2" />
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button type="button" onClick={() => { signupModal.close(); loginModal.open(); }}
          className="font-semibold text-airbnb hover:underline">Log in</button>
      </p>
    </div>
  );

  return <Modal label="Sign up" content={content} isOpen={signupModal.isOpen} onClose={signupModal.close} />;
};

export default SignupModal;
