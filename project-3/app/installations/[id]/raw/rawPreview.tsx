"use client"

import {CodePreview} from "@/components/ui/codePreview"
import React, {useEffect, useState} from "react"
import {useSession} from "next-auth/react"
import {useSessionId} from "@/hooks/useSessionId"

const dateTimeFormatter = Intl.DateTimeFormat("cs", {timeStyle: "medium"})

type RawPreviewProps = {
	batteryId: number
}

export function RawPreview({batteryId}: RawPreviewProps) {
	const sessionId = useSessionId()
	const [data, setData] = useState<string|null>(null)
	const [dateTime, setDateTime] = useState<Date|null>(null)
	const [isLive, setIsLive] = useState(true)

	useEffect(() => {
		let event: EventSource | null = null
		if (isLive) {
			event = new EventSource((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + `/api/battery/sseOriginData?batteryId=${batteryId}&token=${sessionId}`)
			event.addEventListener("message", (ev) => {
				setData(JSON.parse(ev.data))
				setDateTime(new Date())
			})
		}

		return () => {
			if (event) {
				event.close()
			}
		}
	}, [isLive, sessionId])

	return (
		<div className="card">
			<div className="card-header card-header-stretch align-items-center">
				<div className="card-title d-flex align-items-center">
					<i className="ki-outline ki-code fs-1 text-primary me-3 lh-0"></i>
					<h3 className="fw-bold m-0 text-gray-800">Hrubá data</h3>
				</div>
				<div className="card-toolbar">
					<div className="card-toolbar">
						{dateTime ? <div className="me-2">{dateTimeFormatter.format(dateTime)}</div> : ""}
						<div className="form-check disabled form-check-solid form-switch form-switch-sm form-check-custom fv-row">
							<input checked={isLive} onChange={() => setIsLive((cur) => !cur)} className="form-check-input" type="checkbox" id="live-raw"/>
							<label className="form-check-label text-muted fs-7" htmlFor="live-raw">Živě</label>
						</div>
					</div>
				</div>
			</div>
			<div className="card-body">
				{data ? (<CodePreview code={(data) ? JSON.stringify(data, null, 4) : ""} language="JavaScript"/>) : (
					<span className="spinner-border text-primary mx-auto d-block my-10" style={{"width": "3rem", "height": "3rem"}} role="status"> <span className="visually-hidden">Loading...</span></span>
				)}
			</div>
		</div>
	)
}