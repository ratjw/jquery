
import { isOnConsultsTbl } from "./util.js"

// waitnum is for ordering where there is no oproom, casenum
// nextrow is null in case of the last row
// nextWaitNum is undefined in case of new blank row
// Consults cases have negative waitnum
export function calcWaitnum(thisOpdate, prevrow, nextrow)
{
  let prevWaitNum = Number(prevrow.dataset.waitnum) || 0,
      nextWaitNum = nextrow ? (Number(nextrow.dataset.waitnum) || 0) : prevWaitNum + 2,

  prevOpdate = prevrow.dataset.opdate,
  nextOpdate = nextrow ? nextrow.dataset.opdate : prevOpdate,
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

  return (isOnConsultsTbl(tableID))? -1 : 1
}
