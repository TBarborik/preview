import React from "react"
import {AuthOptions, getServerSession} from "next-auth"
import {authOptions} from "@/lib/auth"
import {Session} from "@/models/session"
import {get as getBattery} from "@/api/installation"
import {getList as getChartConfigs} from "@/api/chartConfig"
import {Details} from "@/app/app/installations/[id]/info/details"
import {TempChart} from "@/components/charts/temp/tempChart"
import {AuxChart} from "@/components/charts/aux/auxChart"
import {VoltageChart} from "@/components/charts/voltage/voltageChart"
import {ChartCard} from "@/app/app/installations/[id]/info/chartCard"
import {OverviewChart} from "@/components/charts/overview/overviewChart"
import {Voltage24Chart} from "@/components/charts/voltage24/voltage24Chart"
import {jwtDecode} from "jwt-decode"
import {UserToken} from "@/models/userToken"
import {USER_ROLES} from "@/models/user"

export default async function Page({params}: { params: { id: string } }) {
	const session = await getServerSession<AuthOptions, Session>(authOptions)
	const [battery, chartSettings] = await Promise.all([getBattery(session!.token, parseInt(params.id)), getChartConfigs(session!.token)])
	const tokenData = jwtDecode<UserToken>(session!.token)

	const overviewSettings = chartSettings.find(settings => settings.chartType === "OVERVIEW")

	return (
		<React.Fragment>
			<div className="mb-5">
				<Details id={parseInt(params.id)} token={session!.token}/>
			</div>
			<div className="row g-6 g-xl-9">
				<div className="col-lg-12">
					<ChartCard
						title="Přehled"
						enabledFilters={[USER_ROLES.OPERATOR_USER, USER_ROLES.ADMIN_USER, USER_ROLES.ROOT_USER].includes(tokenData.roles[0]) ? ["TIME_TO", "TIME_FROM", "DISABLE_CACHE"] : ["TIME_TO", "TIME_FROM"]}
						chart={<OverviewChart config={overviewSettings ? JSON.parse(overviewSettings.configuration) : undefined} installation={battery}/>}
					/>
				</div>
				<div className="col-lg-6">
					<ChartCard title="Teploty článků"
							   enabledFilters={[USER_ROLES.OPERATOR_USER, USER_ROLES.ADMIN_USER, USER_ROLES.ROOT_USER].includes(tokenData.roles[0]) ? ["TIME_TO", "TIME_FROM", "DISABLE_CACHE"] : ["TIME_TO", "TIME_FROM"]}
							   chart={<AuxChart installation={battery}/>}/>
				</div>
				<div className="col-lg-6">
					<ChartCard title="Teploty modulů"
							   enabledFilters={[USER_ROLES.OPERATOR_USER, USER_ROLES.ADMIN_USER, USER_ROLES.ROOT_USER].includes(tokenData.roles[0]) ? ["TIME_TO", "TIME_FROM", "DISABLE_CACHE"] : ["TIME_TO", "TIME_FROM"]}
							   chart={<TempChart installation={battery}/>}/>
				</div>
				<div className="col-lg-6">
					<ChartCard title="Články" chart={<VoltageChart tail={1} installation={battery}/>}/>
				</div>
				<div className="col-lg-6">
					<ChartCard title="Napětí za 24 hodin" enabledFilters={[USER_ROLES.OPERATOR_USER, USER_ROLES.ADMIN_USER, USER_ROLES.ROOT_USER].includes(tokenData.roles[0]) ? ["DISABLE_CACHE"] : []} chart={<Voltage24Chart installation={battery}/>}/>
				</div>
			</div>
		</React.Fragment>
	)
}
