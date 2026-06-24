import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function JobStatusChart({ stats }) {
  if (stats.total === 0) {
    return (
      <div className="chart-container">
        <h2>Application Analytics</h2>

        <div className="chart-empty-state">
          📋 No Applications Yet
          <br />
          Start tracking your job applications by adding your first application.
        </div>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  const data = [
    { name: "Applied", value: stats.applied, fill: COLORS[0] },
    { name: "Interview", value: stats.interview, fill: COLORS[1] },
    { name: "Offer", value: stats.offer, fill: COLORS[2] },
    { name: "Rejected", value: stats.rejected, fill: COLORS[3] },
  ];

  return (
    <div className="chart-container">
      <h2>Application Status</h2>

      <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={false} />

            <Tooltip />

            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default JobStatusChart;
