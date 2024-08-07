"use client"

import {Project} from "@/models/project"
import {Button, Space, Table} from "antd"
import {useState} from "react"
import {FileSearchOutlined} from "@ant-design/icons"
import {useRouter} from "next/navigation"
import {useLocale} from "next-intl"

export function ProjectsDataTable({projects}: {projects: Project[]}) {
	const [selectedRows, setSelectedRows] = useState<any[]>([])
	const locale = useLocale()
	const router = useRouter()

	const columns = [
		{
			key: 'name',
			title: 'Název',
			dataIndex: 'name'
		},
		{
			key: 'actions',
			title: 'Akce',
			width: 1,
			render: (_: any, data: Project) => (
				<Space size="middle">
					<Button onClick={() => {router.push(`/${locale}/app/projects/${data.id}`)}} type="primary" icon={<FileSearchOutlined />}>
						Detail
					</Button>
				</Space>
			)
		}
	]

	return (
		<>
			<Table
				rowSelection={{
					type: "checkbox",
					onChange: (selected) => setSelectedRows(selected)
				}}
				rowKey="id"
				dataSource={projects}
				columns={columns}
			/>
		</>
	)
}