import classes from "./styles.module.scss"
import React from "react"
import {clsx} from "clsx"

type Props = React.PropsWithChildren & {
	show?: boolean
}

export function Dropdown({children, show = false}: Props) {
	return (
		<ul className={clsx(classes.dropdown, {[classes["dropdown-opened"]]: show})}>
			{children}
		</ul>
	)
}