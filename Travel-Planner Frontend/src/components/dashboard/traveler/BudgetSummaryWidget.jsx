import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

const formatDateLabel = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const BudgetSummaryWidget = ({ activities = [] }) => (
  <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-primary text-lg font-semibold text-slate-900">Budget Summary</h3>
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        View <IoIosArrowForward />
      </span>
    </div>

    <div className="space-y-3.5">
      {activities.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">No upcoming activities found.</p>
      ) : activities.map((activity) => (
        <div
          key={`${activity.day}-${activity.title}`}
          className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white/85 px-3 py-2.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
            D{activity.day}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-primary">
              {activity.title}
            </h4>
            <div className="mt-0.5 text-[10px] text-slate-500">{formatDateLabel(activity.date)}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
              <FaMapMarkerAlt size={8} /> {activity.location}
            </div>
          </div>
        </div>
      ))}
    </div>

    <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/15">
      <FaPlus size={10} /> Add Activity
    </button>
  </div>
);

export default BudgetSummaryWidget;
