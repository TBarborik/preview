import {Form, FormInstance, Input, notification} from "antd"
import React, {useEffect, useTransition} from "react"
import {createProjectAction} from "@/forms/project/actions"

type Props = {
	form?: FormInstance,
	onTransitionChange?: (val: boolean) => void
}

export function CreateProjectForm({form, onTransitionChange}: Props) {
	const [api, contextHolder] = notification.useNotification()
	const [isTransitioning, startTransition] = useTransition()

	useEffect(() => {
		if (onTransitionChange)
			onTransitionChange(isTransitioning)
	}, [isTransitioning, onTransitionChange])

	const handleCreateForm = (values: any) => {
		startTransition(async () => {
			try {
				const project = await createProjectAction(values)
				api["success"]({message: "Projekt byl úspěně vytvořen.", description: `Projekt '${project.name}' se podařilo úspěšně vytvořit. Naleznete jej pod id ${project.id}.`})
			} catch (err: any) {
				if (err.message !== "NEXT_REDIRECT") {
					console.log(err)
					api["error"]({
						message: "Chyba při vytváření projektu.",
						description: `Projekt se nepodařilo vytvořit, protože se vyskytla chyba ${err.message}. Zkuste to, prosím, později nebo nás kontaktujte.`,
					})
				}
				else
					throw err
			}
		})
	}

	return (
		<Form
			form={form}

			layout="vertical"
			onFinish={handleCreateForm}
		>
			{contextHolder}
			<Form.Item
				name="name"
				label="Název"
				rules={[{required: true, message: 'Vyplňte název projektu.'}]}
			>
				<Input/>
			</Form.Item>
			<Form.Item name="description" label="Popis" initialValue="">
				<Input.TextArea/>
			</Form.Item>
		</Form>
	)
}