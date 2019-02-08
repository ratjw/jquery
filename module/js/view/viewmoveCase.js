
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"

export function viewmoveCase(moverow, thisrow)
{
  let movedate = moverow.dataset.opdate,
    thisdate = thisrow.dataset.opdate,
    staffname = moverow.dataset.staffname

  viewOneDay(movedate)

  if (movedate !== thisdate) {
    viewOneDay(thisdate)
  }
  viewSplit(staffname) 
}
