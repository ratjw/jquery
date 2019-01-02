import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, EQUIPMENT, CONTACT, QN
} from "../model/const.js"
import {
	pointer, oldcontent, getNewcontent, createEditcell, clearEditcell
} from "./edit.js"
import { clearMouseoverTR } from "../menu/changeDate.js"
import { clearSelection } from "./clearSelection.js"

import { saveTheatre } from "../save/saveTheatre.js"
import { saveOpRoom } from "../save/saveOpRoom.js"
import { saveContent } from "../save/saveContent.js"
import { saveCaseNum } from "../save/saveCaseNum.js"
import { saveHN } from "../save/saveHN.js"

import { selectRow } from "../get/selectRow.js"
import { getROOMCASE } from "../get/getROOMCASE.js"
import { getOPTIME } from "../get/getOPTIME.js"
import { getSTAFFNAME } from "../get/getSTAFFNAME.js"
import { getHN } from "../get/getHN.js"
import { getNAME } from "../get/getNAME.js"
import { getEQUIP } from "../get/getEQUIP.js"

// Click on main or staff table
export function clicktable(evt, clickedCell) {
	savePreviousCell()
	editPresentCell(evt, clickedCell)
}

export function savePreviousCell() {
	let cell = pointer && pointer.cellIndex,
		newcontent = getNewcontent(),
		save = {}

	if ($("#spin").is(":visible")) { newcontent = $("#spin").val() }

	if (!pointer || (oldcontent === newcontent)) { return }

	save[OPDATE] = null
	save[THEATRE] = () => { saveTheatre(pointer, newcontent) }
	save[OPROOM] = () => { saveOpRoom(pointer, newcontent) }
	save[OPTIME] = () => { saveContent(pointer, "optime", newcontent) }
	save[CASENUM] = () => { saveCaseNum(pointer, newcontent) }
	save[STAFFNAME] = null
	save[HN] = () => { saveHN(pointer, newcontent) }
	save[PATIENT] = null
	save[DIAGNOSIS] = () => { saveContent(pointer, "diagnosis", newcontent) }
	save[TREATMENT] = () => { saveContent(pointer, "treatment", newcontent) }
	save[CONTACT] = () => { saveContent(pointer, "contact", newcontent) }
	save[CONTACT] = () => { saveContent(pointer, "contact", newcontent) }

	if (save[cell]) { save[cell]() }
}

// Set up editcell for keyin or menu/spinner selection
// redirect click to openPACS or file upload
export function editPresentCell(evt, pointing) {
	let cell = pointing && pointing.cellIndex
	let store = {}

	store[OPDATE] = () => selectRow(evt, pointing)
	store[THEATRE] = () => createEditcell(pointing)
	store[OPROOM] = () => getROOMCASE(pointing)
	store[OPTIME] = () => getOPTIME(pointing)
	store[CASENUM] = () => getROOMCASE(pointing)
	store[STAFFNAME] = () => getSTAFFNAME(pointing)
	store[HN] = () => getHN(evt, pointing)
	store[PATIENT] = () => getNAME(evt, pointing)
	store[DIAGNOSIS] = () => createEditcell(pointing)
	store[TREATMENT] = () => createEditcell(pointing)
	store[EQUIPMENT] = () => getEQUIP(pointing)
	store[CONTACT] = () => createEditcell(pointing)

	store[cell] && store[cell]()
	if (cell === OPDATE) {
		clearEditcell()
		clearMouseoverTR()
	} else {
		clearSelection()
	}
}
