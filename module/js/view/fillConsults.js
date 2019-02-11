
import { PATIENT, LARGESTDATE } from "../model/const.js"
import { ISOdate, nextdays, numDate, thDate, START } from "../util/date.js"
import { ONCALL, STAFF } from "../util/updateBOOK.js"
import {isSplit } from "../util/util.js"

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

// The staff who has latest startoncall date, is to start
export function fillConsults(tableID = 'maintbl')
{
  let table = document.getElementById(tableID),
    saturdays = table.querySelectorAll("tr.Saturday"),
    firstsat = saturdays.length && saturdays[0].dataset.opdate || "",
    staffoncall = STAFF.filter(staff => (staff.oncall === "1")),
    slen = staffoncall.length,
    start = staffoncall.filter(staff => staff.startoncall)
      .reduce((a, b) => a.startoncall > b.startoncall ? a : b, 0),
    dateoncall = start.startoncall,
    staffstart = start.staffname,
    sindex = staffoncall.findIndex(e => e.staffname === staffstart)

  // find first date to begin
  while (dateoncall < firstsat) {
    dateoncall = nextdays(dateoncall, 7)
    sindex = (sindex + 1) % slen
  }

  Array.from(saturdays).forEach(e => {
    dataAttr(e.cells[PATIENT], staffoncall[sindex].staffname)
    sindex = (sindex + 1) % slen
  })

  // write substitute oncall
  ONCALL.forEach(oncall => {
    dateoncall = oncall.dateoncall
    Array.from(saturdays).forEach(e => {
      if (e.dataset.opdate === dateoncall) {
        dataAttr(e.cells[PATIENT], oncall.staffname)
      }
    })
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
