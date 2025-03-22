"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "../src/firebase";
import { signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/form-fields/TextInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Validation schema using Zod
const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[@$!%*?&]/, "Must contain at least 1 special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

interface ForgotPasswordPageProps {
  activeDialog: "sign-up" | "log-in" | "forget-password" | "change-password" | null;
  setActiveDialog: React.Dispatch<React.SetStateAction<"sign-up" | "log-in" | "forget-password" | "change-password" | null>>;
}

// Add proper types to the content component
function ChangePasswordContent({ activeDialog, setActiveDialog }: ForgotPasswordPageProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Import useSearchParams inside the client component
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";

  // Apply validation
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: prefilledEmail,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Pre-fill email field from query parameters
  useEffect(() => {
    if (prefilledEmail) {
      form.setValue("email", prefilledEmail, { shouldValidate: true });
    }
  }, [prefilledEmail, form]);

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  // Handle change password
  const handleChangePassword = async (data: z.infer<typeof schema>) => {
    setError("");
    setSuccess(false);

    if (!auth) {
      setError("Authentication system is not ready. Please try again.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.currentPassword);
      const user = userCredential.user;

      await updatePassword(user, data.newPassword);

      setSuccess(true);
      await signOut(auth);

      setTimeout(() => {
        setActiveDialog(null);
        router.push("/log-in");
      }, 5000);

      console.log("Password has been changed successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {success ? (
        <div className="text-center">
          <p className="text-md mb-5 text-gray-500">Please wait... You are being redirected.</p>
          <img width={"100"} className="object-center mx-auto mb-7 mt-2" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuvL3T42GwFfKMOq7IbYltCKRFrklMbdU0yA&s" alt="Success" />
          <p className="text-2xl mb-5">Password Updated!</p>
          <p className="text-md">Your password has been changed successfully.</p>
          <p className="text-sm">Use your new password to log in.</p>
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleChangePassword)}>
            <div className="mb-4">
              <TextInput control={control} name="email" type="email" label="Email" placeHolder="Enter Email" />
            </div>
            <div className="mb-4">
              <TextInput control={control} name="currentPassword" type="password" label="Current Password" placeHolder="Enter Current Password" />
            </div>
            <div className="mb-4">
              <TextInput control={control} name="newPassword" type="password" label="New Password" placeHolder="Enter New Password" />
            </div>
            <div className="mb-4">
              <TextInput control={control} name="confirmPassword" type="password" label="Confirm Password" placeHolder="Confirm New Password" />
            </div><br />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </FormProvider>
      )}
    </>
  );
}

// Main component
const ChangePasswordPage: React.FC<ForgotPasswordPageProps> = ({ activeDialog, setActiveDialog }) => {
  return (
    <Dialog open={activeDialog === "change-password"} onOpenChange={() => setActiveDialog(null)}>
      <DialogContent className="max-w-md bg-white rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Change Password</DialogTitle>
        </DialogHeader>
        
        <Suspense fallback={<div>Loading...</div>}>
          <ChangePasswordContent activeDialog={activeDialog} setActiveDialog={setActiveDialog} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordPage;