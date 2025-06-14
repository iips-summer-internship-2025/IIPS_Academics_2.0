export default function StatusSummary({ counts, onStatusClick }) {
  const stats = [
    {
      key: "total",
      label: "Total Resources",
      value: counts.total,
      numberColor: "text-blue-600",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: "pending",
      label: "Pending Review",
      value: counts.pending,
      numberColor: "text-orange-500",
      icon: (
        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "approved",
      label: "Approved",
      value: counts.approved,
      numberColor: "text-green-600",
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "rejected",
      label: "Rejected",
      value: counts.rejected,
      numberColor: "text-red-600",
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8" >
      {stats.map((stat) => (
        <div
          key={stat.key}
          onClick={() => onStatusClick?.(stat.key)}
          className="cursor-pointer rounded-md border-2 border-gray-300 p-5 shadow-[7px_8px_4.8px_rgba(0,0,0,0.1)] transition-all hover:shadow-md bg-white"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2b3333]">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.numberColor}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

