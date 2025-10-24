import BarChartOne from "@/components/shared/charts/bar/BarChartOne";
import BarChartTwo from "@/components/shared/charts/bar/BarChartTwo";
import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6 overflow-x-hidden">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
        <ComponentCard title="Bar Chart 2">
          <BarChartTwo />
        </ComponentCard>
      </div>
    </div>
  );
}
