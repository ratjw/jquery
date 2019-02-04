 
import {
  OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
  DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, LARGESTDATE
} from "../model/const.js"
import { START, ISOdate, nextdays, putNameAge } from "../util/date.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { viewEquipNoImg } from "./viewEquip.js"
import { setRowData, blankRowData } from "../model/rowdata.js"
import { isSplit } from "../util/util.js"
import { splitPane } from "./splitPane.js"
import { hoverMain } from "./hoverMain.js"
import { fillall, makenextrow } from "./fill.js"
import { fillConsults } from "./fillConsults.js"

export function staffqueue(staffname) {
  let todate = ISOdate(new Date()),
    queuetbl = document.getElementById('queuetbl')

  // Not yet split window
  if (!isSplit()) { splitPane() }
  $('#titlename').html(staffname)

  if (staffname === "Consults") {
    fillall(CONSULT, queuetbl, START, todate)
  } else {
    let book = BOOK.filter(e => e.staffname === staffname)
    fillEachStaff(book, queuetbl)
  }

  fillConsults('queuetbl')
  hoverMain()
}

// Use existing DOM table
export function refillstaffqueue() {
  let staffname = $('#titlename').html()

  staffqueue(staffname)
}

function fillEachStaff(book, table)
{
  let tbody = table.querySelector("tbody"),
    rows = table.rows,
    head = table.rows[0],
    date = START,
    madedate,
    q = book.findIndex(e => e.opdate >= START),
    blen = book.length,
    row

  // No case
  if (!blen) { book.push({"opdate" : START}) }

  // delete previous table lest it accumulates
  if (rows.length > 1) {
    Array.from(table.querySelectorAll('tr')).slice(1).forEach(e => e.remove())
  }

  for (q; q < blen; q++) {
    if (book[q].opdate < LARGESTDATE) {
      // step over each day that is not in QBOOK
      while (date < book[q].opdate)
      {
        if (date !== madedate)
        {
          // make a blank row for each day which is not in book
          makenextrow(table, date)  // insertRow
          madedate = date
        }
        date = nextdays(date, 1)
        // make table head row before every Monday
        if ((new Date(date).getDay())%7 === 1)
        {
          let clone = head.cloneNode(true)
          tbody.appendChild(clone)
        }
      }
    }
    makenextrow(table, book[q].opdate)
    row = rows[table.rows.length-1]
    filldataQueue(row, book[q])
    madedate = date
  }

  reNumberNodateRows()
  hoverMain()
}

export function filldataQueue(row, q)
{
  let cells = row.cells

  setRowData(row, q)
  if (q.hn && isPACS) { cells[HN].className = "pacs" }
  if (q.patient) { cells[PATIENT].className = "upload" }

  cells[THEATRE].innerHTML = q.theatre
  cells[OPROOM].innerHTML = q.oproom || ""
  cells[OPTIME].innerHTML = q.optime
  cells[CASENUM].innerHTML = q.casenum || ""
  cells[STAFFNAME].innerHTML = q.staffname
  cells[HN].innerHTML = q.hn
  cells[PATIENT].innerHTML = putNameAge(q)
  cells[DIAGNOSIS].innerHTML = q.diagnosis
  cells[TREATMENT].innerHTML = q.treatment
  cells[EQUIPMENT].innerHTML = viewEquipNoImg(q.equipment)
  cells[CONTACT].innerHTML = q.contact
}

function reNumberNodateRows()
{
  let queuetbl = document.getElementById('queuetbl'),
    nodates = Array.from(queuetbl.querySelectorAll('tr')).filter(e => e.className === 'nodate')

  nodates.forEach((row, i) => {
    row.cells[OPDATE].dataset.number = i + 1
  })

}