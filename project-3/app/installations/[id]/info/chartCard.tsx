"use client"

import React, {useCallback, useId, useRef, useState} from "react"
import {Popover} from "@/components/ui/popover"
import {Controller, useForm} from "react-hook-form"
import clsx from "clsx"
import {DateTimePicker} from "@/components/ui/DateTimePicker"
import {ChartMetadata} from "@/models/chartMetadata"
import {ChartConfig} from "@/models/chartConfig"

enum FILTER_TYPES {
	TIME_FROM = "TIME_FROM",
	TIME_TO = "TIME_TO",
	GROUP_BY = "GROUP_BY",
	TAIL = "TAIL",
	DISABLE_CACHE = "DISABLE_CACHE"
}

type Filters = {
	timeFrom?: Date | null,
	timeTo?: Date | null,
	groupBy?: number | null,
	tail?: number | null,
	disableCache?: boolean
}

type Props = {
	chart: React.ReactElement,
	title: string,
	enabledFilters?: FILTER_TYPES[] | string[],
	defaultFilters?: Filters,
	chartConfig?: ChartConfig
}

const numberFormatter = Intl.NumberFormat("cs")
const dateFormatter = Intl.DateTimeFormat("cs", {timeStyle: "short", dateStyle: "medium"})

export function ChartCard({chart, title, enabledFilters, defaultFilters, chartConfig}: Props) {
	const id = useId()
	const reloadCallbackRef = useRef<() => void>()
	const [isLoading, setIsLoading] = useState(false)
	const [isLive, setLive] = useState(false)
	const [activeFilters, setActiveFilters] = useState<Filters>(defaultFilters ?? {timeFrom: null, timeTo: null, groupBy: null, tail: null, disableCache: false})
	const {register, handleSubmit, control, setValue, formState: {errors}, setError} = useForm<Filters>({defaultValues: activeFilters})
	const registerCallback = useCallback((callback: () => void) => {
		reloadCallbackRef.current = callback
	}, [])

	const handleMetadataFilters = useCallback((metadata: ChartMetadata) => {
		const newFilters = {
			timeFrom: "timeFrom" in metadata && metadata.timeFrom ? new Date(metadata.timeFrom) : activeFilters.timeFrom,
			timeTo: "timeTo" in metadata && metadata.timeTo ? new Date(metadata.timeTo) : activeFilters.timeTo,
			groupBy: "groupBy" in metadata ? metadata.groupBy : activeFilters.groupBy,
			tail: "count" in metadata ? metadata.count : activeFilters.tail
		}

		setValue("tail", newFilters.tail)
		setValue("groupBy", newFilters.groupBy)
		setValue("timeTo", newFilters.timeTo)
		setValue("timeFrom", newFilters.timeFrom)

		setActiveFilters((curFilters) => ({...curFilters, ...newFilters}))
	}, [])

	const formSubmit = (values: Filters) => {
		if (values.timeFrom && values.timeTo && values.timeFrom > values.timeTo) {
			setError("timeTo", {message: "Datum nesmí být menší než počáteční.", type: "manual"})
			return
		}

		if (enabledFilters && enabledFilters.includes(FILTER_TYPES.TAIL) && values.tail && (values.timeTo || values.timeFrom)) {
			setError("tail", {message: "Zobrazit posledních " + values.tail.toString() + " lze pouze bez od - do.", type: "manual"})
			return
		}

		if (enabledFilters && enabledFilters.includes(FILTER_TYPES.DISABLE_CACHE) && values.disableCache && (values.timeTo || values.timeFrom)) {
			setError("disableCache", {message: "Lze použít pouze bez datumu.", type: "manual"})
			return
		}

		if (enabledFilters && !enabledFilters.includes(FILTER_TYPES.GROUP_BY)) {
			values.groupBy = null
		} else if (values.groupBy && values.groupBy <= 0) {
			values.groupBy = null
		}

		if (enabledFilters && !enabledFilters.includes(FILTER_TYPES.TIME_TO)) {
			values.timeTo = null
		} else if (values.timeTo) {
			values.timeTo = new Date(values.timeTo)
		}

		if (enabledFilters && !enabledFilters.includes(FILTER_TYPES.TIME_FROM)) {
			values.timeFrom = null
		} else if (values.timeFrom) {
			values.timeFrom = new Date(values.timeFrom)
		}

		setActiveFilters(values)
	}

	return (
		<div className="card">
			<div className="card-header card-header-stretch align-items-center flex-nowrap">
				<div className="card-title flex-column align-items-start gap-2">
					<h3 className="fw-bold m-0 text-gray-800 me-2">{title}</h3>
					{activeFilters && (activeFilters.tail || activeFilters.timeFrom || activeFilters.timeTo || activeFilters.groupBy) && (
						<div className="d-flex gap-1 flex-wrap">
							{activeFilters.tail && (<span className="badge badge-light-primary">Posledních {numberFormatter.format(activeFilters.tail)}</span>)}
							{activeFilters.timeFrom && (<span className="badge badge-light-primary">Od {dateFormatter.format(activeFilters.timeFrom)}</span>)}
							{activeFilters.timeTo && (<span className="badge badge-light-primary">Do {dateFormatter.format(activeFilters.timeTo)}</span>)}
							{activeFilters.groupBy && activeFilters.groupBy > 0 ? (<span className="badge badge-light-primary">Shluky po {numberFormatter.format(activeFilters.groupBy)}</span>) : ""}
							{activeFilters.disableCache ? (<span className="badge badge-light-primary">Bez cache</span>) : ""}
						</div>
					)}
				</div>
				<div className="card-toolbar flex-nowrap">
					<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
						<input onInput={() => setLive((cur) => !cur)} className="form-check-input" type="checkbox"
							   disabled={enabledFilters && enabledFilters.includes(FILTER_TYPES.TIME_TO) && activeFilters.timeTo !== null}
							   id={`live-${id}`}/>
						<label className="form-check-label text-muted fs-7" htmlFor={`live-${id}`}>Živě</label>
					</div>
					<button disabled={isLive || isLoading || activeFilters.timeTo != null} onClick={() => reloadCallbackRef.current!()}
							className={clsx("btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end w-auto h-auto ms-2", {"disabled": isLive || isLoading})}>
						<i className={clsx("ki-outline ki-arrows-circle fs-1", {"animation animation-rotate": isLoading})}></i>
					</button>
					{enabledFilters && enabledFilters.length > 0 && (
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
										{enabledFilters && enabledFilters.includes(FILTER_TYPES.TIME_FROM) && (
											<div className="col-6">
												<div className="d-flex flex-column mb-6 fv-row fv-plugins-icon-container">
													<label className="form-label fw-semibold">
														<span>Od</span>
													</label>
													<Controller control={control} name={"timeFrom"}
																render={
																	({field: {onChange, ...fieldProps}}) => <DateTimePicker onChange={([date]: Date[], _: string) => onChange(date)}
																															time {...fieldProps} />
																}
													/>
												</div>
											</div>
										)}
										{enabledFilters && enabledFilters.includes(FILTER_TYPES.TIME_TO) && (
											<div className="col-6">
												<div className="d-flex flex-column mb-6 fv-row fv-plugins-icon-container">
													<label className="form-label fw-semibold">
														<span>Do</span>
													</label>
													<Controller control={control} name={"timeTo"}
																render={({field: {onChange, ...fieldProps}}) => <DateTimePicker onChange={([date]: Date[], _: string) => onChange(date)}
																																time {...fieldProps} />}/>
													{errors && errors.timeTo && errors.timeTo.message && (
														<div className="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback d-block">{errors.timeTo.message}</div>
													)}
												</div>
											</div>
										)}
										{enabledFilters && enabledFilters.includes(FILTER_TYPES.DISABLE_CACHE) && (
											<div className="col-6">
												<div className="d-flex flex-column mb-10 fv-row fv-plugins-icon-container">
													<label className="form-label fw-semibold">
														<span>Cache</span>
													</label>
													<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
														<input className="form-check-input" type="checkbox" id={`disableCache-${id}`} {...register("disableCache")} />
														<label className="form-check-label text-muted fs-7" htmlFor={`disableCache-${id}`}>Načítat bez cache</label>
													</div>
													{errors && errors.disableCache && errors.disableCache.message && (
														<div className="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback d-block">{errors.disableCache.message}</div>
													)}
												</div>
											</div>
										)}
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
				{(!enabledFilters || enabledFilters.length === 0) ? React.cloneElement(chart, {
					live: isLive,
					reloadCallback: registerCallback,
					forceFiltersFromMeta: handleMetadataFilters,
					onLoading: (state: boolean) => setIsLoading(state),
				}) : React.cloneElement(chart, {
					live: isLive,
					reloadCallback: registerCallback,
					onLoading: (state: boolean) => setIsLoading(state),
					forceFiltersFromMeta: handleMetadataFilters,
					...activeFilters,
				})}
			</div>
		</div>
	)
}