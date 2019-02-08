
import { HN, PATIENT } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"
import { getOpdate } from "../util/date.js"
import { isConsults } from "../util/util.js"
import { showStaffOnCall } from "./fillConsults.js"
import { blankRowData } from "../model/rowdata.js"

export function viewDeleteCase(row) {
  let tableID = row.closest('table').id,
    opdate = row.dataset.opdate,
    staffname = row.dataset.staffname

  viewOneDay(opdate)
  if (tableID === "maintbl") {
    viewSplit(staffname)
  } else {
    delRow(row, opdate)
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
