"use server"

import {AuthOptions, getServerSession} from "next-auth"
import {Session} from "@/models/session"
import {authOptions} from "@/lib/auth"
import {post as installationPost, put as installationPut} from "@/api/installation"
import {redirect} from "next/navigation"
import {RedirectType} from "next/dist/client/components/redirect"
import {revalidateTag} from "next/cache"
import {FormValues} from "@/components/forms/battery/add"


export async function addFormAction(values: FormValues) {
	const session = await getServerSession<AuthOptions, Session>(authOptions)
	let id = 0

	if (!values.owner)
		values.owner = null

	try {
		const response = Object.prototype.hasOwnProperty.call(values, "id") && values.id ? await installationPut(session!.token, values) : await installationPost(session!.token, values)
		id = response.id
	} catch (err: any) {
		return {error: err.toString()}
	}

	revalidateTag(`battery-installation-${id}`)
	revalidateTag("battery-installation-list")

	if (!Object.prototype.hasOwnProperty.call(values, "id") || !values.id)
		redirect(`/app/installations/${id}`, RedirectType.push)
}