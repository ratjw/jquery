
import { OPDATE, STAFFNAME, HN, PATIENT, LARGESTDATE } from "../model/const.js"
import { putThdate } from "../util/date.js"
import { rowDecoration } from "./rowDecoration.js"
import { getTableRowsByDate } from "../util/rowsgetting.js"
import { showStaffOnCall } from "./fillConsults.js"
import { filldata } from "./fill.js"
import { BOOK } from "../util/updateBOOK.js"
import { blankRowData } from "../model/rowdata.js"

// Used for main table ("maintbl") only, no LARGESTDATE
// others would refill entire table
export function viewOneDay(opdate) {
  if (opdate === LARGESTDATE) { return }
  let table = document.getElementById('maintbl'),
    opdateBOOKrows = getBOOKRowsByDate(BOOK, opdate),
    opdateTblRows = getTableRowsByDate('maintbl', opdate),
    bookRows = opdateBOOKrows.length,
    $cells, staff

  if (bookRows) {
    while (opdateTblRows.length > bookRows) {
      table.deleteRow(opdateTblRows[0].rowIndex)
      opdateTblRows = getTableRowsByDate('maintbl', opdate)
    }
    while (opdateTblRows.length < bookRows) {
      let clone = opdateTblRows[0].cloneNode(true)
      clone.dataset.opdate = opdate
      opdateTblRows[0].after(clone)
      opdateTblRows = getTableRowsByDate('maintbl', opdate)
    }
    opdateBOOKrows.forEach((e, i) => {
      let row = opdateTblRows[i]
      rowDecoration(row, e.opdate)
      filldata(row, e)
      staff = row.cells[STAFFNAME].innerHTML
    })
  } else {
    while (opdateTblRows.length > 1) {
      table.deleteRow(opdateTblRows[0].rowIndex)
      opdateTblRows = getTableRowsByDate('maintbl', opdate)
    }

    let row = opdateTblRows[0]
    let cells = Array.from(row.children)

    cells.filter(e => e.cellIndex !== OPDATE).forEach(e => e.innerHTML = "")
    cells[HN].classList.remove("pacs")
    cells[PATIENT].classList.remove("upload")
    rowDecoration(row, opdate)
    showStaffOnCall(opdate)
    blankRowData(row, opdate)
  }
}

function getBOOKRowsByDate(book, opdate)
{
  return book.filter(q => q.opdate === opdate)
}
