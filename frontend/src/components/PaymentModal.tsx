import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, CreditCard, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import styles from "./PaymentModal.module.css";

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose }) => {
  const { payBooking } = useApp();
  const [provider, setProvider] = useState<"Stripe" | "Omise">("Stripe");
  
  // Card Fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  
  // States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format card number: xxxx xxxx xxxx xxxx
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvc(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const paymentData = {
      card_number: cardNumber,
      card_holder: cardHolder,
      cvc: cvc,
      provider: provider
    };

    const res = await payBooking(booking.id, paymentData);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "ชำระเงินล้มเหลว กรุณาตรวจสอบข้อมูลบัตรและลองใหม่อีกครั้ง");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.successScreen}>
            <CheckCircle2 size={64} className={styles.successIcon} />
            <h2>ชำระเงินสำเร็จ!</h2>
            <p className={styles.successMsg}>
              การจองของคุณได้รับการยืนยันแล้ว ระบบได้ส่งข้อความยืนยันการชำระเงินไปยัง <strong>Email</strong>, <strong>SMS</strong> และ <strong>LINE Notify</strong> เรียบร้อยแล้ว
            </p>
            
            {/* Receipt Summary */}
            <div className={styles.receipt}>
              <div className={styles.receiptHeader}>
                <h3>LUNAR JOURNEY RECEIPT</h3>
                <span>เลขที่จอง #{booking.id}</span>
              </div>
              <div className={styles.receiptBody}>
                <div className={styles.receiptRow}>
                  <span>จุดหมาย:</span>
                  <strong>{booking.place_name}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>เดินทาง:</span>
                  <span>{booking.travel_date}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>ผู้เดินทาง:</span>
                  <span>{booking.guests} ท่าน</span>
                </div>
                <div className={styles.receiptDivider}></div>
                <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
                  <span>ชำระผ่าน:</span>
                  <span>{provider} Gateway</span>
                </div>
                <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
                  <span>ยอดเงินสุทธิ:</span>
                  <span className={styles.receiptPrice}>{booking.price.toLocaleString()} THB</span>
                </div>
              </div>
            </div>
            
            <button className={styles.doneBtn} onClick={onClose}>
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {/* Title */}
        <div className={styles.modalHeader}>
          <h2>ชำระเงิน (Secure Checkout)</h2>
          <p>การจองหมายเลข #{booking.id} - ยอดชำระ <strong>{booking.price.toLocaleString()} THB</strong></p>
        </div>

        {/* Providers Tab */}
        <div className={styles.providerTabs}>
          <button 
            type="button" 
            className={`${styles.providerBtn} ${provider === "Stripe" ? styles.activeProvider : ""}`}
            onClick={() => setProvider("Stripe")}
          >
            Stripe
          </button>
          <button 
            type="button" 
            className={`${styles.providerBtn} ${provider === "Omise" ? styles.activeProvider : ""}`}
            onClick={() => setProvider("Omise")}
          >
            Omise (Rabbit LINE Pay)
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Card Holder */}
          <div className={styles.inputGroup}>
            <label htmlFor="cardHolder">ชื่อบนบัตร (Cardholder Name)</label>
            <input 
              id="cardHolder"
              type="text" 
              placeholder="JOHN DOE"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              required
              className={styles.cardInput}
            />
          </div>

          {/* Card Number */}
          <div className={styles.inputGroup}>
            <label htmlFor="cardNumber">หมายเลขบัตร (Card Number)</label>
            <div className={styles.inputWrapper}>
              <CreditCard size={18} className={styles.inputIcon} />
              <input 
                id="cardNumber"
                type="text" 
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                className={styles.cardInput}
              />
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="expiry">วันหมดอายุ (MM/YY)</label>
              <input 
                id="expiry"
                type="text" 
                placeholder="12/29"
                value={expiry}
                onChange={handleExpiryChange}
                required
                className={styles.cardInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="cvc">รหัสความปลอดภัย (CVC)</label>
              <input 
                id="cvc"
                type="password" 
                placeholder="***"
                value={cvc}
                onChange={handleCvcChange}
                required
                className={styles.cardInput}
              />
            </div>
          </div>

          {/* Secure Note */}
          <div className={styles.secureBadge}>
            <ShieldCheck size={18} />
            <span>ข้อมูลการชำระเงินได้รับการเข้ารหัส ปลอดภัยตามมาตรฐาน PCI-DSS</span>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.loadingText}>
                <RefreshCw size={16} className={styles.spinner} />
                กำลังดำเนินรายการชำระเงิน...
              </span>
            ) : (
              `ชำระเงิน ${booking.price.toLocaleString()} THB`
            )}
          </button>
          
          <div className={styles.testCardInfo}>
            <p>💡 เคล็ดลับการทดสอบ: สามารถใส่บัตรเดบิต/เครดิตใดก็ได้ (16 หลัก) หากลงท้ายด้วย <strong>9999</strong> รายการจะถูกปฏิเสธ (จำลองวงเงินไม่พอ)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
