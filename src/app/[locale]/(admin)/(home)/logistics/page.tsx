import DeliveryActivityTable from "@/components/_template/logistics/DeliveriesActivityTable";
import DeliveryMan from "@/components/_template/logistics/DeliveryMan";
import DeliveryStatisticsChart from "@/components/_template/logistics/DeliveryStatisticsChart";
import DeliveryVehicle from "@/components/_template/logistics/DeliveryVehicle";
import LogisticsMetrics from "@/components/_template/logistics/LogisticsMetrics";
import RevenueEarnedChart from "@/components/_template/logistics/RevenueEarnedChart";
import TrackingDeliveryMap from "@/components/_template/logistics/TrackingDeliveryMap";
import TrackingProgress from "@/components/_template/logistics/TrackingProgress";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Logistics Dashboard | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js  Logistics Dashboard for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function LogisticsPage() {
  return (
    <div className="space-y-6">
      <LogisticsMetrics />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DeliveryStatisticsChart />
          <div className="grid gap-6 sm:grid-cols-2">
            <RevenueEarnedChart />
            <DeliveryVehicle />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-2 rounded-xl border bg-gray-100 p-2 dark:border-gray-800 dark:bg-white/3">
            <TrackingDeliveryMap />
            <TrackingProgress />
            <DeliveryMan />
          </div>
        </div>
      </div>
      <DeliveryActivityTable />
    </div>
  );
}
