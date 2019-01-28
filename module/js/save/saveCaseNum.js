
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"
import { OLDCONTENT, clearEditcell } from "../control/edit.js"
import { fetchSaveCaseNum } from "../model/sqlSaveCaseNum.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"
import { UndoManager } from "../model/UndoManager.js"

export function saveCaseNum(pointed, newcontent)
{
	let row = pointed.closest("tr"),
		opdate = row.opdate,
		qn = row.qn,
		allCases = []

	// must have oproom, if no, can't be clicked
	allCases = sameDateRoomTableQNs(row)
	allCases = allCases.filter(e => e !== qn)

	let doSaveCaseNum = function() {
		fetchSaveCaseNum(allCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewOneDay(opdate)
				viewSplit(staffname)
			}
			let noData = function() {
				Alert ("saveCaseNum", response)
				clearEditcell()
			}

			typeof response === "object"
			? hasData()
			: noData()
		}).catch(error => {})
	}
	let undoSaveCaseNum = function() {
		fetchSaveCaseNum(allCases, OLDCONTENT, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewOneDay(opdate)
				viewSplit(staffname)
			}
			let noData = function() {
				Alert ("saveCaseNum", response)
				clearEditcell()
			}

			typeof response === "object"
			? hasData()
			: noData()
		}).catch(error => {})
	}
	
	doSaveCaseNum()

	// make undo-able
/*	UndoManager.add({
		undo: function() {
			undoSaveCaseNum()
		},
		redo: function() {
			doSaveCaseNum()
		}
	})*/
}
