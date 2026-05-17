import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize with sample notifications
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        type: "internship",
        title: "New Internship Posted",
        message: "Google has posted a new Software Engineer internship",
        time: "2 minutes ago",
        read: false,
        link: "/browse"
      },
      {
        id: 2,
        type: "update",
        title: "Application Update",
        message: "Your application for Microsoft has been viewed",
        time: "1 hour ago",
        read: false,
        link: "/my-applications"
      },
      {
        id: 3,
        type: "match",
        title: "New Match Found",
        message: "You matched with Amazon for Data Analyst role",
        time: "3 hours ago",
        read: true,
        link: "/my-matches"
      }
    ];
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      time: "Just now",
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
