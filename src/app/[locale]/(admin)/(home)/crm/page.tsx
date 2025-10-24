import CrmMetrics from "@/components/_template/crm/CrmMetrics";
import CrmRecentOrderTable from "@/components/_template/crm/CrmRecentOrderTable";
import CrmStatisticsChart from "@/components/_template/crm/CrmStatisticsChart";
import EstimatedRevenue from "@/components/_template/crm/EstimatedRevenue";
import SalePieChart from "@/components/_template/crm/SalePieChart";
import UpcomingSchedule from "@/components/_template/crm/UpcomingSchedule";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | TailAdmin - Next.js Admin Dashboard Template",
  description:
    "This is Next.js CRM Dashboard page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Crm() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <CrmMetrics />
      </div>

      <div className="col-span-12 xl:col-span-8">
        <CrmStatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <EstimatedRevenue />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <SalePieChart />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <UpcomingSchedule />
      </div>

      <div className="col-span-12">
        <CrmRecentOrderTable />
      </div>
    </div>
  );
}
