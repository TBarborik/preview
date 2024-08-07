"use client"

import React, {useId, useRef, useState} from "react"
import {Popover} from "@/components/ui/popover"
import {Controller, useForm} from "react-hook-form"
import clsx from "clsx"
import {CHART_DATA} from "@/models/charts"
import {DateTimePicker} from "@/components/ui/DateTimePicker"
import {ChartConfig} from "@/models/chartConfig"

type Props = {
	chart: React.ReactElement,
	title: string,
	disableFilters?: boolean,
	chartConfig?: ChartConfig
}

type Filters = {
	timeFrom: Date | null,
	timeTo: Date | null,
	groupBy: number | null,
	tail: number | null
}
const numberFormatter = Intl.NumberFormat("cs")
const dateFormatter = Intl.DateTimeFormat("cs", {timeStyle: "short", dateStyle: "medium"})

export function OverviewChartCard({chart, title, disableFilters, chartConfig}: Props) {
	const id = useId()
	const reloadCallbackRef = useRef<() => void>()
	const [isLoading, setIsLoading] = useState(false)
	const [isLive, setLive] = useState(false)
	const [displayedCharts, setDisplayedCharts] = useState<CHART_DATA[]>(chartConfig && chartConfig.configuration && chartConfig.configuration.length > 0 ? (JSON.parse(chartConfig.configuration).displayedCharts ?? [CHART_DATA.SOC]) : [CHART_DATA.SOC])
	const [activeFilters, setActiveFilters] = useState<Filters>({timeFrom: null, timeTo: null, groupBy: 10, tail: 1000})
	const {register, handleSubmit, formState: {errors}, setError, control} = useForm<Filters>({defaultValues: activeFilters})
	const {register: registerDisplayedCharts, handleSubmit: handleDisplayedChartsSubmit} = useForm<{"displayedCharts": CHART_DATA[] }>({
		defaultValues: {displayedCharts}
	})

	const registerCallback = (callback: () => void) => {
		reloadCallbackRef.current = callback
	}

	const formSubmit = (values: Filters) => {
		if (values.timeFrom && values.timeTo && values.timeFrom > values.timeTo) {
			setError("timeTo", {message: "Datum nesmí být menší než počáteční.", type: "manual"})
			return
		}

		if (values.tail && (values.timeTo || values.timeFrom)) {
			setError("tail", {message: "Zobrazit posledních " + values.tail.toString() + " lze pouze bez od - do..", type: "manual"})
			return
		}

		setActiveFilters({
			timeFrom: values.timeFrom ? new Date(values.timeFrom) : null,
			timeTo: values.timeTo ? new Date(values.timeTo) : null,
			groupBy: values.groupBy && values.groupBy > 0 ? values.groupBy : null,
			tail: values.tail,
		})
	}

	return (
		<div className="card h-lg-100">
			<div className="card-header card-header-stretch align-items-center">
				<div className="card-title flex-column align-items-start gap-2">
					<h3 className="fw-bold m-0 text-gray-800 me-2">{title}</h3>
					{!disableFilters && (
						<div className="d-flex gap-1">
							{activeFilters.tail && (<span className="badge badge-light-primary">Posledních {numberFormatter.format(activeFilters.tail)}</span>)}
							{activeFilters.timeFrom && (<span className="badge badge-light-primary">Od {dateFormatter.format(activeFilters.timeFrom as Date)}</span>)}
							{activeFilters.timeTo && (<span className="badge badge-light-primary">Do {dateFormatter.format(activeFilters.timeTo as Date)}</span>)}
							{activeFilters.groupBy && activeFilters.groupBy > 0 ? (<span className="badge badge-light-primary">Shluky po {numberFormatter.format(activeFilters.groupBy)}</span>) : ""}
						</div>
					)}
				</div>
				<div className="card-toolbar">
					<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
						<input onInput={() => setLive((cur) => !cur)} className="form-check-input" type="checkbox"
							   disabled={!disableFilters && (activeFilters.timeTo !== null || activeFilters.timeFrom !== null)} id={`live-${id}`}/>
						<label className="form-check-label text-muted fs-7" htmlFor={`live-${id}`}>Živě</label>
					</div>
					<button disabled={isLive || isLoading} onClick={() => reloadCallbackRef.current!()}
							className={clsx("btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2", {"disabled": isLive || isLoading})}>
						<i className={clsx("ki-outline ki-arrows-circle fs-1", {"animation animation-rotate": isLoading})}></i>
					</button>
					<Popover trigger={(
						<button className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
							<i className="ki-outline ki-setting-2 fs-1"></i>
						</button>
					)} placement="bottom-end">
						<div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-300px show" data-kt-menu="true">
							<div className="px-7 py-5">
								<div className="fs-5 text-dark fw-bold">Křivky</div>
							</div>
							<div className="separator border-gray-200"></div>
							<form className="px-7 py-5" onSubmit={handleDisplayedChartsSubmit((values) => setDisplayedCharts(values.displayedCharts))}>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.SOC} className="form-check-input" type="checkbox" id={`chart-1-${id}`} {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-1-${id}`}>SOC</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.BATTERY_VOLTAGE} className="form-check-input" type="checkbox" id={`chart-2-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-2-${id}`}>Celkové napětí baterie</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.BATTERY_CURRENT} className="form-check-input" type="checkbox" id={`chart-3-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-3-${id}`}>Proud baterií</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.POWER} className="form-check-input" type="checkbox" id={`chart-4-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-4-${id}`}>Výkon</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.DELTA} className="form-check-input" type="checkbox" id={`chart-5-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-5-${id}`}>Rozdíl napětí min / max článku</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.CHARGING_MAX} className="form-check-input" type="checkbox" id={`chart-6-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-6-${id}`}>Maximální nabíjecí proud</label>
									</div>
								</div>
								<div className="menu-item py-3">
									<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
										<input value={CHART_DATA.DISCHARGING_MAX} className="form-check-input" type="checkbox" id={`chart-7-${id}`}  {...registerDisplayedCharts("displayedCharts")}/>
										<label className="form-check-label text-muted fs-7" htmlFor={`chart-7-${id}`}>Maximální vybíjecí proud</label>
									</div>
								</div>

								<div className="d-flex justify-content-end pt-4">
									<button className="btn btn-sm btn-primary">Zobrazit</button>
								</div>
							</form>
						</div>
					</Popover>
					{!disableFilters && (
						<Popover trigger={(
							<button className="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2">
								<i className="ki-outline ki-filter-square fs-1"></i>
							</button>
						)} placement="bottom-end">
							<div className="menu menu-sub flex-column menu-sub-dropdown w-250px w-md-400px show" data-kt-menu="true">
								<div className="px-7 py-5">
									<div className="fs-5 text-dark fw-bold">Filtrování</div>
								</div>
								<div className="separator border-gray-200"></div>
								<form className="px-7 py-5" onSubmit={handleSubmit(formSubmit)}>
									<div className="row">
										<div className="col-6">
											<div className="d-flex flex-column mb-6 fv-row fv-plugins-icon-container">
												<label className="form-label fw-semibold">
													<span>Od</span>
												</label>
												<Controller control={control} name={"timeFrom"} render={({field: {onChange, ...fieldProps}}) => <DateTimePicker onChange={([date]: Date[], _: string) => onChange(date)} time {...fieldProps} />} />
											</div>
										</div>
										<div className="col-6">
											<div className="d-flex flex-column mb-6 fv-row fv-plugins-icon-container">
												<label className="form-label fw-semibold">
													<span>Do</span>
												</label>
												<Controller control={control} name={"timeTo"} render={({field: {onChange, ...fieldProps}}) => <DateTimePicker onChange={([date]: Date[], _: string) => onChange(date)} time {...fieldProps} />} />
												{errors && errors.timeTo && errors.timeTo.message && (
													<div className="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback d-block">{errors.timeTo.message}</div>
												)}
											</div>
										</div>
									</div>

									<div className="d-flex justify-content-end">
										<button className="btn btn-sm btn-primary">Filtrovat</button>
									</div>
								</form>
							</div>
						</Popover>
					)}
				</div>
			</div>
			<div className="card-body">
				{disableFilters ? React.cloneElement(chart, {live: isLive, reloadCallback: registerCallback, displayedCharts}) : React.cloneElement(chart, {
					live: isLive,
					reloadCallback: registerCallback,
					onLoading: (state: boolean) => setIsLoading(state),
					displayedCharts,
					...activeFilters,
				})}
			</div>
		</div>
	)
}