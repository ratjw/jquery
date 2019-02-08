
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"

export function viewcopyCase(moverow, thisrow)
{
  viewOneDay(thisrow.dataset.opdate)

  viewSplit(moverow.dataset.staffname) 
}
