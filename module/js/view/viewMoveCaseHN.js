
import { refillstaffqueue } from "./staffqueue.js"
import { isConsultsTbl, getMaxQN } from "../util/util.js"
import { refillmaintbl } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { BOOK, CONSULT, isPACS } from "../util/updateBOOK.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { putNameAge } from "../util/date.js"
import { viewOneDay } from "./viewOneDay.js"
import { filldata } from "./fill.js"

export function viewMoveCaseHN(tableID, qn, row, opdate)
{
  let  book = (isConsultsTbl(tableID)) ? CONSULT : BOOK
  let bookq = getBOOKrowByQN(book, qn)

  filldata(row, bookq)

  if (tableID === 'maintbl') {
    viewOneDay(opdate)
    refillstaffqueue()
  } else {
    refillmaintbl()
    fillConsults()
  }
}

export function viewCopyCaseHN(tableID, qn, row)
{
  let  book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

  // New case input
  if (!qn) {
    qn = getMaxQN(book)
    row.dataset.qn = qn
  }

  let bookq = getBOOKrowByQN(book, qn)

  filldata(row, bookq)

  if (tableID === 'maintbl') {
    refillstaffqueue()
  } else {
    refillmaintbl()
    fillConsults()
  }
}
