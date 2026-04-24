"use client";

import { useEffect } from "react";
import type { ConfirmModalState } from "@/lib/shared/types";

interface ConfirmModalProps {
  state: ConfirmModalState;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function ConfirmModal({
  state,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  const isDelete = state.mode === "delete";
  const isUnsaved = state.mode === "unsaved";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-semibold text-black">
          {isDelete && "确认删除"}
          {isUnsaved && "放弃更改"}
        </h2>

        <p className="mb-6 text-sm text-black/65">
          {isDelete && state.itemName && (
            <>确定要删除「{state.itemName}」吗？</>
          )}
          {isUnsaved && "您有未保存的更改，确定要放弃吗？"}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-[20px] border border-black/10 px-4 py-3 text-sm text-black/65 hover:border-black/30 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 rounded-[20px] px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              isDelete
                ? "bg-[#C73B31] hover:bg-[#A62D26]"
                : "bg-[#9A3412] hover:bg-[#7D2D0F]"
            }`}
          >
            {isSubmitting ? "处理中..." : "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}
