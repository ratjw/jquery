
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { sqlCaseNum } from "./sqlSaveCaseNum.js"
import { sqlMover } from "./sqlMover.js"
import { LARGESTDATE } from "../model/const.js"
import { getLargestWaitnum, URIcomponent } from "../util/util.js"

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
  let r = row.dataset,
    dob = r.dob,
    sql1 = dob ? `'${dob}'` : null

  return `INSERT INTO book SET
    waitnum=${r.waitnum},
    opdate='${r.opdate}',
    theatre='${URIcomponent(r.theatre)}',
    oproom=${r.oproom},
    optime='${r.optime}',
    casenum=${r.casenum},
    staffname='${r.staffname}',
    hn='${r.hn}',
    patient='${URIcomponent(r.patient)}',
    dob=${sql1},
    diagnosis='${URIcomponent(r.diagnosis)}',
    treatment='${URIcomponent(r.treatment)}',
    contact='${URIcomponent(r.contact)}',
    editor='${USER}';`
}
