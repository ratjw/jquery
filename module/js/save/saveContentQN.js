
import { QN } from "../model/const.js"
import { updateBOOK } from "../util/variables.js"
import { OLDCONTENT } from "../control/edit.js"
import { sqlSaveContentQN } from "../model/sqlSaveContent.js"
import { viewSaveContentQN } from "../view/viewSaveContentQN.js"
import { Alert } from "../util/util.js"

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
export function saveContentQN(pointed, column, newcontent)
{
	let qn = pointed.closest('tr').dataset.qn

	let doSaveContentQN = function () {
		sqlSaveContentQN(column, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, column, OLDCONTENT)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = OLDCONTENT
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}
/*	let undoSaveContentQN = function () {
		sqlSaveContentQN(column, OLDCONTENT, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, column, newcontent)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = newcontent
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}
*/
	doSaveContentQN()

	// make undo-able
/*	UndoManager.add({
		undo: function() {
			undoSaveContentQN()
		},
		redo: function() {
			doSaveContentQN()
		}
	})*/
}
