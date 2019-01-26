
import { COMPLICATION } from "../model/const.js"

// used when freshly loaded SERVICE from DB only
// changes after this, must use showInputColor(target)
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
