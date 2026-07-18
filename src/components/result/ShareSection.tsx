import { forwardRef } from "react";
import { toast } from "sonner";
import { Link2, Instagram, Download, MessageCircle } from "lucide-react";

import type { CarbtiType } from "@/lib/carbti-types";
import { formatTypeCode } from "@/lib/carbti-types";

async function copyLink(): Promise<{ ok: boolean; url: string }> {
  const url = typeof window !== "undefined" ? window.location.href : "";
  try { await navigator.clipboard.writeText(url); return { ok: true, url }; }
  catch { return { ok: false, url }; }
}

/** 1080x1920 canvas · v1.2 midnight + emblem + gold */
function drawShareImage(type: CarbtiType): string | null {
  if (typeof document === "undefined") return null;
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const isE = type.code[2] === "E";
  const accent = isE ? "#1E7F74" : "#B4652E";
  const accentDeep = isE ? "#123A3F" : "#6E3A1C";

  // midnight background
  ctx.fillStyle = "#0A0F1C";
  ctx.fillRect(0, 0, W, H);
  // radial accent glow top
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.9);
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(1, "#0A0F1C00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.7);

  const font = (size: number, weight: number | string = 500) =>
    `${weight} ${size}px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";

  // section label
  ctx.fillStyle = "#C9A96A";
  ctx.font = font(30, 700);
  ctx.fillText("Y O U R   C A R B T I", W / 2, 260);

  // Emblem (rings + dark center + accent dome)
  const cx = W / 2, cy = 640, r = 260;
  ctx.strokeStyle = "#C9A96A";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#E3C98F";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r - 22, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#0A0F1C";
  ctx.beginPath(); ctx.arc(cx, cy, r - 40, 0, Math.PI * 2); ctx.fill();
  const dome = ctx.createRadialGradient(cx, cy - 30, 10, cx, cy, r - 60);
  dome.addColorStop(0, accent);
  dome.addColorStop(1, accentDeep);
  ctx.fillStyle = dome;
  ctx.beginPath(); ctx.arc(cx, cy, r - 80, 0, Math.PI * 2); ctx.fill();
  // powertrain glyph
  ctx.fillStyle = "#E3C98F";
  ctx.font = font(140, 800);
  ctx.fillText(isE ? "⚡" : "⚙", cx, cy + 48);

  // code
  ctx.fillStyle = "#F5F4F0";
  ctx.font = font(160, 800);
  ctx.save();
  const codeText = type.code;
  // 8px letter-spacing at 160px -> emulate by scaling glyphs individually
  const letterSpacing = 40;
  ctx.font = font(160, 800);
  const widths = codeText.split("").map((ch) => ctx.measureText(ch).width);
  const totalW = widths.reduce((a, b) => a + b, 0) + letterSpacing * (codeText.length - 1);
  let x = W / 2 - totalW / 2;
  ctx.textAlign = "left";
  for (let i = 0; i < codeText.length; i++) {
    ctx.fillText(codeText[i], x, 1120);
    x += widths[i] + letterSpacing;
  }
  ctx.restore();
  ctx.textAlign = "center";

  // powertrain label
  ctx.fillStyle = "#C9A96A";
  ctx.font = font(34, 700);
  ctx.fillText(isE ? "E L E C T R I C" : "G A S O L I N E · H E V", W / 2, 1180);

  // nickname
  ctx.fillStyle = "#F5F4F0";
  ctx.font = font(78, 800);
  ctx.fillText(type.name, W / 2, 1310);

  // gold hairline
  ctx.strokeStyle = "#C9A96A";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W / 2 - 120, 1360); ctx.lineTo(W / 2 + 120, 1360); ctx.stroke();

  // rarity
  ctx.fillStyle = "#C9A96A";
  ctx.font = font(56, 800);
  ctx.fillText(`상위 ${type.rarityPercent}%`, W / 2, 1450);
  ctx.fillStyle = "#F5F4F099";
  ctx.font = font(30, 500);
  ctx.fillText("만 가진 유형", W / 2, 1500);

  // brand footer
  ctx.fillStyle = "#F5F4F0";
  ctx.font = font(38, 700);
  ctx.fillText("CarBTI · 1분 자동차 DNA 진단", W / 2, 1740);
  ctx.fillStyle = "#F5F4F080";
  ctx.font = font(28, 400);
  ctx.fillText("cartype-matchmaker.lovable.app", W / 2, 1790);

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export const ShareSection = forwardRef<HTMLElement, { type: CarbtiType }>(
  ({ type }, ref) => {
    const handleKakao = async () => {
      const { ok } = await copyLink();
      if (ok) toast.success("링크가 복사되었어요! 카카오톡에 붙여넣기 해주세요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleLink = async () => {
      const { ok } = await copyLink();
      if (ok) toast.success("링크가 클립보드에 복사되었어요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleInstagram = async () => {
      const { ok } = await copyLink();
      if (ok) toast.success("링크를 복사했어요. 인스타 스토리에 붙여넣기 하세요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleSaveImage = () => {
      const url = drawShareImage(type);
      if (!url) { toast.error("이미지 생성에 실패했어요."); return; }
      downloadDataUrl(url, `carbti-${type.code}.png`);
      toast.success("이미지를 저장했어요.");
    };

    const btnBase = "flex flex-col items-center gap-1.5 rounded-xl border py-3 active:scale-[0.98] transition";
    const btnStyle = { borderColor: "var(--hairline)", backgroundColor: "var(--surface)" } as const;

    return (
      <section
        ref={ref}
        className="mb-4 rounded-2xl p-5"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="mb-3"
          style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
        >
          결과 공유
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button type="button" onClick={handleKakao} className={btnBase} style={btnStyle}>
            <MessageCircle size={18} color="var(--ink)" strokeWidth={1.75} />
            <span style={{ fontSize: "10px", color: "var(--ink)" }}>카톡</span>
          </button>
          <button type="button" onClick={handleInstagram} className={btnBase} style={btnStyle}>
            <Instagram size={18} color="var(--ink)" strokeWidth={1.75} />
            <span style={{ fontSize: "10px", color: "var(--ink)" }}>인스타</span>
          </button>
          <button type="button" onClick={handleLink} className={btnBase} style={btnStyle}>
            <Link2 size={18} color="var(--ink)" strokeWidth={1.75} />
            <span style={{ fontSize: "10px", color: "var(--ink)" }}>링크</span>
          </button>
          <button type="button" onClick={handleSaveImage} className={btnBase} style={btnStyle}>
            <Download size={18} color="var(--gold)" strokeWidth={1.75} />
            <span style={{ fontSize: "10px", color: "var(--ink)" }}>이미지</span>
          </button>
        </div>
      </section>
    );
  },
);
ShareSection.displayName = "ShareSection";
