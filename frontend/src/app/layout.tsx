import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "LUNAR JOURNEY | จองเที่ยวบิน ที่พัก และแพ็กเกจทัวร์สุดหรู",
  description: "ออกเดินทางสู่โลกกว้าง เก็บเกี่ยวช่วงเวลาที่มีค่า ประสบการณ์การเดินทางที่ออกแบบมาเพื่อคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
