'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      // For WebKit browsers
      if (window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }

      // For Chrome/Edge
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled && localStorage.getItem('installPromptDismissed') !== 'true') {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt (don't show again for 7 days)
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem('installPromptDismissed', 'true');
    localStorage.setItem('installPromptDismissedUntil', dismissedUntil.toISOString());
  };

  // Check if dismissal period has expired
  useEffect(() => {
    const dismissedUntilStr = localStorage.getItem('installPromptDismissedUntil');
    if (dismissedUntilStr) {
      const dismissedUntil = new Date(dismissedUntilStr);
      if (new Date() > dismissedUntil) {
        localStorage.removeItem('installPromptDismissed');
        localStorage.removeItem('installPromptDismissedUntil');
      }
    }
  }, []);

  // Don't show prompt if app is already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <Download className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Install Keuangan Keluarga
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Akses lebih cepat dari layar utama
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="flex-1 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Install
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-xs"
          >
            Tidak Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}