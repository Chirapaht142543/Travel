import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  Compass, 
  Briefcase, 
  Hotel, 
  Map, 
  Package, 
  User, 
  Sun, 
  Moon, 
  Headphones 
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme, user } = useApp();

  const menuItems = [
    { label: "สำรวจ (Explore)", icon: <Compass size={22} />, path: "/" },
    { label: "ทริปของฉัน (Trips)", icon: <Briefcase size={22} />, path: "/trips" },
    { label: "ที่พัก (Stays)", icon: <Hotel size={22} />, path: "/?tab=stay" },
    { label: "ประสบการณ์ (Experiences)", icon: <Map size={22} />, path: "/?tab=experience" },
    { label: "แพ็กเกจ (Packages)", icon: <Package size={22} />, path: "/?tab=package" },
  ];

  return (
    <aside className={`${styles.sidebar} glass`}>
      {/* Brand Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.moonLogo}>
          <div className={styles.crescent}></div>
        </div>
        <div className={styles.brandName}>
          <h2>LUNAR</h2>
          <span>JOURNEY</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        <ul>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || (item.path.includes("tab") && pathname === "/" && typeof window !== "undefined" && window.location.search.includes(item.path.split("=")[1]));
            return (
              <li key={index}>
                <Link href={item.path} className={`${styles.navLink} ${isActive ? styles.active : ""}`}>
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          
          <li>
            <Link href="/profile" className={`${styles.navLink} ${pathname === "/profile" ? styles.active : ""}`}>
              <span className={styles.icon}><User size={22} /></span>
              <span className={styles.label}>โปรไฟล์ (Profile)</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer Controls */}
      <div className={styles.sidebarFooter}>
        {/* Theme Toggler */}
        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === "dark" ? <Sun size={20} className={styles.sunIcon} /> : <Moon size={20} className={styles.moonIcon} />}
          <span className={styles.themeText}>{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>
        </button>

        {/* 24/7 Help Widget */}
        <div className={styles.helpWidget}>
          <div className={styles.helpIconContainer}>
            <Headphones size={18} />
          </div>
          <div className={styles.helpInfo}>
            <h4>ช่วยเหลือ 24/7</h4>
            <p>แชทกับเราได้ตลอดเวลา</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
