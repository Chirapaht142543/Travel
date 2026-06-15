import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Calendar, Users, Info, Star } from "lucide-react";
import styles from "./BookingModal.module.css";
import PaymentModal from "./PaymentModal";

interface BookingModalProps {
  place: any;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ place, onClose }) => {
  const { createBooking } = useApp();
  const [travelDate, setTravelDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  const handleIncrementGuests = () => {
    if (guests < place.capacity) {
      setGuests(guests + 1);
    }
  };

  const handleDecrementGuests = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!travelDate) {
      setError("กรุณาเลือกวันที่เดินทาง");
      setLoading(false);
      return;
    }

    const res = await createBooking(place.id, travelDate, returnDate || undefined, guests);
    if (res.success && res.booking) {
      setSuccessBooking(res.booking);
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
    }
    setLoading(false);
  };

  // If successfully created booking, transition to payment
  if (successBooking) {
    return (
      <PaymentModal 
        booking={successBooking} 
        onClose={onClose} 
      />
    );
  }

  const totalPrice = place.price * guests;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header Place details */}
        <div className={styles.headerInfo}>
          <span className={styles.placeType}>{place.type === "flight" ? "เที่ยวบิน (Flight)" : place.type === "stay" ? "ที่พัก (Stay)" : place.type === "package" ? "แพ็กเกจทัวร์ (Package)" : "รถเช่า (Car Rental)"}</span>
          <h2>{place.name}</h2>
          <p className={styles.location}>{place.location}, {place.country}</p>
          <div className={styles.rating}>
            <Star size={16} fill="var(--accent)" color="var(--accent)" />
            <span>{place.rating.toFixed(1)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Date Picker */}
          <div className={styles.inputGroup}>
            <label htmlFor="travelDate">
              <Calendar size={16} className={styles.labelIcon} />
              <span>วันที่เดินทาง (Departure Date)</span>
            </label>
            <input
              id="travelDate"
              type="date"
              value={travelDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setTravelDate(e.target.value)}
              required
              className={styles.dateInput}
            />
          </div>

          {/* Return Date (optional) */}
          {(place.type === "stay" || place.type === "flight" || place.type === "car") && (
            <div className={styles.inputGroup}>
              <label htmlFor="returnDate">
                <Calendar size={16} className={styles.labelIcon} />
                <span>วันที่กลับ (Return Date)</span>
              </label>
              <input
                id="returnDate"
                type="date"
                value={returnDate}
                min={travelDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setReturnDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          )}

          {/* Guests Count */}
          <div className={styles.inputGroup}>
            <label>
              <Users size={16} className={styles.labelIcon} />
              <span>จำนวนผู้เดินทาง (Guests / Quantity)</span>
            </label>
            <div className={styles.guestsCounter}>
              <button 
                type="button" 
                onClick={handleDecrementGuests} 
                disabled={guests <= 1}
                className={styles.counterBtn}
              >
                -
              </button>
              <span className={styles.guestsVal}>{guests}</span>
              <button 
                type="button" 
                onClick={handleIncrementGuests} 
                disabled={guests >= place.capacity}
                className={styles.counterBtn}
              >
                +
              </button>
              <span className={styles.capacityHint}>สูงสุด {place.capacity} ท่าน</span>
            </div>
          </div>

          {/* Capacity warning */}
          <div className={styles.infoBox}>
            <Info size={16} />
            <p>ราคานี้ได้รับการคุ้มครองด้วยการจองที่ปลอดภัย หากยกเลิกตามนโยบายจะได้เงินคืนเต็มจำนวน</p>
          </div>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Price Computation Summary */}
          <div className={styles.priceSummary}>
            <div className={styles.priceRow}>
              <span>{place.price.toLocaleString()} THB x {guests} คน</span>
              <span>{totalPrice.toLocaleString()} THB</span>
            </div>
            <div className={`${styles.priceRow} ${styles.totalRow}`}>
              <span>ราคารวมทั้งสิ้น (Total)</span>
              <span className={styles.totalPrice}>{totalPrice.toLocaleString()} THB</span>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "กำลังดำเนินการ..." : "ยืนยันการจอง & ไปที่การชำระเงิน"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
