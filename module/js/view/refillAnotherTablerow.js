
import { getBOOKrowByQN, getTableRowByQN } from "../util/rowsgetting.js"
import { fillNewrowData } from "./fill.js"
import { BOOK } from "../util/updateBOOK.js"

// view corresponding cell in another table
export function refillAnotherTablerow(tableID, qn) {
  let q = getBOOKrowByQN(BOOK, qn),
    row = getTableRowByQN(tableID, qn)

  fillNewrowData(row, q)
}
