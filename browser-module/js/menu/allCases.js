
import { fetchAllCases } from "../model/fetch.js"
import { Alert } from "../util/util.js"
import { viewAllCases } from "../view/viewAllCases.js"

// All cases (exclude the deleted ones)
export function allCases() {
	fetchAllCases().then(response => {
		typeof response === "object"
		? viewAllCases(response)
		: Alert("allCases", response)
	}).catch(error => {})
}
