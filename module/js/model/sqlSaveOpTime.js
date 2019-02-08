
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"

export function sqlSaveOpTime(allCases, oproom, optime, qn)
{
  let sql = "sqlReturnbook="

  allCases.forEach((e, i) => {
    if (oproom) {
      if (e === qn) {
        sql += sqlNewTime(optime, i + 1, qn)
      } else {
        sql += sqlCaseNum(i + 1, e)
      }
    } else {
      sql += sqlNewTimeNoRoom(optime, qn)
    }
  })

  return postData(MYSQLIPHP, sql)
}

function sqlNewTime(optime, casenum, qn)
{
  return `UPDATE book SET optime='${optime}',casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

function sqlNewTimeNoRoom(optime, qn)
{
  return `UPDATE book SET optime='${optime}',editor='${USER}' WHERE qn=${qn};`
}
