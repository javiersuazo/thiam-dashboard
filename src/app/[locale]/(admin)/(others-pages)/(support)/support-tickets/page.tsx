import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import SupportTicketsList from "@/components/_examples/support/SupportList";
import SupportMetrics from "@/components/_examples/support/SupportMetrics";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Support List | TailAdmin - Next.js Admin Dashboard Template",
  description:
    "This is Next.js Support List for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SupportListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support List" />
      <SupportMetrics />
      <SupportTicketsList />
    </div>
  );
}
