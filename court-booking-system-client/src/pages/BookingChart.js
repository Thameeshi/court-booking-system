import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1E90FF", "#32CD32", "#FFA500", "#FF4500",
  "#6A5ACD", "#FF69B4", "#00CED1", "#9932CC",
];

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 14,
  color: "#222",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

const labelStyle = {
  fontWeight: "600",
  fontSize: 14,
  fill: "#333",
  textShadow: "0 1px 1px #fff",
};

const BookingChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await courtService.getCourtBookingStats();
        console.log("[BookingChart] Fetched stats:", stats);
        setData(stats);
      } catch (error) {
        console.error("[BookingChart] Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          fontFamily: "Inter, 'Segoe UI', sans-serif",
          fontSize: 16,
          color: "#777",
          textAlign: "center",
          padding: 50,
          fontStyle: "italic",
        }}
      >
        No booking data available to display.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "60px auto",
        padding: 30,
        background: "#f9f9f9", // Changed to solid off-white
        borderRadius: 20,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontFamily: "Inter, 'Segoe UI', sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: 35,
          fontWeight: "900",
          fontSize: "2.1rem",
          color: "#054c2a",
          textTransform: "uppercase",
          letterSpacing: 1,
          textShadow: "0 2px 4px rgba(8, 83, 24, 0.2)",
        }}
      >
        Court Booking Distribution
      </h2>

      <ResponsiveContainer width="100%" height={420}>
        <PieChart>
          <Pie
            data={data}
            dataKey="bookings"
            nameKey="courtName"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({ courtName, bookings }) => `${courtName}: ${bookings}`}
            labelLine={false}
            style={labelStyle}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, "Bookings"]}
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(30, 144, 255, 0.1)" }}
          />
          <Legend
            verticalAlign="bottom"
            height={50}
            iconType="circle"
            wrapperStyle={{
              fontSize: 15,
              color: "#444",
              fontWeight: "500",
              letterSpacing: 0.5,
              marginTop: 16,
              textAlign: "center",
              lineHeight: "24px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingChart;
