import AiLayout from "@/components/_template/ai/AiLayout";
import AiPageBreadcrumb from "@/components/_template/ai/AiPageBreadcrumb";
import ImageGeneratorContent from "@/components/_template/ai/ImageGeneratorContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "Next.js AI Image Generator | TailAdmin - Next.js Admin Dashboard Template",
  description:
    "This is  Next.js AI Image Generator page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="Image Generator" />
      <AiLayout>
        <ImageGeneratorContent />
      </AiLayout>
    </div>
  );
}
