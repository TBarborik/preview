"use client"

import React from "react"
import {get as getDetails} from "@/api/batteryState"
import {getOne as getLimits} from "@/api/limits"
import {get as getStats} from "@/api/batteryStats"
import useSWR from "swr"
import Skeleton from "react-loading-skeleton"
import clsx from "clsx"

type Props = {
	id: number,
	token: string
}

const formatter = new Intl.NumberFormat("cs-CZ", {maximumFractionDigits: 3})

function Details({id, token}: Props) {
	const {isLoading: detailLoading, isValidating: detailValidating, data: detail, mutate: mutateDetail} = useSWR(
		"battery-" + id.toString() + "-detail", () => getDetails(token, id),
	)
	const {isLoading: limitsLoading, isValidating: limitsValidating, data: limits, mutate: mutateLimits} = useSWR(
		"battery-" + id.toString() + "-limits", () => getLimits(token, id),
	)
	const {data: stats, isValidating: statsValidating, mutate: mutateStats} = useSWR(
		"battery-" + id.toString() + "-stats", () => getStats(token, id),
	)

	return (
		<div className="row row-cols-2 gx-6 gx-xl-9">
			{((detail === null && detailLoading) || detail !== null) && (<div className="col">
					<div className="border border-gray-300 border-dashed rounded py-3 px-4 mb-5">
						<div className="d-flex justify-content-between align-items-center">
							<h2 className="fs-4 fw-bold">Detail instalace</h2>
							<button onClick={() => {
								mutateDetail()
								mutateStats()
							}} className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
								<i className={clsx("ki-outline ki-arrows-circle fs-3", {"animation animation-rotate": detailLoading || detailValidating || statsValidating})}></i>
							</button>
						</div>
						{detailLoading && <Skeleton count={5}/>}
						{detail && (
							<p className="mb-0">
								<span className="text-gray-800 fw-bold text-start">ID:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{detail.id}</span>
								<br/>
								<span className="text-gray-800 fw-bold text-start">Sériové číslo:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{detail.serialNumber}</span>
								<br/>
								<span className="text-gray-800 fw-bold text-start">Počet článků:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{detail.countOfCells}</span>
								<br/>
								<span className="text-gray-800 fw-bold text-start">Přečerpané množství energie:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{formatter.format(detail.totalWattHours / 1000)} kWh</span>
								{stats && (
									<>
										<br/>
										<span className="text-gray-800 fw-bold text-start">Změřená kapacita baterie:</span>&nbsp;
										<span className="text-gray-400 fw-semibold">{formatter.format(stats.usableAhMeasured)} AH</span> <br/>
										<span className="text-gray-800 fw-bold text-start">Nominální kapacita baterie:</span>&nbsp;
										<span className="text-gray-400 fw-semibold">{formatter.format((stats.nominalCap * detail.countOfCells) / 1000)} kWh</span> <br/>
										<span className="text-gray-800 fw-bold text-start">Meřená kapacita baterie:</span>&nbsp;
										<span className="text-gray-400 fw-semibold">{formatter.format((stats.measuredCap * detail.countOfCells) / 1000)} kWh</span> <br/>
										<span className="text-gray-800 fw-bold text-start">State of health:</span>&nbsp;
										<span className="text-gray-400 fw-semibold">{formatter.format(stats.soh * 100)}%</span>
									</>
								)}
							</p>
						)}
					</div>
				</div>
			)}

			{detail && detail.limitStateFull && (
				<div className="col">
					<div className="border border-gray-300 border-dashed rounded py-3 px-4 mb-5">
						<div className="d-flex justify-content-between align-items-center">
							<h2 className="fs-4 fw-bold">Limit state full</h2>
							<button onClick={() => {
								mutateDetail()
							}} className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
								<i className={clsx("ki-outline ki-arrows-circle fs-3", {"animation animation-rotate": detailLoading || detailValidating})}></i>
							</button>
						</div>
						<p className="mb-0">
							<span className="text-gray-800 fw-bold text-start">Coloumb counter:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateFull.coloumbCounter)}</span><br/>
							<span className="text-gray-800 fw-bold text-start">Max voltage:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateFull.maxVoltage)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Max voltage idx:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateFull.maxVoltageIdx)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Min voltage idx:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateFull.minVoltageIdx)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Soc:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateFull.soc * 100)} %</span>
						</p>
					</div>
				</div>
			)}
			{detail && detail.limitStateEmpty && (
				<div className="col">
					<div className="border border-gray-300 border-dashed rounded py-3 px-4 mb-5">
						<div className="d-flex justify-content-between align-items-center">
							<h2 className="fs-4 fw-bold">Limit state empty</h2>
							<button onClick={() => {
								mutateDetail()
							}} className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
								<i className={clsx("ki-outline ki-arrows-circle fs-3", {"animation animation-rotate": detailLoading || detailValidating})}></i>
							</button>
						</div>
						<p className="mb-0">
							<span className="text-gray-800 fw-bold text-start">Coloumb counter:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateEmpty.coloumbCounter)}</span><br/>
							<span className="text-gray-800 fw-bold text-start">Max voltage:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateEmpty.maxVoltage)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Max voltage idx:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateEmpty.maxVoltageIdx)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Min voltage idx:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateEmpty.minVoltageIdx)} V</span><br/>
							<span className="text-gray-800 fw-bold text-start">Soc:</span>&nbsp;
							<span className="text-gray-400 fw-semibold">{formatter.format(detail.limitStateEmpty.soc * 100)} %</span>
						</p>
					</div>
				</div>
			)}
			{((limits === null && limitsLoading) || limits !== null) && (
				<div className="col">
					<div className="border border-gray-300 border-dashed rounded py-3 px-4 mb-5">
						<div className="d-flex justify-content-between align-items-center">
							<h2 className="fs-4 fw-bold">Limits</h2>
							<button onClick={() => {
								mutateLimits()
							}} className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
								<i className={clsx("ki-outline ki-arrows-circle fs-3", {"animation animation-rotate": limitsLoading || limitsValidating})}></i>
							</button>
						</div>
						{limitsLoading && <Skeleton count={5}/>}
						{limits && (
							<p className="mb-0">
								<span className="text-gray-800 fw-bold text-start">Balancing mode:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{limits.limits.balancingMode ? "ano" : "ne"}</span><br/>
								<span className="text-gray-800 fw-bold text-start">Charging enabled:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{limits.limits.chargingEnabled ? "ano" : "ne"}</span><br/>
								<span className="text-gray-800 fw-bold text-start">Discharging enabled:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{limits.limits.dischargingEnabled ? "ano" : "ne"}</span><br/>
								<span className="text-gray-800 fw-bold text-start">Max charging current:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{formatter.format(limits.limits.maxChargingCurrent)} A</span><br/>
								<span className="text-gray-800 fw-bold text-start">Max discharging current:</span>&nbsp;
								<span className="text-gray-400 fw-semibold">{formatter.format(limits.limits.maxDischargingCurrrent)} A</span>
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export {Details}