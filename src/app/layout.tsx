// In your _app.tsx or layout.tsx
import AuthInitializer from "@/components/AuthInitializaer";
import AuthLoadingGate from "@/components/AuthLoadingGate";
import styles from "@/styles/Home.module.css";
import "@/styles/globals.css";
import "@/styles/livekit/theme.scss";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: 'Phaser Nextjs Template',
  description: 'A Phaser 3 Next.js project template using Vite & Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
          <body className={`${styles.main} application-body` }>
            {/* <main className={styles.main}> */}
                <AuthInitializer>
                <AuthLoadingGate>
                  {children}
                
                </AuthLoadingGate>
                </AuthInitializer>
            {/* </main> */}
          </body>
        </html>
      )
}
