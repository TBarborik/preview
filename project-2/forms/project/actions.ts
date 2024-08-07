"use server"

import {post as projectPost} from "@/api/project"
import {authOptions} from "@/lib/auth"
import {Session} from "@/models/session"
import {AuthOptions, getServerSession} from "next-auth"
import {revalidateTag} from "next/cache"

export async function createProjectAction(values: any) {
	const session = await getServerSession<AuthOptions, Session>(authOptions)

	try {
		const project = await projectPost(session!.token, values)
		revalidateTag("project-list")
		return project
	} catch (err: any) {
		throw new Error(err)
	}
}