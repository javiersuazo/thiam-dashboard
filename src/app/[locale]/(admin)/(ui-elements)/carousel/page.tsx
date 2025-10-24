import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import SlideOnly from "@/components/shared/ui/carousel/SlideOnly";
import WithControl from "@/components/shared/ui/carousel/WithControl";
import WithControlAndIndicators from "@/components/shared/ui/carousel/WithControlAndIndicators";
import WithIndicators from "@/components/shared/ui/carousel/WithIndicators";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Carousel | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Carousel page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function Carousel() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Carousel" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        <ComponentCard title="Slides Only">
          <SlideOnly />
        </ComponentCard>
        <ComponentCard title="With controls">
          <WithControl />
        </ComponentCard>
        <ComponentCard title="With indicators">
          <WithIndicators />
        </ComponentCard>
        <ComponentCard title="    With controls and indicators">
          <WithControlAndIndicators />
        </ComponentCard>
      </div>
    </div>
  );
}
