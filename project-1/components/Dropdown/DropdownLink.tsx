"use client"

import {Dropdown} from "@/components/Dropdown/Dropdown"
import {NavLink} from "@/components/ui/NavLink"
import React, {useEffect, useRef, useState} from "react"
import {usePathname} from "@/navigation"

type Props = React.PropsWithChildren & {
	label: string,
}

export function DropdownLink({children, label}: Props) {
	const liRef = useRef<HTMLLIElement | null>(null)
	const [isDropdownOpened, setDropdownOpened] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		const documentClicked = (ev: MouseEvent) => {
			if (liRef.current && isDropdownOpened && !liRef.current.contains(ev.target as HTMLElement)) {
				setDropdownOpened(false)
			}
		}

		document.addEventListener("click", documentClicked)

		return () => {
			document.removeEventListener("click", documentClicked)
		}
	}, [isDropdownOpened])

	useEffect(() => {
		setDropdownOpened(false)
	}, [pathname])

	const handleTriggerClicked = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault()
		setDropdownOpened((cur) => !cur)
	}

	return (
		<NavLink
			onClick={handleTriggerClicked}
			href="#"
			label={label}
			opened={isDropdownOpened}
			ref={liRef}
		>
			<Dropdown show={isDropdownOpened}>
				{children}
			</Dropdown>
		</NavLink>
	)
}