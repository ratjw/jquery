
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { sqlCaseNum } from "./sqlSaveCaseNum.js"
import { sqlMover } from "./sqlMover.js"
import { LARGESTDATE } from "../model/const.js"
import { getLargestWaitnum } from "../util/util.js"

export function sqlcopyCase(allNewCases, moverow, thisrow) {
  let sql = "sqlReturnbook=",
    thisdate = thisrow.dataset.opdate,
    thistheatre = thisrow.dataset.theatre,
    thisroom = thisrow.dataset.oproom,
    row = moverow.cloneNode(true),
    staffname = row.dataset.staffname,
    qn = row.dataset.qn,
    index = allNewCases.indexOf(qn)

  if (thisdate === LARGESTDATE) {
    row.dataset.waitnum = Math.ceil(getLargestWaitnum(BOOK, staffname)) + 1
    row.dataset.opdate = LARGESTDATE
    row.dataset.theatre = ''
    row.dataset.oproom = null
    row.dataset.casenum = null
  } else {
    row.dataset.opdate = thisdate
    row.dataset.theatre = thistheatre
    if (thisroom) {
      row.dataset.oproom = thisroom
      row.dataset.casenum = i + 1
    } else {
      row.dataset.oproom = null
      row.dataset.casenum = null
    }
  }

  sql += sqlInsert(row)

  return postData(MYSQLIPHP, sql)
}

function sqlInsert(row)
{
  let dob = row.dataset.dob,
    sql1 = dob ? `'${dob}'` : null

  return `INSERT INTO book SET
    waitnum=${row.dataset.waitnum},
    opdate='${row.dataset.opdate}',
    theatre='${row.dataset.theatre}',
    oproom=${row.dataset.oproom},
    optime='${row.dataset.optime}',
    casenum=${row.dataset.casenum},
    staffname='${row.dataset.staffname}',
    hn='${row.dataset.hn}',
    patient='${row.dataset.patient}',
    dob=${sql1},
    diagnosis='${row.dataset.diagnosis}',
    treatment='${row.dataset.treatment}',
    contact='${row.dataset.contact}',
    editor='${USER}';`
}
