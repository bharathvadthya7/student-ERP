import React from "react";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  detail?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  detail,
  color = "blue"
}) => {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </div>
  );
};
