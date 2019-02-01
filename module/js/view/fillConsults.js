
import { PATIENT, LARGESTDATE } from "../model/const.js"
import { ISOdate, nextdays, numDate, thDate } from "../util/date.js"
import { ONCALL, STAFF } from "../util/variables.js"
import {isSplit } from "../util/util.js"

export function fillConsults(tableID = 'tbl')
{
  let rows = document.getElementById(tableID).rows,
    tlen = rows.length,
    lastopdate

  if (tableID === 'tbl') {
    if (rows[tlen-1].querySelector('th')) {
      lastopdate = rows[tlen-2].dataset.opdate
    } else {
      lastopdate = rows[tlen-1].dataset.opdate
    }
  } else if (tableID === 'queuetbl') {
    let rowopdate = Array.from(rows).find(e => e.dataset.opdate === LARGESTDATE)
    if (rowopdate) {
      lastopdate = rowopdate.previousElementSibling.dataset.opdate
    } else {
      if (rows[tlen-1].querySelector('th')) {
        lastopdate = rows[tlen-2].dataset.opdate
      } else {
        lastopdate = rows[tlen-1].dataset.opdate
      }
    }
  }

  showConsults(rows, lastopdate)
}

// refill after deleted or written over
export function showStaffOnCall(opdate)
{
  if (new Date(opdate).getDay() === 6) {
    fillConsults()
  }
}

export function dataAttr(pointing, staffname)
{
  pointing.dataset.consult = staffname
  pointing.classList.add("consult")
}

function showConsults(rows, lastopdate)
{
  let tlen = rows.length,
    today = ISOdate(new Date()),
    staffoncall = STAFF.filter(staff => (staff.oncall === "1")),
    slen = staffoncall.length,
    nextrow = 1,
    index = 0,
    start = staffoncall.filter(staff => staff.startoncall)
      .reduce((a, b) => a.startoncall > b.startoncall ? a : b, 0),
    dateoncall = start.startoncall,
    staffstart = start.staffname,
    oncallRow = {}

  // The staff who has latest startoncall date, is to start
  while ((index < slen) && (staffoncall[index].staffname !== staffstart)) {
    index++
  }

  // find first date immediately after today, to begin
  while (dateoncall <= today) {
    dateoncall = nextdays(dateoncall, 7)
    index++
  }

  // write staffoncall if no patient
  index = index % slen
  while (dateoncall <= lastopdate) {
    oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
    if (oncallRow && !oncallRow.dataset.qn) {
      dataAttr(oncallRow.cells[PATIENT], staffoncall[index].staffname)
    }
    nextrow = oncallRow.rowIndex + 1
    dateoncall = nextdays(dateoncall, 7)
    index = (index + 1) % slen
  }

  // write substitute oncall
  nextrow = 1
  ONCALL.forEach(oncall => {
    dateoncall = oncall.dateoncall
    if (dateoncall > today) {
      oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
      if (oncallRow && !oncallRow.dataset.qn) {
        dataAttr(oncallRow.cells[PATIENT], oncall.staffname)
      }
      nextrow = oncallRow.rowIndex + 1
    }
  })
}

function findOncallRow(rows, nextrow, tlen, dateoncall)
{
  for (let i = nextrow; i < tlen; i++) {
    if (rows[i].dataset.opdate === dateoncall) {
      return rows[i]
    }
  }
}
