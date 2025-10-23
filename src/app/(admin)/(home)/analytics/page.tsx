import AcquisitionChannelChart from "@/components/_examples/analytics/AcquisitionChannelChart";
import ActiveUsersChart from "@/components/_examples/analytics/ActiveUsersChart";
import AnalyticsBarChart from "@/components/_examples/analytics/AnalyticsBarChart";
import AnalyticsMetrics from "@/components/_examples/analytics/AnalyticsMetrics";
import RecentOrderAnalytics from "@/components/_examples/analytics/RecentOrderAnalytics";
import SessionChart from "@/components/_examples/analytics/SessionChart";
import TopChannel from "@/components/_examples/analytics/TopChannel";
import TopPages from "@/components/_examples/analytics/TopPages";
import DemographicCard from "@/components/_template/ecommerce/DemographicCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Analytics Dashboard | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Analytics Dashboard page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Analytics() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <AnalyticsMetrics />
      </div>
      <div className="col-span-12">
        <AnalyticsBarChart />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TopChannel />
          <TopPages />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ActiveUsersChart />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <AcquisitionChannelChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <SessionChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrderAnalytics />
      </div>
    </div>
  );
}
