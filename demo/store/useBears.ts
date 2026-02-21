import { create } from "zustand";
import { withRozenite } from "rozenite-zustand-plugin";

type State = {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
};

export const useBears = create<State>()(
  withRozenite<State>({ name: "bears" })((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears) => set({ bears: newBears }),
  }))
);
