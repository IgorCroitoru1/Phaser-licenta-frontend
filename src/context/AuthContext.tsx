// // contexts/auth-context.tsx
// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';
// import { UserDto } from '@/dtos/UserDto';

// interface AuthContextType {
//   user: UserDto;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
//   logout: () => void;
//   refreshToken: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const router = useRouter();

//   // Your external auth server URL
//   const authServerUrl = process.env.NEXT_PUBLIC_AUTH_SERVER_URL;

//   // Initialize auth state
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const storedToken = localStorage.getItem('token');
//         if (storedToken) {
//           // Verify token with server
//           const { data } = await axios.get(`${authServerUrl}/verify`, {
//             headers: { Authorization: `Bearer ${storedToken}` }
//           });
          
//           setUser(data.user);
//           setToken(storedToken);
//           axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//         }
//       } catch (error) {
//         console.error('Authentication initialization error:', error);
//         localStorage.removeItem('token');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   // Handle login
//   const login = async (email: string, password: string) => {
//     try {
//       const { data } = await axios.post(`${authServerUrl}/login`, { email, password });
      
//       localStorage.setItem('token', data.token);
//       setToken(data.token);
//       setUser(data.user);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
//       router.push('/dashboard'); // Redirect after login
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   // Handle registration
//   const register = async (userData: any) => {
//     try {
//       const { data } = await axios.post(`${authServerUrl}/register`, userData);
      
//       localStorage.setItem('token', data.token);
//       setToken(data.token);
//       setUser(data.user);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
//       router.push('/dashboard'); // Redirect after registration
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   };

//   // Handle logout
//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//     delete axios.defaults.headers.common['Authorization'];
//     router.push('/login');
//   };

//   // Refresh token
//   const refreshToken = async () => {
//     try {
//       const { data } = await axios.post(`${authServerUrl}/refresh`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       localStorage.setItem('token', data.token);
//       setToken(data.token);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//     } catch (error) {
//       console.error('Token refresh error:', error);
//       logout(); // Force logout if refresh fails
//     }
//   };

//   // Value exposed to consumers
//   const value = {
//     user,
//     token,
//     isAuthenticated: !!token,
//     isLoading,
//     login,
//     register,
//     logout,
//     refreshToken
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // Custom hook to use the auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };