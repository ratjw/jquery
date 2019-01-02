
import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, OPROOM, CASENUM, STAFFNAME, QN } from "../model/const.js"
import { oldcontent } from "../control/edit.js"
import { fetchSaveContentQN, fetchSaveContentNoQN } from "../model/fetch.js"
import { getOpdate } from "../util/date.js"
import { Alert, updateBOOK, URIcomponent } from "../util/util.js"
import { viewSaveContentQN, viewSaveContentNoQN } from "../view/fill.js"

// use only "pointed" to save data
export function saveContent(pointed, column, newcontent) {
	let qn = $(pointed).siblings("td").last().html()

	// just for show instantly
	pointed.innerHTML = newcontent

	// take care of white space, double qoute, single qoute, and back slash
	newcontent = URIcomponent(newcontent)

	qn
	? saveContentQN(pointed, column, newcontent)
	: saveContentNoQN(pointed, column, newcontent)
}

// Remote effect from editing on main table to queuetbl
// 1. if staffname that match titlename gets involved
//    (either change to or from this staffname)
//    -> refill queuetbl
// 2. make change to the row which match titlename
//    (input is not staffname, but on staff that match titlename)
//    -> refill corresponding cell in another table
// Remote effect from editing on queuetbl to main table
// -> refill corresponding cell
// consults are not apparent on main table, no remote effect
function saveContentQN(pointed, column, newcontent)
{
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		oproom = $cells[OPROOM].innerHTML,
		casenum = $cells[CASENUM].innerHTML,
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML

	let doSaveContentQN = function () {
		fetchSaveContentQN(column, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, oldcontent)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = oldcontent
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}
	let undoSaveContentQN = function () {
		fetchSaveContentQN(column, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, newcontent)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = newcontent
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}

	doSaveContentQN()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveContentQN()
		},
		redo: function() {
			doSaveContentQN()
		}
	})		
}

function saveContentNoQN(pointed, column, newcontent)
{
	// transfer from editcell to table cell, no re-render
	pointed.innerHTML = newcontent

	fetchSaveContentNoQN(pointed, column, newcontent).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSaveContentNoQN(pointed, column)
		}
		let noData = function () {
			Alert("saveContentNoQN", response)

			// return to previous content
			pointed.innerHTML = oldcontent
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => {  })
}
