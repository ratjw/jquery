
import { getOpdate } from "../util/date.js"
import { isConsultsTbl } from "./util.js"

// waitnum is for ordering where there is no oproom, casenum
// nextWaitNum is undefined in case of new blank row
// Consults cases have negative waitnum
export function calcWaitnum(thisOpdate, prevrow, nextrow)
{
  let prevWaitNum = Number(prevrow.dataset.waitnum) || 0,
      nextWaitNum = Number(nextrow.dataset.waitnum) || 0,

  prevOpdate = getOpdate(prevrow.firstElementChild.innerHTML),
  nextOpdate = getOpdate(nextrow.firstElementChild.innerHTML),
  defaultwaitnum = defaultWaitnum(prevrow)

	return (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate)
			? defaultwaitnum
			: (prevOpdate === thisOpdate && thisOpdate !== nextOpdate)
			? prevWaitNum + defaultwaitnum
			: (prevOpdate !== thisOpdate && thisOpdate === nextOpdate)
			? nextWaitNum ? nextWaitNum / 2 : defaultwaitnum
			: nextWaitNum
			? ((prevWaitNum + nextWaitNum) / 2)
			: (prevWaitNum + defaultwaitnum)
}

export function defaultWaitnum(row)
{
  let tableID = row.closest('table').id

  return (isConsultsTbl(tableID))? -1 : 1
}
