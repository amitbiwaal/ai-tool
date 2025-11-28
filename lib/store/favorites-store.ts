import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: string[];
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (toolId) =>
        set((state) => ({
          favorites: [...state.favorites, toolId],
        })),
      removeFavorite: (toolId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== toolId),
        })),
      isFavorite: (toolId) => get().favorites.includes(toolId),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "favorites-storage",
    }
  )
);

