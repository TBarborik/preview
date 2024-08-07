import {Project} from "@/models/project"

export const endpoint: string = "/api/core/project"

export async function getList(token: string): Promise<Project[]> {
	let response =  await fetch((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + endpoint, {
		method: "GET",
		headers: {"Content-type": "application/json", "authorization": "Bearer " + token},
		next: {tags: [`project-list`]}
	})

	return Promise.resolve(response.status === 200 ? await response.json() : [])
}

export async function get(token: string, id: number): Promise<Project | null> {
	let response =  await fetch((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + endpoint + `?id=${id}`, {
		method: "GET",
		headers: {"Content-type": "application/json", "authorization": "Bearer " + token},
		next: {tags: [`project-${id}`]}
	}).then(response => response.status === 200 ? response.json() : null)

	return Promise.resolve(response)
}

export async function post(token: string, data: any): Promise<Project> {
	const response = await fetch((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + endpoint, {
		method: "POST", body: JSON.stringify(data),
		headers: {"Content-type": "application/json", "authorization": "Bearer " + token},
	})

	if (response.status !== 200) {
		return Promise.reject(response.status)
	}

	return Promise.resolve(await response.json())
}

export async function put(token: string, data: any): Promise<Project> {
	const response = await fetch((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + endpoint, {
		method: "PUT", body: JSON.stringify(data),
		headers: {"Content-type": "application/json", "authorization": "Bearer " + token},
	})

	if (response.status !== 200) {
		return Promise.reject(response.status)
	}

	return Promise.resolve(await response.json())
}

export async function remove(token: string, id: number): Promise<number> {
	const response = await fetch((process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL) + endpoint + `?id=${id}`, {
		method: "DELETE",
		headers: {"authorization": "Bearer " + token},
	})

	if (response.status !== 200) {
		return Promise.reject(response.status)
	}

	return Promise.resolve(200)
}