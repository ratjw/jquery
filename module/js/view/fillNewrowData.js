
import {
  OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
  DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT
} from "../model/const.js"
import { putNameAge } from "../util/date.js"
import { isPACS } from "../util/updateBOOK.js"
import { rowDecoration } from "./rowDecoration.js"
import { viewEquip, viewEquipNoImg } from "./viewEquip.js"
import { setRowData, blankRowData } from "../model/rowdata.js"
import { isOnStaffnameTbl, hoverPicArea } from "../util/util.js"

export function fillNewrowData(row, q)
{
  let tableID = row.closest('table').id,
    cells = row.cells

  setRowData(row, q)
  if (q.hn && isPACS) { cells[HN].className = "pacs" }

  cells[THEATRE].innerHTML = q.theatre
  cells[OPROOM].innerHTML = q.oproom || ""
  cells[OPTIME].innerHTML = q.optime
  cells[CASENUM].innerHTML = q.casenum || ""
  cells[STAFFNAME].innerHTML = q.staffname
  cells[HN].innerHTML = q.hn
  cells[PATIENT].innerHTML = putNameAge(q)
  cells[DIAGNOSIS].innerHTML = q.diagnosis
  cells[TREATMENT].innerHTML = q.treatment
  cells[EQUIPMENT].innerHTML = isOnStaffnameTbl(tableID)
                             ? viewEquipNoImg(q.equipment)
                             : viewEquip(q.equipment)
  cells[CONTACT].innerHTML = q.contact
}

export function fillOldrowData(row, q)
{
  let tableID = row.closest('table').id,
    rowdata = row.dataset

  if (rowdata.waitnum !== q.waitnum) {
    rowdata.waitnum = q.waitnum
  }
  if (rowdata.theatre !== q.theatre) {
    rowdata.theatre = q.theatre
    row.cells[THEATRE].innerHTML = q.theatre
  }
  if (rowdata.oproom !== (q.oproom || "")) {
    rowdata.oproom = q.oproom || ""
    row.cells[OPROOM].innerHTML = q.oproom || ""
  }
  if (rowdata.optime !== q.optime) {
    rowdata.optime = q.optime
    row.cells[OPTIME].innerHTML = q.optime
  }
  if (rowdata.casenum !== (q.casenum || "")) {
    rowdata.casenum = q.casenum || ""
    row.cells[CASENUM].innerHTML = q.casenum || ""
  }
  if (rowdata.staffname !== q.staffname) {
    rowdata.staffname = q.staffname
    row.cells[STAFFNAME].innerHTML = q.staffname
  }
  if (rowdata.hn !== q.hn) {
    rowdata.hn = q.hn
    row.cells[HN].innerHTML = q.hn
  }
  if (rowdata.patient !== q.patient) {
    rowdata.patient = q.patient
    row.cells[PATIENT].innerHTML = q.patient
  }
  if (rowdata.dob !== (q.dob || "")) {
    rowdata.dob = q.dob || ""
  }
  if (rowdata.diagnosis !== q.diagnosis) {
    rowdata.diagnosis = q.diagnosis
    row.cells[DIAGNOSIS].innerHTML = q.diagnosis
  }
  if (rowdata.treatment !== q.treatment) {
    rowdata.treatment = q.treatment
    row.cells[TREATMENT].innerHTML = q.treatment
  }
  if (rowdata.equipment !== q.equipment) {
    rowdata.equipment = q.equipment
    row.cells[EQUIPMENT].innerHTML = isOnStaffnameTbl(tableID)
                             ? viewEquipNoImg(q.equipment)
                             : viewEquip(q.equipment)
  }
  if (rowdata.contact !== q.contact) {
    rowdata.contact = q.contact
    row.cells[CONTACT].innerHTML = q.contact
  }
  if (rowdata.qn !== q.qn) {
    rowdata.qn = q.qn
  }
}

export function unfillOldrowData(row, opdate)
{
  let cells = row.cells

  Array.from(cells).filter(e => e.cellIndex !== OPDATE).forEach(e => e.innerHTML = "")
  cells[HN].classList.remove("pacs")
  rowDecoration(row, opdate)
  blankRowData(row, opdate)
}
