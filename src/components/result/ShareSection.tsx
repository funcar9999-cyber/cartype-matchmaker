import { forwardRef } from "react";
import { toast } from "sonner";

import type { CarbtiType } from "@/lib/carbti-types";
import { formatTypeCode } from "@/lib/carbti-types";

async function copyLink(): Promise<{ ok: boolean; url: string }> {
  const url = typeof window !== "undefined" ? window.location.href : "";
  try {
    await navigator.clipboard.writeText(url);
    return { ok: true, url };
  } catch {
    return { ok: false, url };
  }
}

/** 1080x1920 canvas rendering — 유형 정보만 (개인 데이터 절대 미포함) */
function drawShareImage(type: CarbtiType): string | null {
  if (typeof document === "undefined") return null;
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 배경 그라디언트 (히어로와 동일 계열)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0F7FFF");
  grad.addColorStop(1, "#6B47FF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const font = (size: number, weight = "500") =>
    `${weight} ${size}px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  // 소제목
  ctx.globalAlpha = 0.8;
  ctx.font = font(34, "500");
  ctx.fillText("YOUR CARBTI", W / 2, 360);
  ctx.globalAlpha = 1;

  // 유형 코드 크게 (C · T · E · F)
  ctx.font = font(180, "600");
  ctx.fillText(formatTypeCode(type.code), W / 2, 580);

  // 파워트레인 배지
  const badge = type.powertrainBadge;
  ctx.font = font(40, "500");
  const bw = ctx.measureText(badge).width + 60;
  const bx = (W - bw) / 2;
  const by = 660;
  ctx.globalAlpha = 0.2;
  roundRect(ctx, bx, by, bw, 76, 38);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(badge, W / 2, by + 52);

  // 닉네임
  ctx.font = font(90, "600");
  ctx.fillText(type.name, W / 2, 900);

  // 태그라인 (auto wrap)
  ctx.font = font(42, "400");
  ctx.globalAlpha = 0.92;
  wrapText(ctx, type.tagline, W / 2, 1000, W - 200, 60);
  ctx.globalAlpha = 1;

  // 희소성 배지
  const rarity = `전체의 ${type.rarityPercent}%만 가진 유형`;
  ctx.font = font(42, "500");
  const rw = ctx.measureText(rarity).width + 80;
  const rx = (W - rw) / 2;
  const ry = 1240;
  ctx.globalAlpha = 0.18;
  roundRect(ctx, rx, ry, rw, 88, 44);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(rarity, W / 2, ry + 58);

  // 하단 서비스명 + URL
  ctx.font = font(50, "600");
  ctx.fillText("CarBTI · 1분 자동차 DNA 진단", W / 2, 1720);
  ctx.font = font(36, "400");
  ctx.globalAlpha = 0.8;
  ctx.fillText("cartype-matchmaker.lovable.app", W / 2, 1790);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = words[i];
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yy);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const ShareSection = forwardRef<HTMLElement, { type: CarbtiType }>(
  ({ type }, ref) => {
    const handleKakao = async () => {
      const { ok } = await copyLink();
      if (ok) toast.success("링크가 복사되었어요! 카카오톡에 붙여넣어 공유하세요");
      else toast("URL을 복사할 수 없어요");
    };

    const handleImageSave = async (alsoInstagram = false) => {
      const url = drawShareImage(type);
      if (!url) {
        toast("이미지를 만들 수 없어요");
        return;
      }
      downloadDataUrl(url, `carbti-${type.code}.png`);
      if (alsoInstagram) {
        const { ok } = await copyLink();
        toast.success(
          ok
            ? "이미지가 저장됐어요 — 인스타 스토리에 올려보세요! (링크도 함께 복사했어요)"
            : "이미지가 저장됐어요 — 인스타 스토리에 올려보세요!",
        );
      } else {
        toast.success("이미지가 저장됐어요 — 인스타 스토리에 올려보세요!");
      }
    };

    const handleLink = async () => {
      const { ok } = await copyLink();
      if (ok) toast.success("링크가 복사되었어요!");
      else toast("URL을 복사할 수 없어요");
    };

    return (
      <section ref={ref} className="mb-4 rounded-2xl bg-slate-50 p-3">
        <div className="mb-2 font-medium" style={{ fontSize: "12px" }}>
          🎉 친구들에게 자랑하기
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <ShareBtn label="💛 카카오톡" onClick={() => void handleKakao()} />
          <ShareBtn
            label="📷 인스타"
            onClick={() => void handleImageSave(true)}
          />
          <ShareBtn
            label="🖼️ 이미지"
            onClick={() => void handleImageSave(false)}
          />
          <ShareBtn label="🔗 링크" onClick={() => void handleLink()} />
        </div>
      </section>
    );
  },
);
ShareSection.displayName = "ShareSection";

function ShareBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white py-2 text-center"
      style={{ fontSize: "10px" }}
    >
      {label}
    </button>
  );
}