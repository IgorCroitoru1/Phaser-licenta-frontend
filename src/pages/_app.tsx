// // pages/_app.tsx
// import "@/styles/globals.css";
// import type { AppProps } from "next/app";
// import { NextPage } from "next";
// import { ReactNode } from "react";

// // Extend the NextPage type to include the Layout property
// type PageWithLayout = NextPage & {
//   Layout?: ({ children }: { children: ReactNode }) => JSX.Element;
// };

// // Extend AppProps to use our custom page type
// type AppPropsWithLayout = AppProps & {
//   Component: PageWithLayout;
// };

// export default function App({ Component, pageProps }: AppPropsWithLayout) {
//   // Use the layout defined at the page level, if available
//   const Layout = Component.Layout ?? (({ children }) => <>{children}</>);
  
//   return (
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//   );
// }
