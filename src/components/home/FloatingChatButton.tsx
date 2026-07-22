import { MessageCircle } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { track } from "@/lib/events";

export function FloatingChatButton() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <button
      type="button"
      aria-label="상담"
      onClick={() => {
        track("consult_click", { from: pathname });
        void navigate({ to: "/consult" });
      }}
      className="absolute bottom-20 right-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
      style={{
        backgroundColor: "var(--midnight)",
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <MessageCircle size={20} strokeWidth={1.75} />
    </button>
  );
}
