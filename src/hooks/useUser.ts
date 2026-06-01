import { userService } from "../services/userService";

// Placeholder user hook. Replace with real state management / react-query later.
export function useUser() {
  return {
    user: null,
    getCurrentUser: userService.getCurrentUser,
    updateProfile: userService.updateProfile,
  };
}

export default useUser;
