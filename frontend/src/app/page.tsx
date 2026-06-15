"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Plane, 
  Hotel, 
  Package, 
  Car, 
  Search, 
  Star, 
  Heart, 
  Play, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Users, 
  Compass, 
  Sparkles, 
  Clock, 
  CheckCircle,
  Mail,
  Send
} from "lucide-react";
import styles from "./page.module.css";
import BookingModal from "@/components/BookingModal";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const { 
    places, 
    favorites, 
    toggleFavorite, 
    searchPlaces, 
    user, 
    apiStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"flight" | "stay" | "package" | "car">("flight");
  
  // Search Fields
  const [searchFrom, setSearchFrom] = useState("กรุงเทพฯ (BKK)");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [guests, setGuests] = useState(2);
  
  // Modals
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Trigger search on tab switch
  useEffect(() => {
    searchPlaces(undefined, activeTab);
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPlaces(searchTo, activeTab);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  // Filter places for Recommended grid ( Santorini, Kyoto, Swiss Alps usually stay types)
  const recommendedPlaces = places.filter(p => p.type === activeTab).slice(0, 3);
  // If not enough matching, show any places
  const displayedRecommended = recommendedPlaces.length > 0 ? recommendedPlaces : places.slice(0, 3);

  // Filter places for Popular packages (Iceland, Maldives, NYC are package types)
  const popularPackages = places.filter(p => p.type === "package");
  const displayedPopular = popularPackages.length > 0 ? popularPackages : places.filter(p => p.type === "stay");

  return (
    <div className={styles.container}>


      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        {/* Background Image of Cappadocia */}
        <div 
          className={styles.heroBackground} 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')` }}
        ></div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            ออกเดินทางสู่โลกกว้าง<br />
            เก็บเกี่ยว<span>ช่วงเวลาที่มีค่า</span>
          </h1>
          <p className={styles.heroSubtitle}>
            ประสบการณ์การเดินทางที่ออกแบบมาเพื่อคุณ ค้นพบดีลพิเศษสำหรับที่พัก เที่ยวบิน และแพ็กเกจทัวร์ทั่วโลก
          </p>
          
          <div className={styles.heroActions}>
            <button className={`${styles.watchBtn} glass`}>
              <span className={styles.playIconContainer}><Play size={14} fill="currentColor" /></span>
              <span>ชมแรงบันดาลใจ (Watch Video)</span>
            </button>
          </div>
        </div>

        {/* Floating Card for Cappadocia */}
        <div className={`${styles.floatingCappadocia} glass`}>
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80" 
            alt="Cappadocia" 
            className={styles.cappaThumb}
          />
          <div className={styles.cappaInfo}>
            <h4>Cappadocia</h4>
            <p>Turkey</p>
            <div className={styles.cappaRating}>
              <Star size={12} fill="var(--accent)" color="var(--accent)" />
              <span>4.9 (128)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH PANEL WIDGET */}
      <section className={`${styles.searchWidget} glass`}>
        {/* Tabs Headers */}
        <div className={styles.widgetTabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === "flight" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("flight")}
          >
            <Plane size={18} />
            <span>เที่ยวบิน</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "stay" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("stay")}
          >
            <Hotel size={18} />
            <span>ที่พัก</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "package" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("package")}
          >
            <Package size={18} />
            <span>แพ็กเกจทัวร์</span>
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "car" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("car")}
          >
            <Car size={18} />
            <span>รถเช่า</span>
          </button>
        </div>

        {/* Search Form Panel */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.formGrid}>
            {/* Field 1: From */}
            <div className={styles.searchField}>
              <label>จาก (From)</label>
              <div className={styles.fieldInputWrapper}>
                <MapPin size={16} className={styles.fieldIcon} />
                <input 
                  type="text" 
                  value={searchFrom} 
                  onChange={(e) => setSearchFrom(e.target.value)}
                  placeholder="เมืองต้นทาง"
                />
              </div>
            </div>

            {/* Field 2: To */}
            <div className={styles.searchField}>
              <label>ไปยัง (To)</label>
              <div className={styles.fieldInputWrapper}>
                <MapPin size={16} className={styles.fieldIcon} />
                <input 
                  type="text" 
                  value={searchTo} 
                  onChange={(e) => setSearchTo(e.target.value)}
                  placeholder="เลือกปลายทาง หรือพิมพ์ค้นหา"
                />
              </div>
            </div>

            {/* Field 3: Date */}
            <div className={styles.searchField}>
              <label>วันที่เดินทาง</label>
              <div className={styles.fieldInputWrapper}>
                <Calendar size={16} className={styles.fieldIcon} />
                <input 
                  type="date" 
                  value={searchDate} 
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>

            {/* Field 4: Return Date */}
            <div className={styles.searchField}>
              <label>วันที่กลับ (ถ้ามี)</label>
              <div className={styles.fieldInputWrapper}>
                <Calendar size={16} className={styles.fieldIcon} />
                <input 
                  type="date" 
                  value={returnDate} 
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            {/* Field 5: Guests */}
            <div className={styles.searchField}>
              <label>ผู้โดยสาร / ผู้เข้าพัก</label>
              <div className={styles.fieldInputWrapper}>
                <Users size={16} className={styles.fieldIcon} />
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={styles.selectInput}>
                  <option value={1}>1 ผู้ใหญ่</option>
                  <option value={2}>2 ผู้ใหญ่</option>
                  <option value={3}>3 ผู้ใหญ่</option>
                  <option value={4}>4 ผู้ใหญ่</option>
                  <option value={5}>5+ ผู้ใหญ่</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button type="submit" className={styles.searchBtn} aria-label="Search button">
            <Search size={22} />
            <span>ค้นหา</span>
          </button>
        </form>
      </section>

      {/* RECOMMENDED DESTINATIONS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>ปลายทางแนะนำ (Recommended Destinations)</h2>
          <button className={styles.viewAllBtn}>ดูทั้งหมด <ArrowRight size={16} /></button>
        </div>

        <div className={styles.placesGrid}>
          {displayedRecommended.map((place) => (
            <div key={place.id} className={`${styles.placeCard} glass`}>
              <div className={styles.cardImageWrapper}>
                <img src={place.image} alt={place.name} className={styles.cardImage} />
                {/* Heart/Like Toggle */}
                <button 
                  className={styles.heartBtn} 
                  onClick={() => toggleFavorite(place.id)}
                  aria-label="Toggle favorite"
                >
                  <Heart 
                    size={18} 
                    fill={favorites.includes(place.id) ? "#ef4444" : "none"} 
                    color={favorites.includes(place.id) ? "#ef4444" : "#ffffff"} 
                  />
                </button>
                <div className={styles.placeTypeTag}>
                  {place.type === "flight" ? "Flight" : place.type === "stay" ? "Stay" : place.type === "package" ? "Tour Package" : "Car Rental"}
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3>{place.name}</h3>
                <p className={styles.cardLocation}>{place.location}, {place.country}</p>
                
                <div className={styles.cardMeta}>
                  <div className={styles.cardRating}>
                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                    <span>{place.rating.toFixed(1)}</span>
                  </div>
                  <div className={styles.cardPrice}>
                    <span>เริ่มต้นที่</span>
                    <strong>{place.price.toLocaleString()}.-</strong>
                    <span>THB</span>
                  </div>
                </div>
                
                <button 
                  className={styles.bookBtn} 
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                    } else {
                      setSelectedPlace(place);
                    }
                  }}
                >
                  จองเที่ยวบิน / ที่พักนี้
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES BAR & PROMO CARD */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={`${styles.featureItem} glass`}>
            <div className={styles.featureIcon}>
              <Sparkles size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>คัดสรรอย่างพิถีพิถัน</h4>
              <p>เราคัดสรรทุกการเดินทางด้วยมาตรฐานระดับโลก</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className={`${styles.featureItem} glass`}>
            <div className={styles.featureIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>ดูแลตลอดการเดินทาง</h4>
              <p>ทีมงานมืออาชีพพร้อมดูแลคุณตลอด 24 ชั่วโมง</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className={`${styles.featureItem} glass`}>
            <div className={styles.featureIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>จองง่าย มั่นใจได้</h4>
              <p>ระบบการจองปลอดภัย ยกเลิกได้ตามเงื่อนไข</p>
            </div>
          </div>
        </div>

        {/* New Member Promo Card */}
        <div className={`${styles.promoCard} glass`} onClick={() => !user && setShowLoginModal(true)}>
          <div className={styles.promoContent}>
            <span>สมาชิกใหม่</span>
            <h3>รับส่วนลดทันที 1,000 บาท</h3>
            <p>สมัครสมาชิกฟรีวันนี้ เพื่อรับข้อเสนอและดีลสุดพิเศษเฉพาะคุณเท่านั้น</p>
            <button className={styles.promoBtn}>สมัครสมาชิกฟรี <ArrowRight size={16} /></button>
          </div>
          <div className={styles.promoImageWrapper}>
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" alt="Promo User" />
          </div>
        </div>
      </section>

      {/* POPULAR PACKAGES */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>แพ็กเกจยอดนิยม (Popular Packages)</h2>
          <button className={styles.viewAllBtn}>ดูทั้งหมด <ArrowRight size={16} /></button>
        </div>

        <div className={styles.placesGrid}>
          {displayedPopular.slice(0, 3).map((place) => (
            <div key={place.id} className={`${styles.packageCard} glass`}>
              <div className={styles.packageImageWrapper}>
                <img src={place.image} alt={place.name} />
                <button 
                  className={styles.heartBtn} 
                  onClick={() => toggleFavorite(place.id)}
                  aria-label="Toggle favorite"
                >
                  <Heart 
                    size={18} 
                    fill={favorites.includes(place.id) ? "#ef4444" : "none"} 
                    color={favorites.includes(place.id) ? "#ef4444" : "#ffffff"} 
                  />
                </button>
              </div>
              <div className={styles.packageContent}>
                <div className={styles.packageBadge}>แพ็กเกจทัวร์ยอดนิยม</div>
                <h3>{place.name}</h3>
                <p>{place.description}</p>
                <div className={styles.packageFooter}>
                  <div className={styles.packageRating}>
                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                    <span>{place.rating.toFixed(1)}</span>
                  </div>
                  <div className={styles.packagePrice}>
                    <span>เริ่มต้น</span>
                    <strong>{place.price.toLocaleString()}.-</strong>
                    <span>THB</span>
                  </div>
                </div>
                <button 
                  className={styles.bookBtn}
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                    } else {
                      setSelectedPlace(place);
                    }
                  }}
                >
                  จองแพ็กเกจทัวร์นี้
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER SIGNUP */}
      <section className={`${styles.newsletterSection} glass`}>
        <div className={styles.newsContent}>
          <h2>รับแรงบันดาลใจการเดินทางใหม่ๆ</h2>
          <p>อัปเดตโปรโมชั่นและปลายทางสุดพิเศษก่อนใคร สมัครรับจดหมายข่าวของ Lunar Journey</p>
          
          {newsletterSubscribed ? (
            <div className={styles.newsletterSuccess}>
              <CheckCircle size={20} />
              <span>ลงทะเบียนสมัครรับข้อมูลสำเร็จ! ขอบคุณที่ร่วมเดินทางกับเรา</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
              <div className={styles.newsInputWrapper}>
                <Mail size={18} />
                <input 
                  type="email" 
                  placeholder="กรอกอีเมลของคุณ..." 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.newsBtn} aria-label="Subscribe to newsletter">
                <Send size={16} />
                <span>รับข่าวสาร</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* OVERLAY MODALS */}
      {selectedPlace && (
        <BookingModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
