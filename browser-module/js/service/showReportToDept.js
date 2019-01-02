
import { ROWREPORT, COLUMNREPORT } from "../model/const.js"
import { exportReportToExcel } from "../util/excel.js"
import { SERVICE } from "./setSERVICE.js"

export function showReportToDept(title)
{
	let sumColumn = [0, 0, 0, 0, 0, 0, 0, 0]

	$("#dialogReview").dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		width: 550,
		buttons: [{
			text: "Export to Excel",
			click: function() {
				exportReportToExcel(title)
				$( this ).dialog( "close" );
			}
		}]
	})

	$("#reviewtbl tr:not('th')").each(function() {
		$.each($(this).find("td:not(:first-child)"), function() {
			this.innerHTML = 0
		})
	})
	$.each(SERVICE, function() {
		if (this.operated) { countOpCase(this, this.disease) }
		if (this.radiosurgery) { countNonOpCase(this, this.radiosurgery) }
		if (this.endovascular) { countNonOpCase(this, this.endovascular) }
		if (!this.operated && !this.radiosurgery && !this.endovascular) {
			countNonOpCase(this, "Conservative")
		}
	})
	$("#reviewtbl tr:not('th, .notcount')").each(function(i) {
		$.each($(this).find("td:not(:first-child)"), function(j) {
			sumColumn[j] += Number(this.innerHTML)
		})
	})
	$("#Total").find("td:not(:first-child)").each(function(i) {
		this.innerHTML = sumColumn[i]
	})
	$("#Grand").find("td:not(:first-child)").each(function(i) {
		i = i * 2
		this.innerHTML = sumColumn[i] + sumColumn[i+1]
	})
}

function countOpCase(thisrow, thisitem)
{
	let row = ROWREPORT[thisitem],
		doneby = thisrow.doneby ? thisrow.doneby : "Staff",
		scale = thisrow.scale ? thisrow.scale : "Major",
		manner = thisrow.manner ? thisrow.manner : "Elective",
		column = COLUMNREPORT[doneby]
			   + COLUMNREPORT[scale]
			   + COLUMNREPORT[manner]

	if (row && column) {
		$("#reviewtbl tr")[row].cells[column].innerHTML++
	}
}

function countNonOpCase(thisrow, thisitem)
{
	let row = ROWREPORT[thisitem],
		manner = thisrow.manner ? thisrow.manner : "Elective",
		column = 1 + COLUMNREPORT[manner]

	if (row && column) {
		$("#reviewtbl tr")[row].cells[column].innerHTML++
	}
}
