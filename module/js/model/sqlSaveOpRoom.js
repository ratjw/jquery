
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"

export function sqlSaveOpRoom(allOldCases, allNewCases, oldoproom, newoproom, qn)
{
  let sql = "sqlReturnbook="

  if (allOldCases.length && oldoproom) {
    sql += updateCasenum(allOldCases)
  }

  if (allNewCases.length) {
    allNewCases.forEach((item, i) => {
      if (newoproom) {
        if (item === qn) {
          sql += sqlNewRoom(newoproom, i + 1, qn)
        } else {
          sql += sqlCaseNum(i + 1, item)
        }
      } else {
        // if no oproom, will have no casenum too
        sql += sqlNewRoom(null, null, qn)
      }
    })
  }

  return postData(MYSQLIPHP, sql)
}

function sqlNewRoom(oproom, casenum, qn)
{
  return `UPDATE book SET oproom=${oproom},casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}
