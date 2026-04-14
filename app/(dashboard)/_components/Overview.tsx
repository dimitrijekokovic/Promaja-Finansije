"use client";

import { startOfMonth } from "date-fns";
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import StatsCards from "./StatsCards";

import CategoriesStats from "./CategoriesStats";

type ClientUserSettings = {
  userId: string;
  currency: string;
  currentBalance: number;
};

function Overview({ userSettings }: { userSettings: ClientUserSettings }) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 px-8 py-6">
        <h2 className="text-3xl font-bold">Kontolna tabla</h2>
        <div className="flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;

              if (!from || !to) return;

              setDateRange({ from, to });
            }}
          />
        </div>
      </div>

      <div className="container flex w-full flex-col gap-2">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />

        <CategoriesStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  );
}

export default Overview;
