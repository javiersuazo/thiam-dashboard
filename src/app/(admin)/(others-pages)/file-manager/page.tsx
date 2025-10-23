import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import AllFolders from "@/components/shared/file-manager/AllFolders";
import AllMediaCard from "@/components/shared/file-manager/AllMediaCard";
import RecentFileTable from "@/components/shared/file-manager/RecentFileTable";
import StorageDetailsChart from "@/components/shared/file-manager/StorageDetailsChart";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js FileManager Page | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js FileManager page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function FileManager() {
  return (
    <div>
      <PageBreadcrumb pageTitle="File Manager" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <AllMediaCard />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <AllFolders />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <StorageDetailsChart />
        </div>

        <div className="col-span-12">
          <RecentFileTable />
        </div>
      </div>
    </div>
  );
}
