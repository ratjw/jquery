
import { isSplit, isStaffname, isConsults, isConsultsTbl, getMaxQN } from "../util/util.js"
import { BOOK, CONSULT, isPACS } from "../util/updateBOOK.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { putNameAge } from "../util/date.js"
import { refillmaintbl, filldata } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { refillAnotherTablerow } from "./refillAnotherTablerow.js"
import { reCreateEditcell } from "../control/edit.js"

export function viewGetNameHN(pointed) {
  let tableID = pointed.closest("table").id,
    row = pointed.closest('tr'),
    staffname = row.dataset.staffname,
    qn = row.dataset.qn,
    noqn = !qn,
    cellindex = pointed.cellIndex,
    book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

  // New case input
  if (noqn) {
    qn = getMaxQN(book)
    row.dataset.qn = qn
  }

  let bookq = getBOOKrowByQN(book, qn)

  filldata(row, bookq)

  // Both cases remote effect -> refill corresponding cell
  // no need to refillmaintbl because new case row was already there
  // Consults cases are not shown in main table
  if (tableID === 'maintbl') {
    if (isSplit() && isStaffname(staffname)) {
      refillAnotherTablerow('queuetbl', cellindex, qn)
    }
  } else {
    if (!isConsults()) {
      if (noqn) {
        refillmaintbl()
        fillConsults()
      } else {
        refillAnotherTablerow('maintbl', cellindex, qn)
      }
    }
  }

  reCreateEditcell()
}
