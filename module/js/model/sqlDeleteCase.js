
import { postData, MYSQLIPHP } from "./fetch.js"
import { updateCasenum } from "./sqlSaveCaseNum.js"
import { USER } from "../main.js"

// In database, not actually delete the case but SET deleted=1
export function sqlDeleteCase(allCases, oproom, qn, del) {
  let sql = `sqlReturnbook=UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`

  if (allCases.length && oproom) {
    sql += updateCasenum(allCases)
  }

  return postData(MYSQLIPHP, sql)
}
