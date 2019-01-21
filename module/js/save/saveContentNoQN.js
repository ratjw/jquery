
import { updateBOOK } from "../util/variables.js"
import { fetchSaveContentNoQN } from "../model/savedata.js"
import { viewSaveContentNoQN } from "../view/viewSaveContentNoQN.js"
import { OLDCONTENT } from "../control/edit.js"
import { Alert } from "../util/util.js"

export function saveContentNoQN(pointed, column, newcontent)
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
			pointed.innerHTML = OLDCONTENT
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => {  })
}
