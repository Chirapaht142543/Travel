import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { X, Search, Plane, Hotel, Package, Car } from "lucide-react";
import styles from "./SearchModal.module.css";

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const { searchPlaces } = useApp();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"flight" | "stay" | "package" | "car">("flight");
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input field when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchPlaces(query, selectedType);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <h3>ค้นหาจุดหมายการเดินทางของคุณ</h3>
        <p className={styles.subtitle}>ค้นหาและกรองดีลพิเศษสำหรับเที่ยวบิน ที่พัก แพ็กเกจทัวร์ หรือรถเช่า</p>

        {/* Categories Tab selector */}
        <div className={styles.categoriesTab}>
          <button 
            type="button" 
            className={`${styles.tabBtn} ${selectedType === "flight" ? styles.activeTab : ""}`}
            onClick={() => setSelectedType("flight")}
          >
            <Plane size={16} />
            <span>เที่ยวบิน</span>
          </button>
          <button 
            type="button" 
            className={`${styles.tabBtn} ${selectedType === "stay" ? styles.activeTab : ""}`}
            onClick={() => setSelectedType("stay")}
          >
            <Hotel size={16} />
            <span>ที่พัก</span>
          </button>
          <button 
            type="button" 
            className={`${styles.tabBtn} ${selectedType === "package" ? styles.activeTab : ""}`}
            onClick={() => setSelectedType("package")}
          >
            <Package size={16} />
            <span>แพ็กเกจทัวร์</span>
          </button>
          <button 
            type="button" 
            className={`${styles.tabBtn} ${selectedType === "car" ? styles.activeTab : ""}`}
            onClick={() => setSelectedType("car")}
          >
            <Car size={16} />
            <span>รถเช่า</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="พิมพ์จุดหมายปลายทาง ประเทศ หรือคำค้นหา..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className={styles.searchInput}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className={styles.submitBtn}>
              <Search size={16} />
              <span>ค้นหาตอนนี้</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchModal;
