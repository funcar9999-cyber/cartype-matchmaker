import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/home/TopBar";
import { BrandHero } from "@/components/home/BrandHero";
import { StatusCard } from "@/components/home/StatusCard";
import { QuickActions } from "@/components/home/QuickActions";
import { TypeShowcase } from "@/components/home/TypeShowcase";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { FloatingChatButton } from "@/components/home/FloatingChatButton";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <TopBar />
        <main className="flex-1 px-4 py-4">
          <BrandHero />
          <StatusCard onOpenQuote={() => setQuoteOpen(true)} />
          <QuickActions />
          <TypeShowcase />
          <footer
            className="mt-6 pb-4"
            style={{ fontSize: "10px", color: "var(--warm-gray)" }}
          >
            <div className="flex justify-center gap-3 pb-3">
              <Link to="/about">회사 소개</Link>
              <span>·</span>
              <Link to="/privacy">개인정보처리방침</Link>
              <span>·</span>
              <Link to="/terms">이용약관</Link>
            </div>
            <div className="space-y-1 text-center" style={{ fontSize: "10px" }}>
              <p>주식회사 펀카</p>
              <p>사업자등록번호 307-86-02844 · 대표 박지호</p>
              <p>경기도 수원시 경수대로 393, 3층</p>
              <p>1668-5673</p>
            </div>
          </footer>
        </main>
        <BottomTabBar />
        <FloatingChatButton />
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ source: "result" }}
        />
      </div>
    </div>
  );
}
