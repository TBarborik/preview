import {authOptions} from "@/lib/auth"
import {Session} from "@/models/session"
import {AuthOptions, getServerSession} from "next-auth"
import {getList} from "@/api/project"
import {ProjectsDataTable} from "@/components/dataTables/Projects"
import Title from "antd/lib/typography/Title"

export default async function Page() {
	const session = await getServerSession<AuthOptions, Session>(authOptions)
	const projects = await getList(session!.token)

	return (
		<>
			<Title style={{marginTop: 0}}>Seznam projektů</Title>
			<ProjectsDataTable projects={projects}/>
		</>
	)
}