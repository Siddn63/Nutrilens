import React, { useEffect, useRef } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';

const QrScanner = ({ onScanSuccess, onCancel }) => {
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  const qrCodeRegionId = 'html5qr-code-full-region';

  useEffect(() => {
    let isMounted = true;

    hasScannedRef.current = false;

    const scanner = new Html5Qrcode(qrCodeRegionId);

    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();

        if (!isMounted) return;

        if (!cameras || cameras.length === 0) {
          console.error('No camera found');
          return;
        }

        console.log('Available cameras:', cameras);

        // Prefer rear camera when available
        const rearCamera = cameras.find((camera) =>
          /back|rear|environment/i.test(camera.label)
        );

        const camera = rearCamera || cameras[0];

        await scanner.start(
          camera.id,

          {
            fps: 10,

            // Large enough for normal product barcodes
            qrbox: {
              width: 400,
              height: 220,
            },

            aspectRatio: 1.777778,

            disableFlip: false,

            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.ITF,
            ],
          },

          async (decodedText) => {
            if (!isMounted) return;

            if (hasScannedRef.current) return;

            const barcode = String(decodedText || '').trim();

            if (!barcode) return;

            hasScannedRef.current = true;

            console.log('================================');
            console.log('BARCODE DETECTED:', barcode);
            console.log('================================');

            try {
              await scanner.stop();
            } catch (error) {
              console.log('Scanner stop:', error);
            }

            try {
              await scanner.clear();
            } catch (error) {
              console.log('Scanner clear:', error);
            }

            if (isMounted) {
              onScanSuccess(barcode);
            }
          },

          () => {
            // This is called repeatedly while no barcode is detected.
            // Do nothing here.
          }
        );

        console.log('Barcode scanner started successfully');
      } catch (error) {
        console.error(
          'Failed to start barcode scanner:',
          error
        );
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      const cleanup = async () => {
        const scanner = scannerRef.current;

        if (!scanner) return;

        try {
          const state = scanner.getState();

          // 2 = SCANNING
          // 3 = PAUSED
          if (state === 2 || state === 3) {
            await scanner.stop();
          }
        } catch (error) {
          console.log(
            'Scanner cleanup stop:',
            error
          );
        }

        try {
          await scanner.clear();
        } catch (error) {
          console.log(
            'Scanner cleanup clear:',
            error
          );
        }

        scannerRef.current = null;
      };

      cleanup();
    };
  }, [onScanSuccess, onCancel]);

  const handleCancel = async () => {
    const scanner = scannerRef.current;

    if (scanner) {
      try {
        const state = scanner.getState();

        if (state === 2 || state === 3) {
          await scanner.stop();
        }
      } catch (error) {
        console.log(
          'Cancel scanner stop:',
          error
        );
      }

      try {
        await scanner.clear();
      } catch (error) {
        console.log(
          'Cancel scanner clear:',
          error
        );
      }

      scannerRef.current = null;
    }

    onCancel();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* CAMERA */}
      <div className="relative w-full max-w-lg">

        <div
          id={qrCodeRegionId}
          className="w-full overflow-hidden rounded-xl bg-black"
        />

        {/* SCANNING BOX */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

          <div
            className="border-4 border-green-400 rounded-lg"
            style={{
              width: '400px',
              height: '220px',
              maxWidth: '90%',
            }}
          />

        </div>

      </div>

      {/* INSTRUCTIONS */}
      <div className="text-center">

        <p className="text-gray-200 text-sm">
          Place the product barcode inside the green box
        </p>

        <p className="text-gray-400 text-xs mt-2">
          Keep the barcode straight and clearly visible
        </p>

      </div>

      {/* CANCEL */}
      <button
        type="button"
        onClick={handleCancel}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
      >
        Cancel
      </button>

    </div>
  );
};

export default QrScanner;