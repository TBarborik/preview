"use client"

import {Alert, Button, Form, Input, Space} from "antd"
import {useState, useTransition} from "react"
import Link from "next/link"
import {useLocale} from "next-intl"
import {registrationAction} from "@/forms/auth/actions"

export type RegistrationFormData = {
	name: string,
	surname: string,
	email: string,
	password: string,
	passwordVerify: string
}

export function RegistrationForm({callbackUrl}: { callbackUrl?: string }) {
	const locale = useLocale()
	const [isTransitioning, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const handleRegistrationForm = (formData: RegistrationFormData) => {
		startTransition(async () => {
			try {
				const response = await registrationAction(formData)
				setSuccess(`Váš účet byl úspěšně vytvořen. Zkontrolujte, prosím, Váš e-mail ${response.email} pro aktivační zprávu.`)
				setError(null)
			} catch (err: any) {
				err = err as Error
				setSuccess(null)
				setError(`Nepodařilo se Vás registrovat. Chyba serveru ${err.message}.`)
			}
		})
	}

	return (
		<Form
			name="basic"
			labelCol={{span: 8}}
			wrapperCol={{span: 16}}
			style={{maxWidth: 600}}
			onFinish={handleRegistrationForm}
			onFinishFailed={() => {
			}}
			autoComplete="off"
		>
			{error && (<Alert message={error} type="error" showIcon style={{marginBottom: "32px"}}/>)}
			{success && (<Alert message={success} type="success" showIcon style={{marginBottom: "32px"}}/>)}
			<Form.Item
				label="Jméno"
				name="name"
				rules={[{required: true, message: 'Vyplňte Vaše křestní jméno.', type: "string"}]}
			>
				<Input/>
			</Form.Item>
			<Form.Item
				label="Příjmení"
				name="surname"
				rules={[{required: true, message: 'Vyplňte Vaše příjmení.', type: "string"}]}
			>
				<Input/>
			</Form.Item>
			<Form.Item
				label="E-mail"
				name="email"
				rules={[{required: true, message: 'Vyplňte Váš e-mail.', type: "email"}]}
			>
				<Input/>
			</Form.Item>

			<Form.Item
				label="Heslo"
				name="password"
				rules={[{required: true, message: 'Vyplňte Vaše heslo.'}]}
			>
				<Input.Password/>
			</Form.Item>

			<Form.Item
				label="Potvrzení hesla"
				name="passwordVerify"
				dependencies={["password"]}
				rules={[
					{required: true, message: 'Vyplňte Vaše potvrzující heslo.'},
					({getFieldValue}) => ({
						validator(_, value) {
							if (!value || getFieldValue('password') === value) {
								return Promise.resolve()
							}
							return Promise.reject(new Error('Hesla se neshodují.'))
						},
					}),
				]}
			>
				<Input.Password/>
			</Form.Item>

			<Form.Item wrapperCol={{offset: 8, span: 16}}>
				<Space style={{display: "flex", justifyContent: "space-between"}}>
					<Link href={`/${locale}/login`}>Už mám účet</Link>
					<Button loading={isTransitioning} type="primary" htmlType="submit">
						Registrovat se
					</Button>
				</Space>
			</Form.Item>
		</Form>
	)
}