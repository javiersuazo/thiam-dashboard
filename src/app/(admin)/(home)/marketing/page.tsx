import FeaturedCampaign from "@/components/_template/marketing/FeaturedCampaign";
import ImpressionChart from "@/components/_template/marketing/ImpressionChart";
import MarketingMetricsCards from "@/components/_template/marketing/MarketingMetricsCards";
import TrafficSource from "@/components/_template/marketing/TrafficSource";
import TrafficStats from "@/components/_template/marketing/TrafficStats";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "Next.js Marketing Dashboard | TailAdmin - Next.js Admin Dashboard Template",
  description:
    "This is Next.js Marketing Dashboard page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Marketing() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <MarketingMetricsCards />
      </div>
      <div className="col-span-12 space-y-6 xl:col-span-8">
        <ImpressionChart />
        <FeaturedCampaign />
      </div>
      <div className="col-span-12 space-y-6 xl:col-span-4">
        <TrafficStats />
        <TrafficSource />
      </div>
    </div>
  );
}
