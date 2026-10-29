import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MarcoAplicacion } from "@/components/layout/marco-aplicacion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestor GIS — Gestión y Seguimiento de Obras San Juan",
  description:
    "Frontend institucional para la gestión y el seguimiento de recursos, estaciones, actas y dependencias operativas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <MarcoAplicacion>{children}</MarcoAplicacion>
      </body>
    </html>
  );
}
