import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null)
  const elementIdRef = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  const stopCameraTracks = () => {
    try {
      const container = document.getElementById(elementIdRef.current)
      if (container) {
        const videos = container.querySelectorAll('video')
        videos.forEach((video) => {
          if (video.srcObject && typeof video.srcObject.getTracks === 'function') {
            video.srcObject.getTracks().forEach((track) => track.stop())
            video.srcObject = null
          }
        })
        container.innerHTML = ''
      }
      // Global fallback to ensure no video track stays alive
      const globalVideos = document.querySelectorAll('video')
      globalVideos.forEach((video) => {
        if (video.srcObject && typeof video.srcObject.getTracks === 'function') {
          video.srcObject.getTracks().forEach((track) => track.stop())
          video.srcObject = null
        }
      })
    } catch (err) {
      console.warn('Direct media track stop error:', err)
    }
  }

  const stopScanner = async () => {
    stopCameraTracks()

    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.warn('Error stopping Html5Qrcode:', err)
      }
      try {
        scannerRef.current.clear()
      } catch (err) {
        console.warn('Error clearing Html5Qrcode container:', err)
      }
      scannerRef.current = null
    }

    stopCameraTracks()
  }

  useEffect(() => {
    let isMounted = true
    stopCameraTracks()

    const scanner = new Html5Qrcode(elementIdRef.current)
    scannerRef.current = scanner

    const startScanner = async () => {
      try {
        setScanning(true)

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (isMounted) {
              try {
                onScan(decodedText)
              } catch (err) {
                console.error('Error in onScan callback:', err)
              }
            }
            try {
              await stopScanner()
            } catch (err) {
              console.warn('Error in stopScanner after scan:', err)
            }
          },
          () => {}
        )

        if (!isMounted) {
          await stopScanner()
        }
      } catch (err) {
        console.error('QR scanner error:', err)
        if (isMounted) {
          setError(
            'Unable to access camera. Please allow camera permission and try again.'
          )
          setScanning(false)
        }
      }
    }

    const timer = setTimeout(() => {
      startScanner()
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timer)
      stopScanner()
    }
  }, [onScan])

  const handleClose = async () => {
    stopCameraTracks()
    await stopScanner()
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        stopCameraTracks()
        await stopScanner()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onClose])

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📷</span> Scan Medicine QR Code
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Point your camera at the medicine QR code
            </p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-xl bg-rose-600/20 border border-rose-500/40 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
            title="Close Scanner"
          >
            ✕ Close
          </button>
        </div>

        <div
          id={elementIdRef.current}
          className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 min-h-[260px]"
        />

        {scanning && !error && (
          <p className="text-center text-sm font-semibold text-cyan-400 animate-pulse">
            📷 Camera active — Searching for QR code...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>✕</span> Stop Camera & Close Scanner
        </button>
      </div>
    </div>
  )
}

export default QRScanner