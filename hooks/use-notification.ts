"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported("Notification" in window)
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false
    
    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      return permission === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return
    
    try {
      new Notification(title, options)
    } catch (error) {
      console.error("Error showing notification:", error)
      // Fallback to toast if notification fails
      toast({
        title,
        description: options?.body,
      })
    }
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  }
}