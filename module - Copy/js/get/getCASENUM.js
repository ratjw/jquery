
import { OPROOM } from "../model/const.js"
import { createEditcell, clearEditcell } from "../control/edit.js"
import { savePreviousCell } from "../control/clicktable.js"
import { spinNumber } from "../util/spinner.js"

export function getCASENUM(pointing)
{
	let	room = pointing.closest("tr").cells[OPROOM].innerHTML
	let	patient = pointing.parentElement.lastElementChild.innerHTML
	let	editcell = document.getElementById("editcell")
	let	html = '<input id="spin">'
	let	oldval = pointing.innerHTML
	let	newval = null

	if ( !patient || !room ) {
		savePreviousCell()
		clearEditcell()
		return
	}

	createEditcell(pointing)
	editcell.style.width = "40px"
	editcell.innerHTML = html
  spinNumber($("#spin"), oldval, newval)
}
