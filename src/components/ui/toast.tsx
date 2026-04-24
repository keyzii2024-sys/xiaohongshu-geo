"use client";

import { useEffect } from "react";

export type Toast = {
  message: string;
  type: "success" | "error";
};

type ToastMessageProps = {
  toast: Toast;
  onDismiss: () => void;
};

export function ToastMessage({ toast, onDismiss }: ToastMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] rounded-[24px] px-5 py-4 text-sm shadow-lg ${
        isSuccess
          ? "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]"
          : "border-[#F3D5BE] bg-[#FFF7F0] text-[#9A3412]"
      } border`}
    >
      {toast.message}
    </div>
  );
}
