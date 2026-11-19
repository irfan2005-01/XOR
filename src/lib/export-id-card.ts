import { getMemberInitials } from "@/lib/avatar-upload";
import { computePassBarcodeBars, formatIssueDate } from "@/lib/member-id";
import { buildQrMatrix } from "@/lib/qr-matrix";
import { formatMemberRoleLabel, type PublicMember } from "@/types/portal";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

interface LoadedAvatar {
  img: HTMLImageElement;
  blobUrl: string | null;
}

async function loadAvatarImage(url: string): Promise<LoadedAvatar | null> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ img, blobUrl: null });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Load through Next.js avatar proxy to eliminate cross-origin canvas tainting
  try {
    const proxyEndpoint = `/api/avatar-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyEndpoint);
    if (!res.ok) {
      throw new Error(`Proxy error ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    return await new Promise<LoadedAvatar | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ img, blobUrl });
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };
      img.src = blobUrl;
    });
  } catch {
    return await new Promise<LoadedAvatar | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve({ img, blobUrl: null });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

/**
 * Renders the member's Virtual XOR ID Card at 2x resolution (2080x1280)
 * in the monochrome Deep Space palette (#0A0A0E surface, border-white/20, #FFFFFF text,
 * white-on-black monogram fallback) including the proxied student portrait,
 * scannable QR code, and verification barcode, then triggers a PNG download.
 */
export async function exportIdCardAsPng(member: PublicMember): Promise<void> {
  const logicalWidth = 1040;
  const logicalHeight = 640;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  ctx.scale(scale, scale);

  // Outer card background (#0D0E14 Elevated Obsidian Surface)
  drawRoundedRect(ctx, 0, 0, logicalWidth, logicalHeight, 32);
  ctx.fillStyle = "#0D0E14";
  ctx.fill();

  // Subtle ambient Light Orange & Electric Sky highlight
  const radial = ctx.createRadialGradient(840, 140, 20, 840, 140, 540);
  radial.addColorStop(0, "rgba(251, 146, 60, 0.12)");
  radial.addColorStop(0.5, "rgba(56, 189, 248, 0.05)");
  radial.addColorStop(1, "rgba(13, 14, 20, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Subtle Geometric 'X' Architectural Watermark
  ctx.save();
  const wmCenterX = 835;
  const wmCenterY = 305;
  const wmSpanX = 130;
  const wmSpanY = 148;

  ctx.lineWidth = 34;
  ctx.lineCap = "butt";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.beginPath();
  ctx.moveTo(wmCenterX - wmSpanX, wmCenterY - wmSpanY);
  ctx.lineTo(wmCenterX + wmSpanX, wmCenterY + wmSpanY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.beginPath();
  ctx.moveTo(wmCenterX + wmSpanX, wmCenterY - wmSpanY);
  ctx.lineTo(wmCenterX - wmSpanX, wmCenterY + wmSpanY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    wmCenterX - wmSpanX - 24,
    wmCenterY - wmSpanY - 12,
    (wmSpanX + 24) * 2,
    (wmSpanY + 12) * 2
  );
  ctx.restore();

  // Outer Hairline Rim (border-white/20)
  drawRoundedRect(ctx, 2, 2, logicalWidth - 4, logicalHeight - 4, 30);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Top divider line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 118);
  ctx.lineTo(logicalWidth - 56, 118);
  ctx.stroke();

  // Header Left: XOR • LAEC BIDAR
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 24px 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("XOR  •  LAEC BIDAR", 56, 78);

  // Header Right: Role Tag
  ctx.font = "600 18px 'JetBrains Mono', monospace";
  const roleText = formatMemberRoleLabel(member.role);
  const badgeMetrics = ctx.measureText(roleText);
  const badgeW = badgeMetrics.width + 40;
  const badgeX = logicalWidth - 56 - badgeW;
  drawRoundedRect(ctx, badgeX, 46, badgeW, 44, 8);
  ctx.fillStyle = "rgba(251, 146, 60, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(251, 146, 60, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#FB923C";
  ctx.fillText(roleText, badgeX + 20, 74);

  // Framed Rounded-Square Portrait (left side of body)
  const avatarX = 56;
  const avatarY = 158;
  const avatarSize = 188;

  ctx.save();
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 22);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.clip();

  const avatarResult = member.avatarUrl
    ? await loadAvatarImage(member.avatarUrl)
    : null;

  try {
    const avatarImg = avatarResult?.img;
    if (avatarImg && avatarImg.naturalWidth > 0 && avatarImg.naturalHeight > 0) {
      const srcSide = Math.min(avatarImg.naturalWidth, avatarImg.naturalHeight);
      const sx = (avatarImg.naturalWidth - srcSide) / 2;
      const sy = (avatarImg.naturalHeight - srcSide) / 2;
      ctx.drawImage(
        avatarImg,
        sx,
        sy,
        srcSide,
        srcSide,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 62px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        getMemberInitials(member.fullName),
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2 + 2
      );
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
  } finally {
    if (avatarResult?.blobUrl) {
      URL.revokeObjectURL(avatarResult.blobUrl);
    }
  }
  ctx.restore();

  // Subtle border-white/25 Portrait Frame
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 22);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Member Details to the right of portrait
  const infoX = 278;

  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 16px 'JetBrains Mono', monospace";
  ctx.fillText("STUDENT MEMBER", infoX, 184);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 42px 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(member.fullName, infoX, 236, 480);

  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 22px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(member.branchSemester, infoX, 276, 480);

  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 15px 'JetBrains Mono', monospace";
  ctx.fillText("COLLEGE USN", infoX, 326);
  ctx.fillText("ISSUED", infoX + 230, 326);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 20px 'JetBrains Mono', monospace";
  ctx.fillText(member.usn, infoX, 356);
  ctx.fillText(formatIssueDate(member.joinedAt), infoX + 230, 356);

  // Scannable QR Code on right side of card
  const qr = buildQrMatrix(member.id);
  const qrBoxSize = 188;
  const qrBoxX = logicalWidth - 56 - qrBoxSize;
  const qrBoxY = 158;

  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const qrPad = 18;
  const cellSize = (qrBoxSize - qrPad * 2) / qr.size;
  ctx.fillStyle = "#FFFFFF";
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          qrBoxX + qrPad + c * cellSize,
          qrBoxY + qrPad + r * cellSize,
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }

  // Bottom Divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 428);
  ctx.lineTo(logicalWidth - 56, 428);
  ctx.stroke();

  // Prominent Unique ID (XOR-26-XXXX)
  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 15px 'JetBrains Mono', monospace";
  ctx.fillText("UNIQUE MEMBER ID", 56, 470);

  drawRoundedRect(ctx, 56, 486, 310, 68, 12);
  ctx.fillStyle = "#050507";
  ctx.fill();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#38BDF8";
  ctx.font = "700 36px 'JetBrains Mono', monospace";
  ctx.fillText(member.id, 78, 533);

  // College Seal
  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 14px 'JetBrains Mono', monospace";
  ctx.fillText("LINGARAJ APPA ENGINEERING COLLEGE, BIDAR", 56, 594);

  // Crisp Vector Barcode on bottom-right
  const bars = computePassBarcodeBars(member.id);
  const unit = 3.5;
  const totalUnits = bars.reduce((sum, w) => sum + w + 1, 0);
  let cursorX = logicalWidth - 56 - totalUnits * unit;
  const barY = 486;
  const barHeight = 64;

  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < bars.length; i++) {
    const bw = bars[i] * unit;
    ctx.fillRect(cursorX, barY, bw, barHeight);
    cursorX += bw + unit;
  }

  ctx.fillStyle = "#FB923C";
  ctx.font = "500 13px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("VERIFIED CAMPUS PASS", logicalWidth - 56, 594);
  ctx.textAlign = "left";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) {
    throw new Error("Could not generate ID card image.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `xor-id-${member.id.toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
