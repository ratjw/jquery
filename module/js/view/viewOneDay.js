
import { fillOldrowData, unfillOldrowData } from "./fillNewrowData.js"
import { rowDecoration } from "./rowDecoration.js"
import { getTableRowsByDate } from "../util/rowsgetting.js"
import { LARGESTDATE } from "../model/const.js"

export function viewOneDay(table, opdate, opdateBOOKrows) {
  if ((table.id === 'maintbl') && (opdate === LARGESTDATE)) { return }

  let opdateTblRows = getTableRowsByDate(table.id, opdate),
    bookRows = opdateBOOKrows.length,
    row, cells, clone

  if (bookRows) {
    while (opdateTblRows.length > bookRows) {
      table.deleteRow(opdateTblRows[0].rowIndex)
      opdateTblRows = getTableRowsByDate(table.id, opdate)
    }
    while (opdateTblRows.length < bookRows) {
      clone = opdateTblRows[0].cloneNode(true)
      clone.dataset.opdate = opdate
      opdateTblRows[0].after(clone)
      opdateTblRows = getTableRowsByDate(table.id, opdate)
    }
    opdateBOOKrows.forEach((e, i) => {
      row = opdateTblRows[i]
      rowDecoration(row, e.opdate)
      fillOldrowData(row, e)
    })
  } else {
    while (opdateTblRows.length > 1) {
      table.deleteRow(opdateTblRows[0].rowIndex)
      opdateTblRows = getTableRowsByDate(table.id, opdate)
    }
    row = opdateTblRows[0]
    if (row && row.dataset.qn) {
      unfillOldrowData(row, opdate)
    }
  }
}
