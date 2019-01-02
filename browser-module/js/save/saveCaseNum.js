
import { OPDATE, THEATRE, OPROOM, QN } from "../model/const.js"
import { oldcontent, clearEditcell } from "../control/edit.js"
import { fetchSaveCaseNum } from "../model/fetch.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQN } from "../util/getrows.js"
import { Alert, updateBOOK } from "../util/util.js"
import { viewSaveCaseNum } from "../view/fill.js"
import { UndoManager } from "../model/UndoManager.js"

export function saveCaseNum(pointed, newcontent)
{
	let $cells = $(pointed).closest("tr").find("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cells[THEATRE].innerHTML,
		oproom = $cells[OPROOM].innerHTML,
		qn = $cells[QN].innerHTML

	// must have oproom, if no, can't be clicked
	allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	allCases = allCases.filter(e => e !== qn)

	let doSaveCaseNum = function() {
		fetchSaveCaseNum(allOldCases, allNewCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveCaseNum(opdate, staffname)
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
		fetchSaveCaseNum(allNewCases, allOldCases, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveCaseNum(opdate, staffname)
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
	UndoManager.add({
		undo: function() {
			undoSaveCaseNum()
		},
		redo: function() {
			doSaveCaseNum()
		}
	})		
}
