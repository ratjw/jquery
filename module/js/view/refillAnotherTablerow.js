
import { getBOOKrowByQN, getTableRowByQN } from "../util/rowsgetting.js"
import { filldata } from "./fill.js"

// view corresponding cell in another table
export function refillAnotherTablerow(tableID, qn) {
	let q = getBOOKrowByQN(BOOK, qn),
		row = getTableRowByQN(tableID, qn)

  filldata(row, q)
}
