"use client"

import {Installation} from "@/models/installation"
import {get as auxTempsGet} from "@/api/auxTemps"
import {AuxChartClient} from "./auxChartClient"
import React, {useEffect} from "react"
import {useSession} from "next-auth/react"
import useSWR from "swr"
import Lottie from "lottie-react"
import loading from "../../../../public/lottie/graph-loading.json"
import {ChartMetadata} from "@/models/chartMetadata"

const formatter = new Intl.DateTimeFormat("cs-CZ", {timeStyle: "medium"})
const numberFormatter = Intl.NumberFormat("cs")

type Props = {
	installation: Installation | number,
	timeFrom?: Date | null,
	timeTo?: Date | null,
	groupBy?: string | null,
	tail?: number | null,
	live?: number | boolean,
	onLoading?: (arg0: boolean) => void,
	reloadCallback?: (fn: () => void) => void,
	forceFiltersFromMeta?: (meta: ChartMetadata) => void
}

export function AuxChart({installation, live, reloadCallback, onLoading, forceFiltersFromMeta, ...filters}: Props) {
	const installationId = typeof installation === "number" ? installation : installation.id
	const {data: session} = useSession()
	const {
		isLoading,
		isValidating,
		data,
		mutate
	} = useSWR(
		session && (session as any).token ? "chart-aux-" + installationId.toString() : null,
		() => auxTempsGet((session as any).token, installationId, filters),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			refreshWhenOffline: false,
			onSuccess: ({metadata}) => {
				if (forceFiltersFromMeta) {
					forceFiltersFromMeta({timeFrom: filters.timeFrom ? filters.timeFrom.getTime() : null, timeTo: filters.timeTo ? filters.timeTo.getTime() : null, groupBy: metadata.groupBy, count: metadata.count})
				}
			}
		},
	)

	useEffect(() => {
		if (reloadCallback) {
			reloadCallback(() => {
				forceFiltersFromMeta!({timeFrom: filters.timeFrom ? filters.timeFrom.getTime() : null, timeTo: filters.timeTo ? filters.timeTo.getTime() : null, groupBy: null, count: null})
			})
		}
	}, [reloadCallback, ...Object.values(filters)])


	useEffect(() => {
		let interval: NodeJS.Timeout | null = null
		if (!isLoading && live && !filters.timeTo) {
			interval = setInterval(() => {
				if (isValidating)
					return
				mutate()
			}, (typeof live === "number" ? live : 5) * 1000)
		}

		return () => {
			if (interval)
				clearInterval(interval)
		}
	}, [live, isLoading, data])

	useEffect(() => {
		if (!isLoading && !isValidating && (!("groupBy" in filters) || filters.groupBy == null)) {
			mutate()
		}

	}, Object.values(filters))

	useEffect(() => {
		if (onLoading)
			onLoading(isLoading || isValidating)
	}, [isLoading, isValidating])

	if (isLoading)
		return <div className="h-100 d-flex align-items-center justify-content-center"><Lottie style={{height: 335}} animationData={loading}/></div>

	if (!data)
		return <p>No data.</p>

	const chartData = "data" in data ? data.data : data

	if (chartData.length > 1000)
		return <p>Too much data - {numberFormatter.format(chartData.length)} items.</p>

	if (chartData.length === 0)
		return <p>No data.</p>

	const date = new Date()
	const xAxis = chartData.map(item => {
		date.setTime(item.created)
		return formatter.format(date)
	})

	const yAxis: Array<{ name: string, data: number[] }> = []
	chartData.forEach((item) => {
		item.auxTemps.forEach((val, idx) => {
			if (typeof yAxis[idx] === "undefined") {
				yAxis[idx] = {
					name: "blok " + idx.toString(),
					data: [val],
				}
			} else {
				yAxis[idx].data.push(val)
			}
		})
	})

	return (
		<AuxChartClient title={`Celkem ${numberFormatter.format(xAxis.length)} položek`} xAxis={xAxis} yAxis={yAxis}/>
	)
}