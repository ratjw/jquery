
import {
	OPDATE, DIAGNOSIS, NAMEOFDAYFULL, NAMEOFDAYABBR, LARGESTDATE
} from "../model/const.js"
import { putThdate } from "../util/date.js"
import { holiday } from "./holiday.js"

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
