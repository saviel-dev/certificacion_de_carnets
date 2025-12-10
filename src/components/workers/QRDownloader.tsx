import { QRCodeSVG } from 'qrcode.react';
import { Worker, QRCode } from '@/types/worker';

export function downloadQRCode(worker: Worker, qr: QRCode) {
  const verificationUrl = `${window.location.origin}/verify/${qr.token}`;
  
  // Create a temporary canvas
  const canvas = document.createElement('canvas');
  const size = 400;
  const padding = 40;
  const totalSize = size + padding * 2;
  
  canvas.width = totalSize;
  canvas.height = totalSize + 80;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create QR code as data URL
  const qrCanvas = document.createElement('canvas');
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const qrCodeSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="white"/>
    </svg>
  `;
  
  // Use canvas-based QR generation
  const QRCode = require('qrcode');
  
  QRCode.toCanvas(qrCanvas, verificationUrl, {
    width: size,
    margin: 0,
    color: {
      dark: '#1a6b47',
      light: '#ffffff',
    },
  }, (error: Error) => {
    if (error) {
      console.error(error);
      return;
    }
    
    // Draw QR code on main canvas
    ctx.drawImage(qrCanvas, padding, padding);
    
    // Add text
    ctx.fillStyle = '#1a6b47';
    ctx.font = 'bold 18px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${worker.first_name} ${worker.last_name}`, totalSize / 2, totalSize + 30);
    
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(worker.internal_id, totalSize / 2, totalSize + 55);
    
    // Download
    const link = document.createElement('a');
    link.download = `QR_${worker.internal_id}_${worker.last_name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    document.body.removeChild(tempDiv);
  });
}

interface QRPreviewProps {
  token: string;
  size?: number;
}

export function QRPreview({ token, size = 200 }: QRPreviewProps) {
  const verificationUrl = `${window.location.origin}/verify/${token}`;
  
  return (
    <div className="rounded-xl bg-card p-4 shadow-md">
      <QRCodeSVG
        value={verificationUrl}
        size={size}
        level="H"
        includeMargin
        fgColor="hsl(152, 69%, 35%)"
        bgColor="#ffffff"
      />
    </div>
  );
}
