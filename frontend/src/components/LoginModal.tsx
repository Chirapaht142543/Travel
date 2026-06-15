import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { loginUser, registerUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLogin) {
      const res = await loginUser(username, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      }
    } else {
      if (!email) {
        setError("กรุณากรอกอีเมล");
        setLoading(false);
        return;
      }
      const res = await registerUser(username, email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่");
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {/* Tab Headers */}
        <div className={styles.tabHeaders}>
          <button 
            className={`${styles.tabBtn} ${isLogin ? styles.activeTab : ""}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            เข้าสู่ระบบ (Login)
          </button>
          <button 
            className={`${styles.tabBtn} ${!isLogin ? styles.activeTab : ""}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            สมัครสมาชิก (Register)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Username */}
          <div className={styles.inputGroup}>
            <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input 
                id="username"
                type="text" 
                placeholder="กรอกชื่อผู้ใช้งาน" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="email">อีเมล (Email)</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  id="email"
                  type="email" 
                  placeholder="example@lunarjourney.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">รหัสผ่าน (Password)</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="กรอกรหัสผ่านของคุณ" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "กำลังดำเนินการ..." : isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>

          {/* Hint for quick login */}
          {isLogin && (
            <div className={styles.quickLoginHint}>
              <p>ทดสอบด่วน: <strong>lunar_traveler</strong> / <strong>password123</strong></p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
