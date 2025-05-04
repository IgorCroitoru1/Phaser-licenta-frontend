// In your _app.tsx or layout.tsx
import AuthInitializer from "@/components/AuthInitializaer";
import styles from "@/styles/Home.module.css";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: 'Phaser Nextjs Template',
  description: 'A Phaser 3 Next.js project template using Vite & Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
          <body className='aplication-body'>
            <main className={styles.main}>
              <AuthInitializer>
                {children}
              </AuthInitializer>
            </main>
          </body>
        </html>
      )
}
