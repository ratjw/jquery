
import { fetchGetServiceOneMonth } from "../model/servicedb.js"
import { showService } from "./showService.js"
import { setSERVICE, setfromDate, settoDate } from "./setSERVICE.js"
import { showReportToDept } from "./showReportToDept.js"
import { exportServiceToExcel } from "../util/excel.js"
import { Alert } from "../util/util.js"

// new Date(yyyy, mm+1, 0) is the day before 1st date of next month
// ===> last date of this month
export function oneMonth(begin)
{
	let date = new Date(begin),
		end = new Date(date.getFullYear(), date.getMonth()+1, 0),
		$dialogService = $("#dialogService"),
		$monthpicker = $("#monthpicker"),
		$exportService = $("#exportService"),
		$reportService = $("#reportService"),
		inputval = $monthpicker.val(),
		titledate = inputval.slice(0, -4) + (Number(inputval.slice(-4)) + 543),
		title = "Service Neurosurgery เดือน " + titledate

	$dialogService.dialog({ title: title })

	setfromDate(begin)
	settoDate($.datepicker.formatDate("yy-mm-dd", end))

	fetchGetServiceOneMonth().then(response => {
		if (typeof response === "object") {
			setSERVICE(response)
			showService()
		} else {
			Alert("getServiceOneMonth", response)
		}
	}).catch(error => {})

	$exportService.show()
	$exportService.on("click", event => {
		event.preventDefault()
		exportServiceToExcel()
	})

	$reportService.show()
	$reportService.on("click", event => {
		event.preventDefault()
		showReportToDept(title)
	})
}
