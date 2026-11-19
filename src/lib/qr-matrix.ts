import QRCode from "qrcode";

export interface QrMatrix {
  size: number;
  isDark: (row: number, col: number) => boolean;
}

/**
 * Generates an ISO-18004 scannable QR code module matrix encoding the
 * member's unique XOR-26-XXXX pass ID.
 */
export function buildQrMatrix(payload: string): QrMatrix {
  const normalized = payload.trim() || "XOR-26-0000";
  const qr = QRCode.create(normalized, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const data = qr.modules.data;

  return {
    size,
    isDark: (row: number, col: number) => {
      if (row < 0 || col < 0 || row >= size || col >= size) return false;
      return Boolean(data[row * size + col]);
    },
  };
}
