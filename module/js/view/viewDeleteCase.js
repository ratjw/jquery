
import { OPDATE, HN, PATIENT } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"
import { getOpdate } from "../util/date.js"
import { isConsults } from "../util/util.js"
import { showStaffOnCall } from "./fillConsults.js"
import { blankRowData } from "../model/rowdata.js"

export function viewDeleteCase(row) {
  let tableID = row.closest('table').id
  let opdate = row.opdate

  viewOneDay(opdate)
  if (tableID === "tbl") {
    viewSplit(row.staffname)
  } else if (isConsults()) {
    delRow(row, opdate)
  } else {
    row.remove()
  }
}

let delRow = function (row, opdate) {
  let prevDate = row.previousElementSibling.opdate,
    nextDate = row.nextElementSibling.opdate,
    table = row.closest('table'),
    index = row.rowIndex,
    lastrow = table.rows.length === (index + 1)

  if ((prevDate === opdate) || (nextDate === opdate) || lastrow) {
    row.remove()
  } else {
	  Array.from(row.querySelectorAll("td:not(:first-child)")).forEach(e => e.innerHTML = "")
    row.cells[HN].classList.remove("pacs")
    row.cells[PATIENT].classList.remove("upload")
    showStaffOnCall(opdate)
    blankRowData(row, opdate)
  }
}
