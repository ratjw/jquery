
import { getOpdate } from "../util/date.js"
import { isConsultsTbl } from "./util.js"

// waitnum is for ordering where there is no oproom, casenum
// nextWaitNum is undefined in case of new blank row
// Consults cases have negative waitnum
export function calcWaitnum(thisOpdate, prevrow, nextrow)
{
  let prevWaitNum = Number(prevrow.waitnum) || 0,
      nextWaitNum = Number(nextrow.waitnum) || 0,

  prevOpdate = getOpdate(prevrow.firstElementChild.innerHTML),
  nextOpdate = getOpdate(nextrow.firstElementChild.innerHTML),
  tableID = prevrow.closest("table").id,
  defaultWaitnum = (isConsultsTbl(tableID))? -1 : 1

	return (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate)
			? defaultWaitnum
			: (prevOpdate === thisOpdate && thisOpdate !== nextOpdate)
			? prevWaitNum + defaultWaitnum
			: (prevOpdate !== thisOpdate && thisOpdate === nextOpdate)
			? nextWaitNum ? nextWaitNum / 2 : defaultWaitnum
			: nextWaitNum
			? ((prevWaitNum + nextWaitNum) / 2)
			: (prevWaitNum + defaultWaitnum)
}
