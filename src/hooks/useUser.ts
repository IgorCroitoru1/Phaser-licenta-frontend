// import { useAuthStore } from "@/store/useAuthStore";
// import { useEffect, useState } from "react";
// import api from "@/lib/axios";
// import { UserDto } from "@/dtos/UserDto";
// import { use } from "matter";

// export const useUser = () => {
//   const user = useAuthStore((state) => state.user);
//   const setUser = useAuthStore((state) => state.setUser);
//   const accessToken = useAuthStore((state) => state.accessToken);
//   const [loading, setLoading] = useState(false);

//   const fetchUser = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get<UserDto>("/auth/me");
//       setUser(response.data);
//       return response.data;
//     } catch (error) {
//       setUser(null);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };
// useEffect(() => {
//     console.log("useUser effect triggered", accessToken, user);

// })
//   useEffect(() => {
//     console.log("useUser effect triggered", accessToken, user);
//     // Fetch only if accessToken exists and user is not already loaded
//     if (accessToken && !user) {
//       fetchUser();
//     }
//     if (!accessToken) {
//         console.log("No access token, clearing user");
//       setUser(null);
//     }
//   }, [accessToken]);

//   return {
//     user,
//     loading,
//     refreshUser: fetchUser,
//     clearUser: () => setUser(null),
//   };
// };
