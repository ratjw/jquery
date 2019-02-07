
import { DISCHARGESV, COMPLICATION } from "../model/const.js"
import { serviceFromDate, serviceToDate } from "./setSERVICE.js"

const COUNTER = [ "Admission", "Discharge", "Operation", ...COMPLICATION]

export function countAllServices() {
  COUNTER.forEach(function(item) {
    document.getElementById(item).innerHTML = 0
  })

  let $rows = $("#servicetbl tr:has(td)")

  $rows.each(function() {
    if (this.querySelector('td.serviceStaff')) { return true }

  if (this.cells[DISCHARGESV].innerHTML) { document.getElementById("Discharge").innerHTML++ }

    let complication = []
    // COMPLICATION is titles of the last 5 buttons in profile record
    COMPLICATION.forEach(e => {
      complication.push(this.querySelector('input[title="' + e + '"]'))
    })

    // buttons Readmission and Reoperation are number inputs
    complication.forEach(e => {
      let x = Number(e.value)
      if (x) {
        let label = e.previousElementSibling.innerHTML
        if (label) {
          let y = Number(document.getElementById(label).innerHTML)
          document.getElementById(label).innerHTML = x + y
        }
        if (x > 1) {
          let z = Number(document.getElementById(e.title).innerHTML)
          document.getElementById(e.title).innerHTML = x - 1 + z
        }
      }
      if (e.checked) {
        document.getElementById(e.title).innerHTML++
      }
    })
  })
}
