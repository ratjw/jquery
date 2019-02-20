
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { calcWaitnum, defaultWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { URIcomponent, getTitlename } from "../util/util.js"
import { BOOK } from "../util/updateBOOK.js"

const GETNAMEHN  = "php/getnamehn.php"

export function sqlMoveCaseHN(pointed, waiting, wanting)
{
  let  sql = `sqlReturnbook=UPDATE book SET deleted=1,editor='${USER}' WHERE qn=${waiting.qn};`
           + sqlCaseHN(pointed, waiting, wanting)

  return postData(MYSQLIPHP, sql);
}

export function sqlCopyCaseHN(pointed, waiting, wanting)
{
  let  sql = "sqlReturnbook=" + sqlCaseHN(pointed, waiting, wanting)

  return postData(MYSQLIPHP, sql);
}

function sqlCaseHN(pointed, waiting, wanting)
{
  let tableID = pointed.closest('table').id,
    qn = pointed.closest('tr').dataset.qn

  if (qn) {
    return sqlUpdateHN(tableID, qn, waiting, wanting)
  } else {
    return sqlInsertHN(tableID, pointed, waiting, wanting)
  }
}

function sqlInsertHN(tableID, pointed, waiting, wanting)
{
  let row = pointed.closest("tr"),
    opdate = row.dataset.opdate,

    hn = waiting.hn,
    patient = waiting.patient,
    dob = waiting.dob,
    staffname = getTitlename(tableID),

    // new row, calculate waitnum
    // store waitnum in row waitnum
    waitnum = calcWaitnum(opdate, row.previousElementSibling, row.nextElementSibling)

  return `INSERT INTO book
    (waitnum,opdate,hn,patient,dob,staffname,diagnosis,treatment,contact,editor)
    VALUES (${waitnum},'${opdate}','${hn}','${patient}','${dob}',
    '${wanting.staffname || staffname}','${URIcomponent(wanting.diagnosis)}',
    '${URIcomponent(wanting.treatment)}','${URIcomponent(wanting.contact)}',
    '${USER}');`
}

function sqlUpdateHN(tableID, qn, waiting, wanting)
{
  let hn = waiting.hn,
    patient = waiting.patient,
    dob = waiting.dob,
    staffname = getTitlename(tableID)

  return `UPDATE book
    SET hn='${hn}',
      patient='${patient}',
      dob='${dob}',
      staffname='${wanting.staffname || staffname}',
      diagnosis='${URIcomponent(wanting.diagnosis)}',
      treatment='${URIcomponent(wanting.treatment)}',
      contact='${URIcomponent(wanting.contact)}',
      editor='${USER}'
    WHERE qn=${qn};`
}

// ** to do ** search hn from DB
export function sqlGetNameHN(pointed, content)
{
  let tableID = pointed.closest('table').id,
    oldcase = BOOK.reverse().find(q => q.hn === content),
    oldstaffname = tableID === 'queuetbl' ? getTitlename(tableID) : '',
    olddiagnosis = '',
    oldtreatment = '',
    oldcontact = ''

  if (oldcase) {
    oldstaffname = oldcase.staffname || oldstaffname
    olddiagnosis = oldcase.diagnosis
    oldtreatment = oldcase.treatment
    oldcontact = oldcase.contact
  }

  let row = pointed.closest('tr'),
    opdate = row.dataset.opdate,
    qn = row.dataset.qn,
    staffname = row.dataset.staffname || oldstaffname,
    diagnosis = row.dataset.diagnosis || olddiagnosis,
    treatment = row.dataset.treatment || oldtreatment,
    contact = row.dataset.contact || oldcontact,
    waitnum = defaultWaitnum(row),
    prevrow = row.previousElementSibling,
    nextrow = row.nextElementSibling

  // if new case, calculate waitnum
  // store waitnum in row waitnum
  if (!qn) {
    waitnum = calcWaitnum(opdate, prevrow, nextrow)
  }

  let sql = `hn=${content}&waitnum=${waitnum}&opdate=${opdate}&staffname=${staffname}&diagnosis=${diagnosis}&treatment=${treatment}&contact=${contact}&qn=${qn}&editor=${USER}`

  return postData(GETNAMEHN, sql)
}
