import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import DefaultProgressbarExample from "@/components/shared/progress-bar/DefaultProgressbarExample";
import ProgressBarInMultipleSizes from "@/components/shared/progress-bar/ProgressBarInMultipleSizes";
import ProgressBarWithInsideLabel from "@/components/shared/progress-bar/ProgressBarWithInsideLabel";
import ProgressBarWithOutsideLabel from "@/components/shared/progress-bar/ProgressBarWithOutsideLabel";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Progress | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Progress page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Progressbar" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Progress Bar">
          <DefaultProgressbarExample />
        </ComponentCard>
        <ComponentCard title="Progress Bar In Multiple Sizes">
          <ProgressBarInMultipleSizes />
        </ComponentCard>
        <ComponentCard title="Progress Bar with Outside Label">
          <ProgressBarWithOutsideLabel />
        </ComponentCard>
        <ComponentCard title="Progress Bar with Inside Label">
          <ProgressBarWithInsideLabel />
        </ComponentCard>
      </div>
    </div>
  );
}
