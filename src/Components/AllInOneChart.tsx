import * as chartjs from 'chart.js';
import React from 'react';
import { ChartData, Line } from 'react-chartjs-2';

interface IAllInOneChartProps {
  labels: string[],
  activeData: number[],
  confirmedData: number[],
  recoveredData: number[],
  deathsData: number[],
}

export const AllInOneChart = (props: IAllInOneChartProps) => {

  const defaultDataset = {
    label: 'Active',
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(192,92,41,0.4)',
    borderColor: 'rgb(192,92,41)',
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: 'rgba(192,92,41,1)',
    pointBackgroundColor: '#fff',
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(192,92,41,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointHoverBorderWidth: 2,
    pointRadius: 4,
    pointHitRadius: 10,
    data: props.activeData,
  };

  const data: ChartData<chartjs.ChartData> = {
    labels: props.labels,
    datasets: [
      Object.assign({}, defaultDataset,
        {
          label: 'Confirmed',
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgb(99,255,255)',
          pointBackgroundColor: 'rgb(99,255,255)',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          data: props.confirmedData,
        }),
      Object.assign({}, defaultDataset,
      {
        label: 'Active',
        backgroundColor: 'rgba(192,92,41,0.4)',
        borderColor: 'rgb(255,122,54)',
        pointBackgroundColor: 'rgb(255,122,54)',
        pointBorderColor: 'rgba(192,92,41,1)',
        pointHoverBackgroundColor: 'rgba(192,92,41,1)',
        data: props.activeData,
      }),
      Object.assign({}, defaultDataset,
      {
        label: 'Recovered',
        backgroundColor: 'rgba(113,192,56,0.4)',
        borderColor: 'rgb(113,192,56)',
        pointBorderColor: 'rgb(113,192,56)',
        pointBackgroundColor: 'rgb(167,255,65)',
        pointHoverBackgroundColor: 'rgb(113,192,56)',
        data: props.recoveredData,
      }),
      Object.assign({}, defaultDataset,
      {
        label: 'Deaths',
        backgroundColor: 'rgba(188,192,187,0.4)',
        borderColor: 'rgb(188,192,187)',
        pointBorderColor: 'rgb(188,192,187)',
        pointBackgroundColor: 'rgb(251,255,249)',
        pointHoverBackgroundColor: 'rgb(188,192,187)',
        data: props.deathsData,
      })
    ]
  };

  return (
    <Line
      data={data}
      options={{ maintainAspectRatio: true }}
    />
  );
};
