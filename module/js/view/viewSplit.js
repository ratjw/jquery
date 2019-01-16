
import { isConsults, isSplit, isStaffname } from "../util/util.js"
import { refillstaffqueue } from "./fill.js"

export function viewSplit(staffname) {
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
}
