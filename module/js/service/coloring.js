
import { COMPLICATION } from "../model/const.js"

export function coloring(row) {
	let classname = ""
	let complication = []

	COMPLICATION.forEach(e => {
		complication.push(row.querySelector('input[title="' + e + '"]'))
	})

	complication.forEach(e => {
		if ((e.value > 1) || e.checked) {
			row.classList.add(e.title)
		}
	})
}
