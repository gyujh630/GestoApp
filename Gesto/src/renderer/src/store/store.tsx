import {create} from "zustand";

const useStore = create((set) => ({
  selectedPdf: null,
  selectedPdfList: [],
  setSelectedPdf: (pdf) => set({ selectedPdf: pdf }),
  setSelectedPdfList: (list) => set({ selectedPdfList: list }),

  topBarState: false,
  setTopBarState: (bool) => set((state) => ({ showStartLink: bool }))
}))

export default useStore;