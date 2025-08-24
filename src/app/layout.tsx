"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/app/context/UserContext";
import { MoleculeProvider } from "@/context/MoleculeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Initialize Ably client only once
  const [client] = useState(() => new Ably.Realtime({
    key: process.env.NEXT_PUBLIC_ABLY_API_KEY || "",
  }));
  return (
    <html lang="en">
      <head>
        <title>MoleCuQuest - Molecular Discovery Platform</title>
        <meta name="description" content="Advanced molecular discovery and drug research platform powered by AI" />
        <script async src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"></script>
      </head>
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          <UserProvider>
            <MoleculeProvider>
              <AblyProvider client={client}>
                <ChannelProvider channelName="chat-demo1">
                  <div className="font-poppins dark:bg-boxdark-2 dark:text-bodydark ">
                    {loading ? <Loader /> : children}
                  </div>
                </ChannelProvider>
              </AblyProvider>
            </MoleculeProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
