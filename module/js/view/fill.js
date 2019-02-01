
import {
  OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
  DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, LARGESTDATE
} from "../model/const.js"
import {
  START, ISOdate, nextdays, numDate, thDate, putThdate, putNameAge
} from "../util/date.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { isSplit, isConsults } from "../util/util.js"
import { rowDecoration } from "./rowDecoration.js"
import { viewEquip } from "./viewEquip.js"
import { splitPane } from "./splitPane.js"
import { hoverMain } from "./hoverMain.js"
import { setRowData, blankRowData } from "../model/rowdata.js"
import { fillConsults } from "./fillConsults.js"

// Render Main table
// Consults and dialogAll tables use this too
// START date imported from util.js
// until date is the last row of the table, not of the book
export function fillall(book, table, start, until) {
  let tbody = table.querySelector("tbody"),
    rows = table.rows,
    head = table.rows[0],
    date = start,
    madedate,
    q = book.findIndex(e => e.opdate >= start),
    x = book.findIndex(e => e.opdate >= LARGESTDATE)

  // Get rid of LARGESTDATE cases
  // Consult cases have no LARGESTDATE, findIndex returns x = -1
  if (x >= 0) {
    book = book.slice(0, x)
  }

  let blen = book.length
  // No case
  if (!blen) { book.push({"opdate" : START}) }

  // delete previous table lest it accumulates
  if (rows.length > 1) {
    Array.from(table.querySelectorAll('tr')).slice(1).forEach(e => e.remove())
  }

  for (q; q < blen; q++) {
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
      if (date > until) {
        if (((new Date(date)).getDay())%7 === 1)
        {
          let clone = head.cloneNode(true)
          tbody.appendChild(clone)
        }
        return
      }
      // make table head row before every Monday
      if ((new Date(date).getDay())%7 === 1)
      {
        let clone = head.cloneNode(true)
        tbody.appendChild(clone)
      }
    }
    makenextrow(table, date)
    filldata(rows[table.rows.length-1], book[q])
    madedate = date
  }

  while (date < until)
  {
    date = nextdays(date, 1)

    // make table head row before every Monday
    if (((new Date(date)).getDay())%7 === 1)
    {
      let clone = head.cloneNode(true)
      tbody.appendChild(clone)
    }
    // make a blank row
    makenextrow(table, date)
  }
  hoverMain()
}

// Used after serviceReview and in idling update
// Similar to fillall but try to use existing DOM table
export function refillall() {
  let  table = document.getElementById("tbl"),
    $tbody = $("#tbl tbody"),
    start = numDate($('#tbl tr:has("td"):first').find('td').eq(OPDATE).html()),
    until = numDate($('#tbl tr:has("td"):last').find('td').eq(OPDATE).html())

  $tbody.html($tbody.find("tr:first").clone())
  fillall(BOOK, table, start, until)
  hoverMain()
  // For new row added to this table
}

// create and decorate new row
let makenextrow = function (table, date) {
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
    filldata(row, book[q])
    showWaitNum(row, book[q])
    madedate = date
  }

  hoverMain()
}

function showWaitNum(row, bookq)
{
  if (row.className === 'nodate') {
    row.cells[OPDATE].dataset.waitnum = row.dataset.waitnum
  }
}
