
import { OPDATE, DIAGNOSIS, LARGESTDATE } from "../model/const.js"
import { putThdate } from "../util/date.js"
import { holiday } from "./holiday.js"

// for row, and 1st column colors
const NAMEOFDAYFULL  = ["Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
]

export function rowDecoration(row, date)
{
  let  cells = row.cells

  row.className = dayName(NAMEOFDAYFULL, date) || "nodate"

  cells[OPDATE].innerHTML = putThdate(date)
  if (date < LARGESTDATE) {
    cells[DIAGNOSIS].style.backgroundImage = holiday(date) || 'none'
  }
}

function dayName(DAYNAME, date)
{
  return date === LARGESTDATE
    ? ""
    : DAYNAME[(new Date(date)).getDay()]
}
