import React from "react"
import {RawPreview} from "@/app/app/installations/[id]/raw/rawPreview"

export default async function Page({params}: { params: { id: string } }) {
	return (
		<div className="row">
			<div className="col">
				<RawPreview batteryId={parseInt(params.id)}/>
			</div>
		</div>
	)
}