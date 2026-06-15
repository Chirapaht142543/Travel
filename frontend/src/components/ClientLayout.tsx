"use client";

import React, { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import Navbar from "./Navbar";
import styles from "./ClientLayout.module.css";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppProvider>
      <div className={styles.layoutContainer}>
        {/* Top Navbar */}
        <Navbar onSearchChange={setSearchQuery} />

        {/* Page Content Panel */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </AppProvider>
  );
};

export default ClientLayout;
