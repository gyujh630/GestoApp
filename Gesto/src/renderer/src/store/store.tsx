import {create} from "zustand";

const useStore = create((set) => ({
  selectedPdf: null,
  selectedPdfList: [],
  setSelectedPdf: (pdf) => set({ selectedPdf: pdf }),
  setSelectedPdfList: (list) => set({ selectedPdfList: list }),

  topBarState: false,
  setTopBarState: () => set((state) => ({ showStartLink: !state.showStartLink }))
}))

export default useStore;