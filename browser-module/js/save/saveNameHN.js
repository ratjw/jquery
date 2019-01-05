
import { OLDCONTENT } from "../control/edit.js"
import { fetchGetNameHN } from "../model/fetch.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewGetNameHN } from "../view/view.js"

export function saveNameHN(pointed, content)
{
	fetchGetNameHN(pointed, content).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewGetNameHN(pointed)
		}
		let noData = function () {
			Alert("saveNameHN", response)
			pointed.innerHTML = OLDCONTENT
			// unsuccessful entry
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => { })
}
