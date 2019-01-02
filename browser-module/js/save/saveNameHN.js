
import { oldcontent } from "../control/edit.js"

import { fetchGetNameHN } from "../model/fetch.js"

import { Alert, updateBOOK,  } from "../util/util.js"

import { viewGetNameHN } from "../view/fill.js"

export function saveNameHN(pointed, content)
{
	fetchGetNameHN(pointed, content).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewGetNameHN(pointed)
		}
		let noData = function () {
			Alert("saveNameHN", response)
			pointed.innerHTML = oldcontent
			// unsuccessful entry
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => { })
}
