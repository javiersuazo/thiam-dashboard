import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import AddProductForm from "@/components/_template/ecommerce/AddProductForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Add Product | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js E-commerce  Add Product  TailAdmin Dashboard Template",
};

export default function AddProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Products" />
      <AddProductForm />
    </div>
  );
}
