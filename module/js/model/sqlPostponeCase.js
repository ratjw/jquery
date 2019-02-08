
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { updateCasenum } from "./sqlSaveCaseNum.js"

export function sqlPostponeCase(allCases, row, thisdate) {
  let waitnum = row.dataset.waitnum,
    oproom = row.dataset.oproom,
    qn = row.dataset.qn,
    sql = `sqlReturnbook=UPDATE book SET opdate='${thisdate}',
        waitnum=${waitnum},theatre='',oproom=null,casenum=null,
        optime='',editor='${USER}' WHERE qn=${qn};`

  if (allCases.length && oproom) {
    sql += updateCasenum(allCases.filter(e => e !== qn))
  }

  return postData(MYSQLIPHP, sql)
}
