
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"
import { OLDCONTENT } from "../control/edit.js"
import { sqlSaveOpRoom } from "../model/sqlSaveOpRoom.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs, sameDateRoomTableRows } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"
import { UndoManager } from "../model/UndoManager.js"

export function saveOpRoom(pointed, newcontent) {
	let row = pointed.closest('tr'),
		opdate = row.opdate,
		oproom = row.oproom,
		qn = row.qn

	let allOldCases = sameDateRoomTableQNs(row)
	allOldCases = allOldCases.filter(e => e !== qn)

  row.oproom = newcontent
  let allNewCases = sameDateRoomTableRows(row)

	let timeCases = allNewCases.filter(e => e.optime !== "")
	let notimeCases = allNewCases.filter(e => e.optime === "")

	timeCases = timeCases.sort((e1, e2) => {
    if (e1.optime >= e2.optime) return 1
    return -1
  })

	let timeQNs = Array.from(timeCases, e => e.qn)
	let notimeQNs = Array.from(notimeCases, e => e.qn)
	allNewCases = timeQNs.concat(notimeQNs)

	let doSaveOpRoom = function() {
		sqlSaveOpRoom(allOldCases, allNewCases, oproom, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewOneDay(opdate)
				viewSplit(staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}


	let undoSaveOpRoom = function() {
		sqlSaveOpRoom(allNewCases, allOldCases, OLDCONTENT, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewOneDay(opdate)
				viewSplit(staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}
	
	doSaveOpRoom()

	// make undo-able
/*	UndoManager.add({
		undo: function() {
			undoSaveOpRoom()
		},
		redo: function() {
			doSaveOpRoom()
		}
	})*/
}
