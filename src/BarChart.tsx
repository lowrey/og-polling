import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { flatten } from "lodash-es";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const backgroundColor = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
  "rgba(255, 99, 132, 0.6)"
];

export const createChartData = (polls: {
  [pollName: string]: {
    pollName: string;
    username: string;
    address: string;
    value: string;
    timestamp: number;
  }[]
}, pollName: string) => {
  const poll = polls[pollName];
  const voteTotals = poll?.reduce((votes, ballot) => {
    const userVoted = flatten(Object.values(votes)).includes(ballot.username);
    if (!userVoted && votes[ballot.value]) {
      votes[ballot.value].push(ballot.username);
    } else if (!userVoted) {
      votes[ballot.value] = [ballot.username];
    }
    return votes;
  }, {} as { [total: string]: string[] }) ?? [];
  return {
    datasets: [
      {
        data: Object.entries(voteTotals).map(([total, users]) => ({
          value: users.length,
          id: total,
          meta: users
        })),
        backgroundColor
      }
    ]
  };
};

const footer = (
  args: {
    chart: any;
    dataset: any;
    datasetIndex: number;
    dataIndex: number;
    raw: any;
    label: string;
  }[]
) => {
  const { raw } = args[0];
  return raw.meta.join("\n");
};

export const BarChart = ({ chartData, title }: { chartData: any; title: string }) => {
  const options = useMemo(() => {
    return {
      responsive: true,
      parsing: {
        xAxisKey: "id",
        yAxisKey: "value"
      },
      plugins: {
        legend: {
          // position: "top" as const,
          display: false
        },
        title: {
          display: true,
          text: title
        },
        tooltip: {
          callbacks: {
            footer
          }
        }
      }
    };
  }, [title]);
  return (
    <div className="chart">
      <Bar data={chartData} options={options} />
    </div>
  );
};

