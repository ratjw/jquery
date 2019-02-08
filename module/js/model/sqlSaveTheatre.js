
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum, sqlCaseNum } from "./sqlSaveCaseNum.js"

export function sqlSaveTheatre(allOldCases, allNewCases, theatre, oproom, qn)
{
  let sql = "sqlReturnbook="

  if (oproom) {
    sql += updateCasenum(allOldCases)
  }

  allNewCases.forEach((item, i) => {
    if (item === qn) {
      if (oproom) {
        sql += sqlNewTheatre(theatre, i + 1, qn)
      } else {
        sql += sqlNewTheatre(theatre, null, qn)
      }
    } else {
      if (oproom) { sql += sqlCaseNum(i + 1, item) }
    }
  })

  return postData(MYSQLIPHP, sql);
}

function sqlNewTheatre(theatre, casenum, qn)
{
  return `UPDATE book
          SET theatre='${theatre}',casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}
