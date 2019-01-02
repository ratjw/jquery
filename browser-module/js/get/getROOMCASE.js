
import { OPROOM, CASENUM } from "../model/const.js"
import { createEditcell, clearEditcell } from "../control/edit.js"
import { savePreviousCell } from "../control/clicktable.js"
import { clearTimer } from "../control/updating.js"

export function getROOMCASE(pointing)
{
	let	noPatient = !$(pointing).siblings(":last").html(),
		noRoom = !$(pointing).closest("tr").find("td").eq(OPROOM).html(),
		getCasenum = pointing.cellIndex === CASENUM,
		oldval = pointing.innerHTML,
		$editcell = $("#editcell"),
		newval = null,
		html = '<input id="spin">'

	if ( noPatient || getCasenum && noRoom ) {
		savePreviousCell()
		clearEditcell()
		return
	}

	createEditcell(pointing)
	$editcell.css("width", 40)
	$editcell.html(html)

	let	$spin = $("#spin")
	$spin.css("width", 35)
	$spin.val(oldval)
	$spin.spinner({
		min: 0,
		max: 99,
		step: 1,
		// make newval 0 as blank value
		spin: function( event, ui ) {
			newval = ui.value || ""
		},
		stop: function( event, ui ) {
			if (newval !== null) {
				$spin.val(newval)
				newval = null
			}
		}
	})
	$spin.focus()
	clearTimer(timer)
}
