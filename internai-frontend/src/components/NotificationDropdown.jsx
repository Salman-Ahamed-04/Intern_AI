import { useNotifications } from "../store/notifications";
import { Bell, X, Check, CheckCheck, Briefcase, AlertCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "internship":
        return <Briefcase size={14} />;
      case "update":
        return <AlertCircle size={14} />;
      case "match":
        return <Heart size={14} />;
      default:
        return <Bell size={14} />;
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 8,
        width: 320,
        maxHeight: 400,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface-secondary)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={16} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "var(--primary)",
                color: "white",
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 10,
                fontWeight: 600
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {unreadCount > 0 && (
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 6px" }}
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 6px" }}
              onClick={clearAll}
              title="Clear all"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div
        style={{
          maxHeight: 320,
          overflowY: "auto",
          padding: notifications.length === 0 ? "20px" : 0
        }}
      >
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13
            }}
          >
            <Bell size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: notification.read ? "transparent" : "var(--surface-secondary)",
                transition: "background 0.15s",
                display: "flex",
                gap: 12,
                alignItems: "flex-start"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.read ? "transparent" : "var(--surface-secondary)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: notification.read ? "var(--border)" : "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: notification.read ? "var(--text-muted)" : "white",
                  flexShrink: 0
                }}
              >
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: notification.read ? 400 : 600,
                    marginBottom: 2,
                    color: "var(--text-primary)"
                  }}
                >
                  {notification.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                    lineHeight: 1.4
                  }}
                >
                  {notification.message}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {notification.time}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {!notification.read && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "2px 4px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    <Check size={12} />
                  </button>
                )}
                <button
                  className="btn btn-ghost"
                  style={{ padding: "2px 4px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notification.id);
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
