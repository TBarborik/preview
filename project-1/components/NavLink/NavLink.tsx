import {Link} from "@/navigation"
import classes from "./styles.module.scss"
import {clsx} from "clsx"
import React from "react"

type Props = React.ComponentProps<typeof Link> & {
	label: string,
	variant?: "white" | "dark",
	opened?: boolean
}

export const NavLink = React.forwardRef<HTMLLIElement, Props>( function NavLink({children, label, variant, className, opened, ...rest}: Props, ref) {
	return (
		<li ref={ref} className={clsx(classes["nav-link"], {[classes["nav-link-white"]]: variant && variant === "white", [classes["opened"]]: opened}, className)}>
			<Link tabIndex={0} {...rest}>{label}</Link>
			{children}
		</li>
	)
})