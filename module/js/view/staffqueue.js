 
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
import { fillDatedCases, refillDatedCases, makenextrow } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { scrolltoToday } from "./scrolltoThisCase.js"

export function staffqueue(staffname) {
  let table = document.getElementById("queuetbl"),
    book = CONSULT,
    until = ISOdate(new Date())

  // Not yet split window
  if (!isSplit()) { splitPane() }
  $('#titlename').html(staffname)

  if (staffname === "Consults") {
    fillDatedCases(table, book, until)
  } else {
    book = BOOK.filter(e => e.staffname === staffname),
    fillEachStaff(table, book, staffname)
  }

  fillConsults('queuetbl')
  scrolltoToday('queuetbl')
  hoverMain()
}

// Use existing DOM table
export function refillstaffqueue() {
  let table = document.getElementById("queuetbl"),
    staffname = $('#titlename').html(),
    book

  if (staffname === "Consults") {
    book = CONSULT
  } else {
    book = BOOK.filter(e => e.staffname === staffname)
  }

  refillDatedCases(table, book)
  reNumberNodateRows()
}

function fillEachStaff(table, book, staffname)
{
  let tbody = table.querySelector("tbody"),
    rows = table.rows,
    head = table.rows[0],

    q = book.findIndex(e => e.opdate >= START),
    blen = book.length,

    date = START,
    madedate,
    qdate,
    clone

  // No case
  if (!blen) { book.push({"opdate" : START}) }

  // delete previous table lest it accumulates
  if (rows.length > 1) {
    Array.from(table.querySelectorAll('tr')).slice(1).forEach(e => e.remove())
  }

  // from START to end of waiting list with opdate
  for (q; q < blen; q++) {
    qdate = book[q].opdate
    if (qdate < LARGESTDATE) {
      // step over each day that is not in QBOOK
      while (date < qdate) {
        // make a blank row for each day which is not in book
        if (date !== madedate) {
          makenextrow(table, date)
          madedate = date
        }
        date = nextdays(date, 1)
        // make table head row before every Monday
        if ((new Date(date).getDay())%7 === 1) {
          clone = head.cloneNode(true)
          tbody.appendChild(clone)
        }
      }
    }

    makenextrow(table, qdate)
    filldataQueue(rows[table.rows.length-1], book[q])
    madedate = date
  }

  reNumberNodateRows()
}

function filldataQueue(row, q)
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