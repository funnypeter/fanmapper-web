"use client";

import { useParams } from "next/navigation";
import GameDetailContent from "@/components/GameDetailContent";

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  return (
    <div className="max-w-4xl mx-auto">
      <GameDetailContent gameId={gameId} />
    </div>
  );
}
