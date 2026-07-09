import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/home/TopBar";
import { HeroCard } from "@/components/home/HeroCard";
import { TrustStrip } from "@/components/home/TrustStrip";
import { QuickActions } from "@/components/home/QuickActions";
import { TypeShowcase } from "@/components/home/TypeShowcase";
import { ContractCases } from "@/components/home/ContractCases";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { FloatingChatButton } from "@/components/home/FloatingChatButton";
import { ReturningBanner } from "@/components/home/ReturningBanner";
import { TypeTeaser } from "@/components/home/TypeTeaser";
import { FinalDiagnosisCta } from "@/components/home/FinalDiagnosisCta";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <TopBar />
        <main className="flex-1 px-4 py-4">
          <HeroCard />
          <ReturningBanner onOpenQuote={() => setQuoteOpen(true)} />
          <TrustStrip />
          <QuickActions />
          <TypeShowcase />
          <TypeTeaser />
          <ContractCases />
          <FinalDiagnosisCta />
          <footer
            className="mt-4 flex justify-center gap-3 pb-2 text-slate-400"
            style={{ fontSize: "10px" }}
          >
            <Link to="/about">회사 소개</Link>
            <span>·</span>
            <Link to="/privacy">개인정보처리방침</Link>
            <span>·</span>
            <Link to="/terms">이용약관</Link>
          </footer>
        </main>
        <BottomTabBar />
        <FloatingChatButton />
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{}}
        />
      </div>
    </div>
  );
}
