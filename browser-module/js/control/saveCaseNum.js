
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
	DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, QN
} from "../model/const.js"

import { oldcontent, clearEditcell } from "./edit.js"

import { getOpdate, Alert, updateBOOK, sameDateRoomTableQN } from "../model/util.js"

import { viewSaveCaseNum } from "../view/view.js"

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
		modelSaveCaseNum(allOldCases, allNewCases, newcontent, qn).then(response => {
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
		modelSaveCaseNum(allNewCases, allOldCases, oldcontent, qn).then(response => {
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
