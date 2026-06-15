import React from "react";
import { useApp } from "@/context/AppContext";
import { Mail, MessageSquare, Bell, ArrowRight } from "lucide-react";
import styles from "./NotificationFeed.module.css";

const NotificationFeed: React.FC = () => {
  const { notifications } = useApp();

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className={`${styles.feedContainer} glass`}>
      <div className={styles.feedHeader}>
        <div className={styles.titleWrapper}>
          <Bell size={18} className={styles.bellIcon} />
          <h3>การแจ้งเตือนจำลอง (Notification Logger)</h3>
        </div>
        <span className={styles.liveIndicator}>Live Logs</span>
      </div>

      <div className={styles.logsList}>
        {notifications.length === 0 ? (
          <div className={styles.emptyLogs}>
            <p>ยังไม่มีทราฟฟิกการแจ้งเตือน</p>
            <span>เมื่อทำการจองหรือชำระเงิน ระบบจะส่งอีเมล SMS และ LINE Notify และประวัติจะปรากฏขึ้นที่นี่</span>
          </div>
        ) : (
          notifications.map((log, index) => (
            <div key={index} className={styles.logCard}>
              <div className={styles.logTime}>
                <span>{formatTime(log.timestamp)}</span>
              </div>
              <div className={styles.logContent}>
                <h4>{log.title}</h4>
                <p>{log.message}</p>
                
                {/* Channels Badge list */}
                <div className={styles.channelsList}>
                  {log.channels.email && (
                    <span className={`${styles.channelBadge} ${styles.email}`}>
                      <Mail size={11} />
                      Email ส่งแล้ว
                    </span>
                  )}
                  {log.channels.sms && (
                    <span className={`${styles.channelBadge} ${styles.sms}`}>
                      <MessageSquare size={11} />
                      SMS ส่งแล้ว
                    </span>
                  )}
                  {log.channels.line && (
                    <span className={`${styles.channelBadge} ${styles.line}`}>
                      LINE Notify ส่งแล้ว
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationFeed;
