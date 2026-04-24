export type Toast = {
  message: string;
  type: "success" | "error";
};

export type ModalMode = "add" | "edit" | null;

export type ConfirmModalState<T = { id: string; nickname?: string; [key: string]: unknown }> = {
  isOpen: boolean;
  mode: "delete" | "unsaved" | null;
  item?: T;
  itemName?: string;
};
