
import { viewOneDay } from "./viewOneDay.js"
import { refillstaffqueue } from "./fill.js"
import { isSplit } from "../util/util.js"

export function viewSortable(argView) {
	let receiver = argView.receiver,
		moveOpdate = argView.moveOpdate,
		thisOpdate = argView.thisOpdate

	let dropOnTbl = function () {
		viewOneDay(moveOpdate)
		viewOneDay(thisOpdate)
		isSplit() && refillstaffqueue()
		// While splitting, dragging inside tbl of this staff's case
	}
	let dropOnStaff = function () {
		refillstaffqueue()
		viewOneDay(moveOpdate)
		viewOneDay(thisOpdate)
	}

	receiver === "tbl" ? dropOnTbl() : dropOnStaff()
}
