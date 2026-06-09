import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getFunnel, listActiveFunnelSlugs } from "@/lib/funnels/registry";
import { TopBar } from "@/app/components/top-bar";

import { FunnelRunner } from "./funnel-runner";

export function generateStaticParams() {
  return listActiveFunnelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const funnel = getFunnel(slug);
  if (!funnel) {
    return { title: "Azora" };
  }
  return {
    title: `${funnel.name} — Azora`,
    description: funnel.intro,
    // Funnel pages are paid-traffic landing pages, not organic search targets.
    robots: { index: false, follow: false },
  };
}

export default async function FunnelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const funnel = getFunnel(slug);

  if (!funnel) {
    notFound();
  }

  return (
    <>
      <TopBar next={`/f/${slug}`} />
      <main className="funnelPage">
        <div className="glass-orb orb-brand orb-md" style={{ top: "12%", right: "-8%" }} />
        <div className="glass-orb orb-sm" style={{ top: "60%", left: "-5%" }} />
        <FunnelRunner funnel={funnel} />
      </main>
    </>
  );
}
