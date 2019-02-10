 
import {
  OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
  DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, LARGESTDATE
} from "../model/const.js"
import { START, ISOdate, nextdays, putNameAge } from "../util/date.js"
import { BOOK, CONSULT, isPACS } from "../util/updateBOOK.js"
import { viewEquipNoImg } from "./viewEquip.js"
import { setRowData, blankRowData } from "../model/rowdata.js"
import { isSplit } from "../util/util.js"
import { splitPane } from "./splitPane.js"
import { hoverMain } from "./hoverMain.js"
import { fillDatedCases, fillBlankDates, refillDatedCases, makenextrow } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { scrolltoToday } from "./scrolltoThisCase.js"

export function staffqueue(staffname) {
  let table = document.getElementById("queuetbl"),
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
//  scrolltoToday('queuetbl')
  hoverMain()
}

// Use existing DOM table
export function refillstaffqueue() {
  let table = document.getElementById("queuetbl"),
    staffname = $('#titlename').html(),
    until = ISOdate(new Date()),
    book,
    date

  if (staffname === "Consults") {
    book = CONSULT
    date = refillDatedCases(table, book)
    fillBlankDates(table, date, until)
  } else {
    book = BOOK.filter(e => e.staffname === staffname)
    let remainRows = refillDatedCases(table, book),
      i = table.rows.length - remainRows
    while (remainRows--) {
      table.deleteRow(i)
    }
    reNumberNodateRows()
  }
}

function reNumberNodateRows()
{
  let queuetbl = document.getElementById('queuetbl'),
    nodates = Array.from(queuetbl.querySelectorAll('tr')).filter(e => e.className === 'nodate')

  nodates.forEach((row, i) => {
    row.cells[OPDATE].dataset.number = i + 1
  })

}