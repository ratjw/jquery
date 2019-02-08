
import { ADMISSIONSV, ADMITSV, DISCHARGESV } from "../model/const.js"
import { sqlGetIPD } from "../model/sqlservice.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { setSERVICE, SERVICE } from "./setSERVICE.js"
import { putThdate } from "../util/date.js"

export function getAdmitDischargeDate() {

  sqlGetIPD().then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
      setSERVICE(response.SERVICE)
      fillAdmitDischargeDate()
    }
  }).catch(error => {})
}

let fillAdmitDischargeDate = function () {
  let i = 0,
    staffname = "",
    $rows = $("#servicetbl tr")

  $.each( SERVICE, function() {
    if (this.staffname !== staffname) {
      staffname = this.staffname
      i++
    }
    i++
    let $thisRow = $rows.eq(i),
      $cells = $thisRow.children("td")

    if (this.admit && this.admit !== $cells.eq(ADMITSV).html()) {
      $cells.eq(ADMITSV).html(putThdate(this.admit))
    }
    if (this.discharge && this.discharge !== $cells.eq(DISCHARGESV).html()) {
      $cells.eq(DISCHARGESV).html(putThdate(this.discharge))
    }
  });
}
