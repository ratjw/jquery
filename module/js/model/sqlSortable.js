
import { postData, MYSQLIPHP } from "./fetch.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"
import { sqlMover } from "./sqlMover.js"

export function sqlSortable(allOldCases, allNewCases, moverow, thisrow)
{
  let newWaitnum = moverow.dataset.waitnum,
    moveroom = moverow.dataset.oproom,
    moveqn = moverow.dataset.qn,
    thisOpdate = thisrow.dataset.opdate,
    theatre = thisrow.dataset.theatre || "",
    thisroom = thisrow.dataset.oproom || null,
    sql = "sqlReturnbook="

  if (allOldCases.length && moveroom) {
    sql += updateCasenum(allOldCases)
  }

  allNewCases.forEach((e, i) => {
    sql += (e === moveqn)
      ? thisroom
        ? sqlMover(newWaitnum, thisOpdate, theatre, thisroom, i + 1, moveqn)
        : sqlMover(newWaitnum, thisOpdate, theatre, null, null, moveqn)
      : thisroom
        ? sqlCaseNum(i + 1, e)
        : sqlCaseNum(null, e)
  })

  return postData(MYSQLIPHP, sql);
}
