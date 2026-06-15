"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Briefcase
} from "lucide-react";
import styles from "./page.module.css";
import NotificationFeed from "@/components/NotificationFeed";
import PaymentModal from "@/components/PaymentModal";
import LoginModal from "@/components/LoginModal";

export default function TripsPage() {
  const { user, token, fetchUserBookings } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadBookings = async () => {
    if (token) {
      setLoading(true);
      const data = await fetchUserBookings();
      setBookings(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Reload bookings after successful payment modal is closed
  const handleClosePayment = () => {
    setSelectedBookingForPayment(null);
    loadBookings();
  };

  if (!token) {
    return (
      <div className={styles.unauthorized}>
        <Briefcase size={64} className={styles.icon} />
        <h2>กรุณาเข้าสู่ระบบเพื่อดูทริปของคุณ</h2>
        <p>คุณสามารถบันทึกประวัติการจอง ตั๋วเดินทาง และใบเสร็จรับเงินทั้งหมดได้ในที่เดียว</p>
        <button className={styles.loginBtn} onClick={() => setShowLoginModal(true)}>
          เข้าสู่ระบบ (Login)
        </button>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className={styles.pageHeader}>
        <h1>ทริปและการเดินทางของฉัน (My Trips)</h1>
        <p>จัดการการจอง ตรวจสอบสถานะการจ่ายเงิน และดูบันทึกประวัติการติดต่อ</p>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Side: Bookings List */}
        <div className={styles.bookingsSection}>
          <h2>รายการจองของคุณ ({bookings.length})</h2>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>กำลังโหลดข้อมูลการจอง...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className={`${styles.emptyState} glass`}>
              <Briefcase size={48} />
              <h3>ยังไม่มีรายการจองการเดินทาง</h3>
              <p>เริ่มต้นวางแผนการท่องเที่ยวครั้งใหม่ เลือกค้นหาเที่ยวบิน ที่พัก และแพ็กเกจทัวร์สุดพิเศษได้ที่หน้าหลัก</p>
              <a href="/" className={styles.exploreLink}>สำรวจดีลท่องเที่ยว <ArrowRight size={16} /></a>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking.id} className={`${styles.bookingCard} glass`}>
                  <div className={styles.bookingImageWrapper}>
                    <img src={booking.image} alt={booking.place_name} />
                  </div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.cardHeader}>
                      <span className={styles.bookingType}>
                        {booking.type === "flight" ? "Flight" : booking.type === "stay" ? "Stay" : booking.type === "package" ? "Tour Package" : "Car Rental"}
                      </span>
                      {/* Status Badges */}
                      <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>
                        {booking.status === "Paid" ? <CheckCircle2 size={12} /> : booking.status === "Pending" ? <Clock size={12} /> : <AlertTriangle size={12} />}
                        {booking.status === "Paid" ? "ชำระเงินแล้ว" : booking.status === "Pending" ? "รอชำระเงิน" : "ยกเลิก"}
                      </span>
                    </div>
                    
                    <h3>{booking.place_name}</h3>
                    <p className={styles.location}>{booking.location}, {booking.country}</p>
                    
                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>เดินทาง: {booking.travel_date} {booking.return_date ? `ถึง ${booking.return_date}` : ""}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={14} />
                        <span>จำนวน: {booking.guests} ท่าน</span>
                      </div>
                    </div>
                    
                    <div className={styles.cardFooter}>
                      <div className={styles.priceInfo}>
                        <span>ราคารวมทั้งสิ้น:</span>
                        <strong>{booking.price.toLocaleString()} THB</strong>
                      </div>
                      
                      {booking.status === "Pending" && (
                        <button 
                          className={styles.payNowBtn}
                          onClick={() => setSelectedBookingForPayment(booking)}
                        >
                          <CreditCard size={14} />
                          <span>ชำระเงินตอนนี้</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Notification Logs Feed */}
        <div className={styles.sidebarSection}>
          <NotificationFeed />
        </div>
      </div>

      {/* Payment Modal overlay */}
      {selectedBookingForPayment && (
        <PaymentModal 
          booking={selectedBookingForPayment} 
          onClose={handleClosePayment} 
        />
      )}
    </div>
  );
}
