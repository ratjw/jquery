
import {
  OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
  DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, LARGESTDATE
} from "../model/const.js"
import {
  START, ISOdate, nextdays, numDate, thDate, putThdate, putNameAge
} from "../util/date.js"
import { BOOK, CONSULT, isPACS } from "../util/updateBOOK.js"
import { rowDecoration } from "./rowDecoration.js"
import { viewEquip } from "./viewEquip.js"
import { hoverMain } from "./hoverMain.js"
import { setRowData, blankRowData } from "../model/rowdata.js"

// Render Main table
// Consults and dialogAll tables use this too
// START 1st date of last month
// until date is the last row of the table, not of the book
export function fillmain()
{
  let table = document.getElementById("maintbl"),

    x = BOOK.findIndex(e => e.opdate >= LARGESTDATE),
    book = BOOK.slice(0, x),

    today = new Date(),
    nextyear = today.getFullYear() + 2,
    month = today.getMonth(),
    todate = today.getDate(),
    until = ISOdate((new Date(nextyear, month, todate)))

  fillDatedCases(table, book, until)

  hoverMain()
}

// Used after serviceReview and in idling update
export function refillmaintbl() {
  let  table = document.getElementById("maintbl")

  refillDatedCases(table, BOOK)
  hoverMain()
  // For new row added to this table
}

export function fillconsultsTbl()
{
  let table = document.getElementById("queuetbl"),
    book = CONSULT,
    until = ISOdate(new Date())

  fillDatedCases(table, book, until)
}

function fillDatedCases(table, book, until)
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

    makenextrow(table, qdate)
    filldata(rows[table.rows.length-1], book[q])
    madedate = date
  }
    
  // from end of waiting list with opdate to 2 years
  while (date < until) {
    date = nextdays(date, 1)
    if (((new Date(date)).getDay())%7 === 1) {
      let clone = head.cloneNode(true)
      tbody.appendChild(clone)
    }
    makenextrow(table, date)
  }
}

// try to use existing DOM table
export function refillDatedCases(table, book)
{
  let tbody = table.querySelector("tbody"),
    rows = table.rows,
    head = table.rows[0],
    row,
    rowdate,
    prevdate,
    tblcells = document.getElementById("tblcells"),
    tblrow,

    q = book.findIndex(e => e.opdate >= START),
    blen = book.length,
    bookdate,
    i

  // rows.length may change during looping, due to moving a case to/from blank row
  for (i = 0; i < rows.length; i++) {
    row = rows[i]
    rowdate = row.dataset.opdate
    bookdate = book[q].opdate

    if (row.querySelector('th')) { continue }

    if (rowdate === bookdate) {
      fillrowdata(row, book[q])
      q++
    } else if (rowdate < bookdate) {
      prevdate = rows[i-1].dataset.opdate
      if (rows[i].dataset.opdate === prevdate) {
        row.remove()
        i--
      } else if (row.dataset.qn) {
        blankRowData(row, rowdate)
        unfillrowdata(row, rowdate)
      }
    } else {
      i = i - 1
      if (rows[i].dataset.opdate === book[q].opdate) {
        tblrow = tblcells.rows[0].cloneNode(true)
        rows[i].after(tblrow)
        i++
        rowDecoration(rows[i], book[q].opdate)
        filldata(rows[i], book[q])
        q++
      } 
    }
  }
}

// create and decorate new row
export function makenextrow(table, date) {
  let tbody = table.querySelector("tbody"),
    tblcells = document.getElementById("tblcells"),
    row = tblcells.rows[0].cloneNode(true)

  row = tbody.appendChild(row)
  rowDecoration(row, date)
  blankRowData(row, date)
}

export function filldata(row, q)
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
  cells[EQUIPMENT].innerHTML = viewEquip(q.equipment)
  cells[CONTACT].innerHTML = q.contact
}

function fillrowdata(row, q)
{
  let rowdata = row.dataset

  if (rowdata.waitnum !== q.waitnum) {
    rowdata.waitnum = q.waitnum
  }
  if (rowdata.theatre !== q.theatre) {
    rowdata.theatre = q.theatre
    row.cells[THEATRE].innerHTML = q.theatre
  }
  if (rowdata.oproom !== (q.oproom || "")) {
    rowdata.oproom = q.oproom || ""
    row.cells[OPROOM].innerHTML = q.oproom || ""
  }
  if (rowdata.optime !== q.optime) {
    rowdata.optime = q.optime
    row.cells[OPTIME].innerHTML = q.optime
  }
  if (rowdata.casenum !== (q.casenum || "")) {
    rowdata.casenum = q.casenum || ""
    row.cells[CASENUM].innerHTML = q.casenum || ""
  }
  if (rowdata.staffname !== q.staffname) {
    rowdata.staffname = q.staffname
    row.cells[STAFFNAME].innerHTML = q.staffname
  }
  if (rowdata.hn !== q.hn) {
    rowdata.hn = q.hn
    row.cells[HN].innerHTML = q.hn
  }
  if (rowdata.patient !== q.patient) {
    rowdata.patient = q.patient
    row.cells[PATIENT].innerHTML = q.patient
  }
  if (rowdata.dob !== (q.dob || "")) {
    rowdata.dob = q.dob || ""
  }
  if (rowdata.diagnosis !== q.diagnosis) {
    rowdata.diagnosis = q.diagnosis
    row.cells[DIAGNOSIS].innerHTML = q.diagnosis
  }
  if (rowdata.treatment !== q.treatment) {
    rowdata.treatment = q.treatment
    row.cells[TREATMENT].innerHTML = q.treatment
  }
  if (rowdata.equipment !== q.equipment) {
    rowdata.equipment = q.equipment
    row.cells[EQUIPMENT].innerHTML = q.equipment
  }
  if (rowdata.contact !== q.contact) {
    rowdata.contact = q.contact
    row.cells[CONTACT].innerHTML = q.contact
  }
  if (rowdata.qn !== q.qn) {
    rowdata.qn = q.qn
  }
}

function unfillrowdata(row, date)
{
  row.cells[THEATRE].innerHTML = ""
  row.cells[OPROOM].innerHTML = ""
  row.cells[OPTIME].innerHTML = ""
  row.cells[CASENUM].innerHTML = ""
  row.cells[STAFFNAME].innerHTML = ""
  row.cells[HN].innerHTML = ""
  row.cells[PATIENT].innerHTML = ""
  row.cells[DIAGNOSIS].innerHTML = ""
  row.cells[TREATMENT].innerHTML = ""
  row.cells[EQUIPMENT].innerHTML = ""
  row.cells[CONTACT].innerHTML = ""
}
