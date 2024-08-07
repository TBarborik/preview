"use server"

import {revalidateTag} from "next/cache"

export async function reloadButtonAction(batteryId: number) {
	revalidateTag(`origin-data-${batteryId}`)
}