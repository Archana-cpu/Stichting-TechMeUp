"use client";

import dynamic from "next/dynamic";
import type { PersonWithRelations } from "./nodes/person-flow-node";

// Dynamic import for canvas (no SSR needed)
const LifeTreeFlow = dynamic(
  () => import("./lifetree-flow").then((mod) => mod.LifeTreeFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    ),
  }
);

type LifeTreeClientProps = {
  people: PersonWithRelations[];
};

export function LifeTreeClient({ people }: LifeTreeClientProps) {
  return <LifeTreeFlow people={people} />;
}
