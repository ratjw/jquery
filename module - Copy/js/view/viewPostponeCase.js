
import { viewSplit } from "./viewSplit.js"
import { LARGESTDATE } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { scrolltoThisCase } from "./scrolltoThisCase.js"

export function viewPostponeCase(opdate, thisdate, staffname, qn)
{
	if (opdate !== LARGESTDATE) { viewOneDay(opdate) }
	if (thisdate !== LARGESTDATE) { viewOneDay(thisdate) }

	// moveCase of this staffname's case, re-render
	viewSplit(staffname)

	scrolltoThisCase(qn)
}
