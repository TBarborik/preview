import {Observable} from "@/lib/observable"

export type listenerCallback<T> = (data: T | null) => void

export type eventObservables<T> = Map<number, {
	event: EventSource,
	observable: Observable<T | null>
}>

export function handleEvent<T>(event: EventSource, observable: Observable<T>) {
	event.addEventListener("message", (ev) => {
		const data = JSON.parse(ev.data)
		observable.set(data)
	})

	event.addEventListener("error", () => {
		// @ts-ignore
		observable.set(null)
		observable.unsubscribeAll()
	})
}