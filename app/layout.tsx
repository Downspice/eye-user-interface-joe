import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from "next/font/google";
import ProgressLoaderProvider from "@/providers/progressProvider";
// import QueryProvider from "@/providers/QueryClient";
// import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eye Tracking Experiment",
  description: "Trying to make the world a better place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
        <body
          suppressHydrationWarning
          className={`${nunito.className} antialiased`}
        >
          {/* <QueryProvider> */}
          <ProgressLoaderProvider>
            {children}
          </ProgressLoaderProvider>
             
             {/* </QueryProvider> */}
          {/* <Toaster richColors /> */}
        </body>
    </html>
  );
}
