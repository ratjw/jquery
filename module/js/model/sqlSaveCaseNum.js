
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"

export function sqlSaveCaseNum(allCases, casenum, qn)
{
  let sql = "sqlReturnbook="

  if (casenum === "") {
    sql += sqlCaseNum(null, qn)
  } else {
    allCases.splice(casenum - 1, 0, qn)
  }

  allCases.forEach((item, i) => {
    if (item === qn) {
      sql += sqlCaseNum(casenum, qn)
    } else {
      sql += sqlCaseNum(i + 1, item)
    }
  })

  return postData(MYSQLIPHP, sql)
}

export function sqlCaseNum(casenum, qn)
{  
  return `UPDATE book SET casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

export function updateCasenum(allCases)
{
  let sql = ""
  allCases.forEach((item, i) => {
    sql += sqlCaseNum(i + 1, item)
  })
  return sql
}
