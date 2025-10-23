import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import PriceTableOne from "@/components/shared/price-table/PriceTableOne";
import PriceTableThree from "@/components/shared/price-table/PriceTableThree";
import PriceTableTwo from "@/components/shared/price-table/PriceTableTwo";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Pricing Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Pricing Table page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function PricingTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pricing Tables" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Pricing Table 1">
          <PriceTableOne />
        </ComponentCard>
        <ComponentCard title="Pricing Table 2">
          <PriceTableTwo />
        </ComponentCard>
        <ComponentCard title="Pricing Table 3">
          <PriceTableThree />
        </ComponentCard>
      </div>
    </div>
  );
}
