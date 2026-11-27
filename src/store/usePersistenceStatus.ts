import { create } from "zustand";

type PersistenceStatus = "ok" | "read-error" | "write-error";

interface PersistenceStatusStore {
  status: PersistenceStatus;
  setStatus: (status: PersistenceStatus) => void;
}

export const usePersistenceStatus = create<PersistenceStatusStore>((set) => ({
  status: "ok",
  setStatus: (status) => set({ status }),
}));
