 
import { OPDATE } from "../model/const.js"
import { ISOdate } from "../util/date.js"
import { BOOK, CONSULT } from "../util/updateBOOK.js"
import { isSplit, hoverPicArea } from "../util/util.js"
import { splitPane } from "./splitPane.js"
import { fillDatedCases, fillBlankDates, makenextrow } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { scrolltoToday } from "./scrolltoThisCase.js"

export function staffqueue(staffname) {
  let table = document.getElementById("queuetbl"),
    refill = (titlename.innerHTML === staffname),
    book,
    date,
    until

  // Not yet split window
  if (!isSplit()) { splitPane() }
  document.getElementById('titlename').innerHTML = staffname

  if (staffname === "Consults") {
    book = CONSULT
    until = ISOdate(new Date()),

    date = fillDatedCases(table, book)

    fillBlankDates(table, date, until)
  } else {
    book = BOOK.filter(e => e.staffname === staffname),
    fillDatedCases(table, book)
    reNumberNodateRows()
  }

  fillConsults('queuetbl')
  if (!table.closest('div').scrollTop && !refill) { scrolltoToday('queuetbl') }
  hoverPicArea()
}

function reNumberNodateRows()
{
  let queuetbl = document.getElementById('queuetbl'),
    nodates = Array.from(queuetbl.querySelectorAll('tr')).filter(e => e.className === 'nodate')

  nodates.forEach((row, i) => {
    row.cells[OPDATE].dataset.number = i + 1
  })

}