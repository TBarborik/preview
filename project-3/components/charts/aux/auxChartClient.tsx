"use client"

import {chartOptions, datasetSettings} from "@/lib/chartjs"
import {LineChart} from "@/components/charts/lineChart"

const numberFormatter = new Intl.NumberFormat("cs")

type Props = {
	xAxis: (number | string)[],
	yAxis: { name: string, data: number[] }[],
	title?: string
}

export function AuxChartClient({xAxis, yAxis, title}: Props) {
	const options = {
		...chartOptions,
		plugins: {
			zoom: {
				pan: {
					enabled: true,
					mode: 'xy',
					modifierKey: "meta"
				},
				zoom: {
					wheel: {
						enabled: true,
						modifierKey: "meta"
					},
					pinch: {
						enabled: true
					},
					mode: 'xy',
				}
			},
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: title,
			},
			tooltip: {
				mode: "index",
				intersect: false,
				callbacks: {
					label: function (context: any) {
						let label = context.dataset.label || ''

						if (label) {
							label += ': '
						}
						if (context.parsed.y !== null) {
							label += context.parsed.y.toFixed(1).toString() + " °C"
						}
						return label
					},
				},
			},
			subtitle: {
				display: true,
				text: `${xAxis[0]} → ${xAxis[xAxis.length - 1]}`,
				padding: {
					bottom: 10,
				},
			},
			colors: {
				enabled: true,
			},
		},
		scales: {
			y: {
				ticks: {
					stepSize: 1,
					callback: function (value: string | number, _: any, __: any) {
						return numberFormatter.format(parseFloat(value as string)) + " °C"
					},
				},
			},
		},
	}

	const data = {
		labels: xAxis,
		datasets: yAxis.map((data) => ({
			...datasetSettings,
			label: data.name,
			data: data.data,
			tension: 0.4,
		})),
	}


	return (
		<LineChart height={320} options={options as any} data={data}/>
	)
}