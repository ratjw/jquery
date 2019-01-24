
import { HN } from "../model/const.js"
import { fetchCaseHistory } from "../model/search.js"
import { Alert } from "../util/util.js"
import { viewCaseHistory } from "../view/viewCaseHistory.js"

export function editHistory()
{
	let	selected = document.querySelector(".selected"),
		row = selected.closest('tr'),
		hn = row.cells[HN].innerHTML

	fetchCaseHistory(hn).then(response => {
		typeof response === "object"
		? viewCaseHistory(row, hn, response)
		: Alert("caseHistory", response)
	}).catch(error => {})
}
