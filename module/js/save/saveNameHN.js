
import { fetchGetNameHN } from "../model/savehn.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewGetNameHN } from "../view/viewGetNameHN.js"

export function saveNameHN(pointed, content)
{
	fetchGetNameHN(pointed, content).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewGetNameHN(pointed)
		}
		let noData = function () {
			Alert("saveNameHN", response)
			pointed.innerHTML = ""
			// unsuccessful entry
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => { })
}
