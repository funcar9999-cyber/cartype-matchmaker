import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/home/TopBar";
import { HeroCard } from "@/components/home/HeroCard";
import { TrustStrip } from "@/components/home/TrustStrip";
import { QuickActions } from "@/components/home/QuickActions";
import { TypeShowcase } from "@/components/home/TypeShowcase";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { FloatingChatButton } from "@/components/home/FloatingChatButton";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <TopBar />
        <main className="flex-1 px-4 py-4">
          <HeroCard />
          <TrustStrip />
          <QuickActions />
          <TypeShowcase />
        </main>
        <BottomTabBar />
        <FloatingChatButton />
      </div>
    </div>
  );
}
