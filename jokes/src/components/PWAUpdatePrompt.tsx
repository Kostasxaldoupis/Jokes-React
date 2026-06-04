import { useState, useEffect } from 'react'

const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowPrompt(true)
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker)
                setShowPrompt(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!showPrompt) return null

  return (
    <div className="pwa-update-prompt">
      <span>🔄 New version available!</span>
      <button onClick={updateApp}>Update Now</button>
      <button onClick={() => setShowPrompt(false)}>Later</button>
    </div>
  )
}

export default PWAUpdatePrompt