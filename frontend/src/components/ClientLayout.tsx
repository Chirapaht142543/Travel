"use client";

import React, { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./ClientLayout.module.css";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppProvider>
      <div className={styles.layoutContainer}>
        {/* Left Sticky Sidebar */}
        <Sidebar />

        {/* Right Main Panel */}
        <div className={styles.mainPanel}>
          {/* Header */}
          <Header onSearchChange={setSearchQuery} />

          {/* Page Content Panel */}
          <main className={styles.content}>
            {/* We pass the search query downstream using React.cloneElement or by letting pages subscribe to it, 
                but in our structure, we can pass it down through context or simply let the search input trigger searchPlaces in the context!
                Actually, the Header search bar already triggers `searchPlaces(query)` inside the AppContext!
                This means any page showing places will automatically update because the places list in AppContext updates.
                This is a very clean and reactive design! */}
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default ClientLayout;
