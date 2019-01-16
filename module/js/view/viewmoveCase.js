
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"

export function viewmoveCase(movedate, thisdate, staffname)
{
	viewOneDay(movedate)

	if (movedate !== thisdate) {
		viewOneDay(thisdate)
	}
	viewSplit(staffname) 
}
