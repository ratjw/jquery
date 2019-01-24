
import { OPDATE, DIAGNOSIS, LARGESTDATE } from "../model/const.js"
import { putThdate } from "../util/date.js"
import { holiday } from "./holiday.js"

// for row, and 1st column colors
const NAMEOFDAYFULL	= ["Sunday", "Monday", "Tuesday",
	"Wednesday", "Thursday", "Friday", "Saturday"
]
const NAMEOFDAYABBR	= ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function rowDecoration(row, date)
{
  let  cells = row.cells

  row.className = dayName(NAMEOFDAYFULL, date) || "nodate"
  cells[OPDATE].innerHTML = putThdate(date)
  cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
  cells[DIAGNOSIS].style.backgroundImage = holiday(date)
}

function dayName(DAYNAME, date)
{
	return date === LARGESTDATE
		? ""
		: DAYNAME[(new Date(date)).getDay()]
}
