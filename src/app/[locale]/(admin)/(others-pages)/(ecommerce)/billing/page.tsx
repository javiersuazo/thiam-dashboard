import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import BillingInfo from "@/components/_template/ecommerce/billing/BillingInfo";
import BillingPlan from "@/components/_template/ecommerce/billing/BillingPlan";
import InvoiceTable from "@/components/_template/ecommerce/billing/InvoiceTable";
import PaymentMethod from "@/components/_template/ecommerce/billing/PaymentMethod";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js E-commerce  Billing | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js E-commerce  Billing TailAdmin Dashboard Template",
};

export default function BillingPages() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Billing" />
      <div className="mb-6 flex flex-col gap-6 xl:flex-row">
        <BillingPlan />
        <BillingInfo />
      </div>
      <PaymentMethod />
      <InvoiceTable />
    </div>
  );
}
