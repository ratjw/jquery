
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
	DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, QN
} from "../model/const.js"

import { oldcontent } from "./edit.js"

import { getOpdate, Alert, updateBOOK, sameDateRoomTableQN } from "../model/util.js"

export function saveOpRoom(pointed, newcontent) {
	let $cells = $(pointed).closest('tr').children("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cells[QN].innerHTML,
		allOldCases = [],
		allNewCases = []

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		allOldCases = allOldCases.filter(e => e !== qn)
	}

	if (newcontent) {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent, theatre)
		if (casenum) {
			allNewCases.splice(casenum-1, 0, qn)
		} else {
			allNewCases.push(qn)
		}
	}

	if (!allOldCases.length && !allNewCases.length) { return }

	let doSaveOpRoom = function() {
		modelSaveOpRoom(allOldCases, allNewCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}


	let undoSaveOpRoom = function() {
		modelSaveOpRoom(allNewCases, allOldCases, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}
	
	doSaveOpRoom()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveOpRoom()
		},
		redo: function() {
			doSaveOpRoom()
		}
	})		
}
