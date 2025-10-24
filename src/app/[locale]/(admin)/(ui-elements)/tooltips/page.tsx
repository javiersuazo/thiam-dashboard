import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import DefaultTooltip from "@/components/shared/ui/tooltip/DefaultTooltip";
import TooltipPlacement from "@/components/shared/ui/tooltip/TooltipPlacement";
import WhiteAndDarkTooltip from "@/components/shared/ui/tooltip/WhiteAndDarkTooltip";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Tooltips | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tooltips page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Tooltips() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tooltip" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Tooltip">
          <DefaultTooltip />
        </ComponentCard>
        <ComponentCard title="White and Dark Tooltip">
          <WhiteAndDarkTooltip />
        </ComponentCard>
        <ComponentCard title="Tooltip Placement">
          <TooltipPlacement />
        </ComponentCard>
      </div>
    </div>
  );
}
