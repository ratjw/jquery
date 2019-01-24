
import { OPDATE, STAFFNAME, QN } from "../model/const.js"
import { ISOdate, nextdays, numDate, thDate } from "../util/date.js"
import { ONCALL, STAFF } from "../util/variables.js"

// Only on main table
export function fillConsults()
{
  let table = document.getElementById("tbl")
  let rows = table.rows
  let tlen = rows.length
  let today = ISOdate(new Date())
  let lastopdate = numDate(rows[tlen-1].cells[OPDATE].innerHTML)
  let staffoncall = STAFF.filter(staff => (staff.oncall === "1"))
  let slen = staffoncall.length
  let nextrow = 1
  let index = 0
  let start = staffoncall.filter(staff => staff.startoncall)
      .reduce((a, b) => a.startoncall > b.startoncall ? a : b, 0)
  let dateoncall = start.startoncall
  let staffstart = start.staffname
  let oncallRow = {}

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
    if (oncallRow && !oncallRow.cells[QN].innerHTML) {
      oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(staffoncall[index].staffname)
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
      if (oncallRow && !oncallRow.cells[QN].innerHTML) {
        oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(oncall.staffname)
      }
      nextrow = oncallRow.rowIndex + 1
    }
  })
}

function findOncallRow(rows, nextrow, tlen, dateoncall)
{
  let opdateth = dateoncall && thDate(dateoncall)

  for (let i = nextrow; i < tlen; i++) {
    if (rows[i].cells[OPDATE].innerHTML === opdateth) {
      return rows[i]
    }
  }
}

export function htmlwrap(staffname)
{
  return '<p style="color:#999999;font-size:12px">Consult<br>' + staffname + '</p>'
}

// refill after deleted or written over
export function showStaffOnCall(opdate)
{
  if (new Date(opdate).getDay() === 6) {
    fillConsults()
  }
}
