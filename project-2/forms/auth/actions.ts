"use server"

import {RegistrationFormData} from "@/forms/auth/registration"
import {register} from "@/api/user"
import {User} from "@/models/user"
import {useLocale} from "next-intl"

export async function registrationAction(values: RegistrationFormData & { verifyUrl?: string }): Promise<User> {
	const locale = useLocale()
	values.verifyUrl = (process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_NEXTAUTH_URL) + "/api/auth/verify?locale=" + locale

	try {
		return await register(values)
	} catch (error: any) {
		throw new Error(error.toString())
	}
}