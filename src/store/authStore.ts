import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserState = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      fetchUser: async () => {
        try {
          const response = await fetch("/api/auth/me");
          if (response.ok) {
            const { user } = await response.json();
            const minimalUser = {
              id: user.id,
              name: user.name,
              email: user.email,
            };
            set({ user: minimalUser });
          } else {
            console.error("Failed to fetch user");
            set({ user: null });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          set({ user: null });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);