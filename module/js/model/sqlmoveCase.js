
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"
import { sqlMover } from "./sqlMover.js"

export function sqlmoveCase(allOldCases, allNewCases, moverow, thisrow) {
  let sql = "sqlReturnbook=",
    thisdate = thisrow.dataset.opdate,
    thistheatre = thisrow.dataset.theatre,
    thisroom = thisrow.dataset.oproom,
    waitnum = moverow.dataset.waitnum,
    moveroom = moverow.dataset.oproom,
    moveqn = moverow.dataset.qn

  if (moveroom) { sql += updateCasenum(allOldCases) }

  allNewCases.forEach((e, i) => {
    if (e === moveqn) {
      thisroom
      ? sql += sqlMover(waitnum, thisdate, thistheatre, thisroom, i + 1, moveqn)
      : sql += sqlMover(waitnum, thisdate, thistheatre, null, null, moveqn)
    } else {
      thisroom
      ? sql += sqlCaseNum(i + 1, e)
      : sql += sqlCaseNum(null, e)
    }
  })

  return postData(MYSQLIPHP, sql)
}
