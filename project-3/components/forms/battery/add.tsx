import React, {useState, useTransition} from "react"
import {useForm} from "react-hook-form"
import {addFormAction} from "@/components/forms/battery/addAction"
import {Installation} from "@/models/installation"
import {User, USER_ROLES} from "@/models/user"
import {useSession} from "next-auth/react"
import {jwtDecode} from "jwt-decode"
import {UserToken} from "@/models/userToken"
import errors from "../../../../public/locales/cs/errors.json"

export type FormValues = {
	detail: string,
	name: string,
	serialNumber: string,
	owner: number | null,
	id?: number
}

export function AddForm({values, users, onSuccess}: { values?: Installation, users: User[], onSuccess?: () => void }) {
	const [error, setError] = useState<null | string>(null)
	const [isPending, startTransition] = useTransition()
	const {register, handleSubmit} = useForm<FormValues>({defaultValues: values})
	const {data: session} = useSession()

	const userData: UserToken | null = session ? jwtDecode((session as any).token as string) : null

	return (
		<form
			onSubmit={
				handleSubmit(
					(values: FormValues) => startTransition(
						async () => {
							if (values.owner)
								values.owner = parseInt(values.owner as any)
							try {
								const response = await addFormAction(values)
								if (response && Object.prototype.hasOwnProperty.call(response, "error"))
									setError(response.error)
								else if (onSuccess)
									onSuccess()
							} catch (err: any) {
								if (err.message !== "NEXT_REDIRECT")
									setError(err.message)
								else
									throw err
							}
						},
					),
				)
			}>

			{error && (
				<div className="notice bg-light-danger rounded border-danger border border-dashed mb-12 flex-shrink-0 p-6">
					<h4 className="text-gray-900 fw-bold">Nepodařilo se přidat položku</h4>
					<p className="fs-6 text-gray-700 pe-7 mb-0">
						{Object.prototype.hasOwnProperty.call(errors.installation, error) ? (errors.installation as any)[error] : (`Na serveru se vyskytla chyba ${error}. Zkuste to, prosím, později nebo nás kontaktujte.`)}
					</p>
				</div>
			)}
			<div className="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
				<label className="d-flex align-items-center fs-6 fw-semibold mb-2">
					<span className="required">Název</span>
				</label>

				<input type="text" className="form-control form-control-solid" required {...register("name", {required: true})}/>
			</div>
			{userData && (!userData.roles.includes(USER_ROLES.BASE_USER)) && (
				<>
					<div className="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
						<label className="d-flex align-items-center fs-6 fw-semibold mb-2">
							<span className="required">Sériové číslo</span>
						</label>

						<input type="text" className="form-control form-control-solid" required {...register("serialNumber", {required: true})}/>
					</div>
					<div className="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
						<label className="d-flex align-items-center fs-6 fw-semibold mb-2">
							<span>Vlastník</span>
						</label>

						<select className="form-control form-control-solid form-select" {...register("owner")}>
							<option value=""></option>
							{users.map(user => <option key={user.id} value={user.id}>{user.name} {user.surname}</option>)}
						</select>
					</div>
				</>
			)}
			<div className="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
				<label className="d-flex align-items-center fs-6 fw-semibold mb-2">
					<span>Popis</span>
				</label>

				<input type="text" className="form-control form-control-solid" {...register("detail")}/>
				<input type="hidden" {...register("id")}/>
			</div>
			<div className="text-center">
				<button type="submit" className="btn btn-primary" data-kt-indicator={isPending ? "on" : "off"}>
					<span className="indicator-label">Odeslat</span>
					<span className="indicator-progress indicator-progress"><span className="spinner-border spinner-border-sm align-middle"></span></span>
				</button>
			</div>
			<input type="hidden" {...register("id")}/>
		</form>
	)
}