import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Heart, LogIn, LogOut, User as UserIcon, Globe } from "lucide-react";
import styles from "./Header.module.css";
import LoginModal from "./LoginModal";

interface HeaderProps {
  onSearchChange?: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  const { user, logoutUser, favorites, theme } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

  return (
    <header className={`${styles.header} glass`}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="ค้นหาจุดหมายในฝันของคุณ..."
          value={searchValue}
          onChange={handleInputChange}
          className={styles.searchInput}
        />
      </form>

      {/* Right Side Actions */}
      <div className={styles.actions}>
        {/* Currency & Language */}
        <div className={styles.langSelector}>
          <Globe size={18} className={styles.globeIcon} />
          <span>THB (฿)</span>
        </div>

        {/* Favorites Heart */}
        <div className={styles.favoriteBadge} title="รายการโปรดของคุณ">
          <Heart size={20} className={favorites.length > 0 ? styles.heartActive : ""} />
          {favorites.length > 0 && (
            <span className={styles.badgeCount}>{favorites.length}</span>
          )}
        </div>

        {/* Auth Button */}
        {user ? (
          <div className={styles.profileDropdown}>
            <div className={styles.userInfo}>
              <UserIcon size={18} className={styles.userIcon} />
              <span className={styles.username}>{user.username}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logoutUser}>
              <LogOut size={16} />
              <span>ออกระบบ</span>
            </button>
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={() => setShowLoginModal(true)}>
            <LogIn size={18} />
            <span>เข้าสู่ระบบ</span>
          </button>
        )}
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  );
};

export default Header;
