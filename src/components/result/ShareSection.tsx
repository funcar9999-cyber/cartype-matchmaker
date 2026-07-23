import { forwardRef } from "react";
import { toast } from "sonner";
import { Link2, Instagram, Download, MessageCircle } from "lucide-react";

import type { CarbtiType } from "@/lib/carbti-types";
import { track } from "@/lib/events";

type Variant = "type" | "match";
type Format = "story" | "feed"; // 1080x1920 vs 1080x1350

function buildShareUrl(variant: Variant): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("via", variant === "type" ? "share_type" : "share_match");
  return url.toString();
}

async function copyLink(variant: Variant): Promise<{ ok: boolean; url: string }> {
  const url = buildShareUrl(variant);
  try { await navigator.clipboard.writeText(url); return { ok: true, url }; }
  catch { return { ok: false, url }; }
}

export type ShareMatchTop1 = {
  name: string;
  chip?: string;
};

/** 야차 공유 카드. variant=type: 유형 카드, variant=match: 매칭 카드 */
function drawShareImage(
  type: CarbtiType,
  variant: Variant,
  format: Format,
  top1?: ShareMatchTop1,
): string | null {
  if (typeof document === "undefined") return null;
  const W = 1080;
  const H = format === "story" ? 1920 : 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const isE = type.code[2] === "E";
  const accent = isE ? "#1E7F74" : "#B4652E";
  const accentDeep = isE ? "#123A3F" : "#6E3A1C";

  ctx.fillStyle = "#0A0F1C";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.05, 0, W / 2, H * 0.05, W * 0.9);
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(1, "#0A0F1C00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.75);

  const font = (size: number, weight: number | string = 500) =>
    `${weight} ${size}px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";

  const drawEmblem = (cx: number, cy: number, r: number) => {
    ctx.strokeStyle = "#C9A96A";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#E3C98F";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r - 18, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#0A0F1C";
    ctx.beginPath(); ctx.arc(cx, cy, r - 32, 0, Math.PI * 2); ctx.fill();
    const dome = ctx.createRadialGradient(cx, cy - r * 0.15, 10, cx, cy, r - 40);
    dome.addColorStop(0, accent);
    dome.addColorStop(1, accentDeep);
    ctx.fillStyle = dome;
    ctx.beginPath(); ctx.arc(cx, cy, r - 55, 0, Math.PI * 2); ctx.fill();
    // 아이보리 단색 벡터 아이콘 (이모지 금지)
    ctx.save();
    ctx.fillStyle = "#F5F4F0";
    ctx.strokeStyle = "#F5F4F0";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (isE) {
      // 번개
      const s = r * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.15, cy - s * 0.75);
      ctx.lineTo(cx - s * 0.35, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.02, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.2, cy + s * 0.8);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.15);
      ctx.lineTo(cx + s * 0.05, cy - s * 0.15);
      ctx.lineTo(cx + s * 0.28, cy - s * 0.75);
      ctx.closePath();
      ctx.fill();
    } else {
      // 방패
      const s = r * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.85);
      ctx.lineTo(cx + s * 0.72, cy - s * 0.55);
      ctx.lineTo(cx + s * 0.72, cy + s * 0.05);
      ctx.quadraticCurveTo(cx + s * 0.72, cy + s * 0.7, cx, cy + s * 0.95);
      ctx.quadraticCurveTo(cx - s * 0.72, cy + s * 0.7, cx - s * 0.72, cy + s * 0.05);
      ctx.lineTo(cx - s * 0.72, cy - s * 0.55);
      ctx.closePath();
      ctx.fill();
      // 내부 체크
      ctx.strokeStyle = "#0A0F1C";
      ctx.lineWidth = s * 0.18;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy + s * 0.05);
      ctx.lineTo(cx - s * 0.05, cy + s * 0.35);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.25);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawWordmark = (yBase: number) => {
    ctx.font = font(50, 800);
    const parts: Array<[string, string]> = [
      ["ya", "#F5F4F0"],
      ["\u2019", "#C13529"],
      ["cha", "#F5F4F0"],
    ];
    const widths = parts.map(([t]) => ctx.measureText(t).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let bx = W / 2 - total / 2;
    ctx.textAlign = "left";
    parts.forEach(([t, c], i) => {
      ctx.fillStyle = c;
      ctx.fillText(t, bx, yBase);
      bx += widths[i];
    });
    ctx.textAlign = "center";
    ctx.fillStyle = "#F5F4F080";
    ctx.font = font(24, 500);
    ctx.fillText("Y A C H A . A I", W / 2, yBase + 44);
  };

  if (variant === "type") {
    // ------ Card A: 유형 카드 ------
    const topY = format === "story" ? 240 : 160;
    ctx.fillStyle = "#C9A96A";
    ctx.font = font(28, 700);
    ctx.fillText("C A R ' B T I", W / 2, topY);

    const cy = format === "story" ? 720 : 540;
    const r = format === "story" ? 270 : 220;
    drawEmblem(W / 2, cy, r);

    // 닉네임
    const nickY = cy + r + 130;
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(84, 800);
    ctx.fillText(type.name, W / 2, nickY);

    // 한 줄 소개
    ctx.fillStyle = "#F5F4F0AA";
    ctx.font = font(30, 500);
    ctx.fillText(type.tagline, W / 2, nickY + 60);

    // rarity 필 배지
    const badgeY = nickY + 140;
    const badgeText = `상위 ${type.rarityPercent}% 유형`;
    ctx.font = font(30, 800);
    const bw = ctx.measureText(badgeText).width + 60;
    const bh = 60;
    const bx = W / 2 - bw / 2;
    ctx.fillStyle = "#C9A96A";
    ctx.beginPath();
    const rr = bh / 2;
    ctx.moveTo(bx + rr, badgeY - bh / 2);
    ctx.arcTo(bx + bw, badgeY - bh / 2, bx + bw, badgeY + bh / 2, rr);
    ctx.arcTo(bx + bw, badgeY + bh / 2, bx, badgeY + bh / 2, rr);
    ctx.arcTo(bx, badgeY + bh / 2, bx, badgeY - bh / 2, rr);
    ctx.arcTo(bx, badgeY - bh / 2, bx + bw, badgeY - bh / 2, rr);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0A0F1C";
    ctx.fillText(badgeText, W / 2, badgeY + 10);

    // 훅
    const hookY = H - (format === "story" ? 260 : 190);
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(34, 700);
    ctx.fillText("당신은 어떤 유형일까요?", W / 2, hookY);
    ctx.fillStyle = "#F5F4F080";
    ctx.font = font(26, 500);
    ctx.fillText("90초 진단", W / 2, hookY + 42);

    drawWordmark(H - (format === "story" ? 130 : 90));
  } else {
    // ------ Card B: 매칭 카드 ------
    const topY = format === "story" ? 220 : 150;
    ctx.fillStyle = "#C9A96A";
    ctx.font = font(28, 700);
    ctx.fillText("C A R ' B T I   M A T C H", W / 2, topY);

    // 크레스트(작게) + 닉네임
    const embY = topY + 200;
    const embR = 130;
    drawEmblem(W / 2, embY, embR);
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(56, 800);
    ctx.fillText(type.name, W / 2, embY + embR + 90);

    // 카드 블록: 야차가 찾은 내 차
    const boxTop = embY + embR + 150;
    const boxH = format === "story" ? 460 : 380;
    const boxX = 90;
    const boxW = W - 180;
    ctx.fillStyle = "#141B2E";
    ctx.strokeStyle = "#C9A96A66";
    ctx.lineWidth = 1.5;
    const bR = 32;
    ctx.beginPath();
    ctx.moveTo(boxX + bR, boxTop);
    ctx.arcTo(boxX + boxW, boxTop, boxX + boxW, boxTop + boxH, bR);
    ctx.arcTo(boxX + boxW, boxTop + boxH, boxX, boxTop + boxH, bR);
    ctx.arcTo(boxX, boxTop + boxH, boxX, boxTop, bR);
    ctx.arcTo(boxX, boxTop, boxX + boxW, boxTop, bR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#C9A96A";
    ctx.font = font(22, 700);
    ctx.fillText("Y A C H A ' S   P I C K", W / 2, boxTop + 60);

    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(24, 500);
    ctx.fillText("야차가 찾은 내 차", W / 2, boxTop + 100);

    const carName = top1?.name ?? type.topCars[0];
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(52, 800);
    ctx.fillText(carName, W / 2, boxTop + 190);

    // 이유 칩 — 금액이 들어간 칩은 카드에 넣지 않는다
    const rawChip = top1?.chip;
    const chipHasMoney = rawChip ? /\d|만원|원/.test(rawChip) : false;
    const chipText = !rawChip || chipHasMoney ? null : rawChip;
    const priceY = chipText ? boxTop + boxH - 60 : boxTop + 280;
    if (chipText) {
    ctx.font = font(24, 700);
    const cw = ctx.measureText(chipText).width + 40;
    const ch = 48;
    const cxb = W / 2 - cw / 2;
    const cyb = boxTop + 240;
    ctx.fillStyle = "#0A0F1C";
    ctx.strokeStyle = "#C9A96A";
    ctx.lineWidth = 1.5;
    const cR = ch / 2;
    ctx.beginPath();
    ctx.moveTo(cxb + cR, cyb);
    ctx.arcTo(cxb + cw, cyb, cxb + cw, cyb + ch, cR);
    ctx.arcTo(cxb + cw, cyb + ch, cxb, cyb + ch, cR);
    ctx.arcTo(cxb, cyb + ch, cxb, cyb, cR);
    ctx.arcTo(cxb, cyb, cxb + cw, cyb, cR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#C9A96A";
    ctx.fillText(chipText, W / 2, cyb + 32);
    }

    // "한 달에 ●●만원대"
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(40, 800);
    ctx.fillText("한 달에 ●●만원대", W / 2, priceY);

    // 훅
    const hookY = boxTop + boxH + 90;
    ctx.fillStyle = "#F5F4F0";
    ctx.font = font(34, 700);
    ctx.fillText("월 ●●만원이면 이 차 탄다는데?", W / 2, hookY);
    ctx.fillStyle = "#F5F4F080";
    ctx.font = font(26, 500);
    ctx.fillText("내 차는 얼마일까 — 15문항이면 나와요", W / 2, hookY + 42);

    drawWordmark(H - (format === "story" ? 130 : 90));
  }

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

type ShareSectionProps = {
  type: CarbtiType;
  variant?: Variant;
  top1?: ShareMatchTop1;
};

export const ShareSection = forwardRef<HTMLElement, ShareSectionProps>(
  ({ type, variant = "type", top1 }, ref) => {
    const cardStage = variant === "type" ? "type" : "match";
    const handleKakao = async () => {
      track("share_click", { channel: "kakao", card_stage: cardStage });
      const { ok } = await copyLink(variant);
      if (ok) toast.success("링크가 복사되었어요! 카카오톡에 붙여넣기 해주세요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleLink = async () => {
      track("share_click", { channel: "link", card_stage: cardStage });
      const { ok } = await copyLink(variant);
      if (ok) toast.success("링크가 클립보드에 복사되었어요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleInstagram = async () => {
      track("share_click", { channel: "insta", card_stage: cardStage });
      const { ok } = await copyLink(variant);
      if (ok) toast.success("링크를 복사했어요. 인스타 스토리에 붙여넣기 하세요.");
      else toast.error("링크 복사에 실패했어요.");
    };
    const handleSaveImage = (format: Format) => {
      track("share_click", { channel: "image", card_stage: cardStage, format });
      const url = drawShareImage(type, variant, format, top1);
      if (!url) { toast.error("이미지 생성에 실패했어요."); return; }
      const sizeTag = format === "story" ? "story" : "feed";
      downloadDataUrl(url, `yacha-${cardStage}-${type.code}-${sizeTag}.png`);
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
          <button type="button" onClick={() => handleSaveImage("story")} className={btnBase} style={btnStyle}>
            <Download size={18} color="var(--gold)" strokeWidth={1.75} />
            <span style={{ fontSize: "10px", color: "var(--ink)" }}>스토리 9:16</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleSaveImage("feed")}
          className="mt-2 w-full rounded-xl border py-2.5 text-center active:scale-[0.99] transition"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            fontSize: "11px",
            color: "var(--ink)",
            fontWeight: 600,
          }}
        >
          피드용 이미지 저장 (4:5)
        </button>
      </section>
    );
  },
);
ShareSection.displayName = "ShareSection";
