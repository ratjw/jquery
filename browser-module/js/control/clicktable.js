import {
	pointer, oldcontent, getNewcontent, createEditcell, clearEditcell
} from "./edit.js"
import { clearMouseoverTR } from "../model/menu.js"

import {
	saveTheatre, saveOpRoom, saveContent, saveCaseNum, saveHN, selectRow,
	getROOMCASE, getOPTIME, getSTAFFNAME, getHN, getNAME, getEQUIP,
	clearSelection
} from "./click.js"

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
