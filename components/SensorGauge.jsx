"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

export default function SensorGauge({
  label,
  value,
  max,
  unit = "",
  color = "#22c55e",
}) {
  const percentage = Math.min(
    (Number(value) / max) * 100,
    100
  );

  const options = {
    chart: {
      type: "radialBar",
    },
    colors: [color],

    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: "60%",
        },

        dataLabels: {
            show: false,
          name: {
            fontSize: "14px",
          },

          value: {
            fontSize: "24px",
            fontWeight: 700,

            formatter: () =>
              `${value}${unit}`,
          },
        },
      },
    },

    labels: [label],
  };

  return (
    <Chart
      options={options}
      series={[percentage]}
      type="radialBar"
      height={160}
    />
  );
}