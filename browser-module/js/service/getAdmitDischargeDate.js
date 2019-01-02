
import { ADMISSIONSV, ADMITSV, DISCHARGESV } from "../model/const.js"
import { fetchGetIPD } from "../model/fetchService.js"
import { updateBOOK } from "../util/util.js"
import { setSERVICE, SERVICE } from "./setSERVICE.js"

export function getAdmitDischargeDate() {

	fetchGetIPD().then(response => {
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
			if (!/Admission/.test($cells.eq(ADMISSIONSV).className)) {
				$cells.eq(ADMISSIONSV).addClass("Admission")
				// for background pics
			}
			if (!/Admission|Readmission/.test($thisRow.className)) {
				$thisRow.addClass("Admission")
				// for counting
			}
		}
		if (this.discharge && this.discharge !== $cells.eq(DISCHARGESV).html()) {
			$cells.eq(DISCHARGESV).html(putThdate(this.discharge))
			if (!/Discharge/.test($thisRow.className)) {
				$thisRow.addClass("Discharge")
				// for counting
			}
		}
	});
}
