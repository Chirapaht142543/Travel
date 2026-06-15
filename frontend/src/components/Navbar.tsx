import React, { useState, useRef } from "react";
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
  Heart,
  LogIn,
  LogOut,
  User as UserIcon,
  Globe,
  Headphones,
  Search,
  Menu,
  X
} from "lucide-react";
import styles from "./Navbar.module.css";
import LoginModal from "./LoginModal";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchChange }) => {
  const pathname = usePathname();
  const { theme, toggleTheme, user, logoutUser, favorites } = useApp();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchIconClick = () => {
    if (!searchExpanded) {
      setSearchExpanded(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  const handleInputBlur = () => {
    if (!searchValue) {
      setSearchExpanded(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const menuItems = [
    { label: "ทริปของฉัน", path: "/trips" },
    { label: "ที่พัก", path: "/?tab=stay" },
    { label: "ประสบการณ์", path: "/?tab=experience" },
    { label: "แพ็กเกจ", path: "/?tab=package" },
  ];

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.navContainer}>
        {/* Brand Logo (Left) */}
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoContainer}>
            <div className={styles.moonLogo}>
              <div className={styles.crescent}></div>
            </div>
            <div className={styles.brandName}>
              <h2>LUNAR</h2>
              <span>JOURNEY</span>
            </div>
          </div>
        </Link>

        {/* Hamburger Menu Icon (Mobile) */}
        <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation links (Center) */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksActive : ""}`}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || (item.path.includes("tab") && pathname === "/" && typeof window !== "undefined" && window.location.search.includes(item.path.split("=")[1]));
            return (
              <Link 
                key={index} 
                href={item.path} 
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Search, Favorites, Theme, Auth actions (Right) */}
        <div className={styles.actions}>
          {/* Global search in navbar (collapsible) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className={`${styles.searchForm} ${searchExpanded ? styles.expanded : ""}`}
            onClick={handleSearchIconClick}
          >
            <Search className={styles.searchIcon} size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ค้นหาจุดหมาย..."
              value={searchValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={styles.searchInput}
            />
          </form>

          {/* Currency */}
          <div className={styles.currency}>
            <Globe size={16} />
            <span>THB</span>
          </div>

          {/* Favorites Badge */}
          <Link href="/trips" className={styles.favoriteBadge} title="รายการโปรดของคุณ">
            <Heart size={18} className={favorites.length > 0 ? styles.heartActive : ""} />
            {favorites.length > 0 && (
              <span className={styles.badgeCount}>{favorites.length}</span>
            )}
          </Link>


          {/* User Auth Profile */}
          {user ? (
            <div className={styles.profileDropdown}>
              <div className={styles.userInfo} title={user.email}>
                <UserIcon size={16} className={styles.userIcon} />
                <span className={styles.username}>{user.username}</span>
              </div>
              <button className={styles.logoutBtn} onClick={logoutUser}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className={styles.loginBtn} onClick={() => setShowLoginModal(true)}>
              <LogIn size={16} />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </nav>
  );
};

export default Navbar;
