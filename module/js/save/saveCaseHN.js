
import {
	OPDATE, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN
} from "../model/const.js"
import { OLDCONTENT, clearEditcell } from "../control/edit.js"
import { fetchMoveCaseHN, fetchCopyCaseHN } from "../model/sqlsavehn.js"
import { getOpdate, putThdate, putNameAge } from "../util/date.js"
import { updateBOOK } from "../util/variables.js"
import { Alert, winWidth } from "../util/util.js"
import { viewMoveCaseHN, viewCopyCaseHN } from "../view/viewCaseHN.js"
import { rowDecoration } from "../view/rowDecoration.js"

// May have other columns before, thus has qn already
export function saveCaseHN(pointed, waiting)
{
let	wanting = {...waiting},
		tableID = pointed.closest("table").id,
		row = pointed.closest('tr'),
    cells = row.cells,
		opdate = row.opdate,
		staffname = row.staffname,
		diagnosis = row.diagnosis,
		treatment = row.treatment,
		contact = row.contact,
		qn = row.qn,

		hn = waiting.hn,
		patient = waiting.patient,
		dob = waiting.dob,

		$dialogMoveCaseHN = $("#dialogMoveCaseHN"),
		$movetbl = $("#movetbl"),
		$movefrom = $("#movefrom").next(),
		$moveto = $("#moveto").next(),
		tblcells = $("#tblcells tr").html()

	// not use staffoncall in patient's data
	if (/(<([^>]+)>)/i.test(staffname)) { staffname = "" }
	wanting.opdate = opdate
	wanting.patient = patient
	wanting.dob = dob
	if (staffname) { wanting.staffname = staffname }
	if (diagnosis) { wanting.diagnosis = diagnosis }
	if (treatment) { wanting.treatment = treatment }
	if (contact) { wanting.contact = contact }

	$movefrom.html(tblcells).filldataWaiting(waiting)
	$moveto.html(tblcells).filldataWaiting(wanting)
	let width = winWidth(95)
	width = width < 500
		  ? 550
		  : width > 800
		  ? 800
		  : width

	$dialogMoveCaseHN.dialog({
		title: "เคสซ้ำ",
		closeOnEscape: true,
		modal: true,
		autoResize: true,
		show: 200,
		hide: 200,
		width: width,
		buttons: [
			{
				text: "ย้ายมา ลบเคสเดิมออก",
				class: "moveButton",
				click: function() {
					moveCaseHN()
				}
			},
			{
				text: "ก็อปปี้มา คงเคสเดิม",
				class: "copyButton",
				click: function() {
					copyCaseHN()
				}
			},
			{
				text: "ยกเลิก ไม่ทำอะไร",
				click: function() {
					$dialogMoveCaseHN.dialog("close")
					cells[HN].innerHTML = OLDCONTENT
				}
			}
		],
		close: function() {
			clearEditcell()
		}
	})

	function moveCaseHN()
	{
		fetchMoveCaseHN(pointed, waiting, wanting).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewMoveCaseHN(tableID, qn, row, waiting.opdate)
			}
			let noData = function () {
				Alert("saveCaseHN", response)
				pointed.innerHTML = OLDCONTENT
				// unsuccessful entry
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { })

		$dialogMoveCaseHN.dialog("close")
	}

	function copyCaseHN()
	{
		fetchCopyCaseHN(pointed, waiting, wanting).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewCopyCaseHN(tableID, qn, row)
			}
			let noData = function () {
				Alert("saveCaseHN", response)
				pointed.innerHTML = OLDCONTENT
				// unsuccessful entry
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { })

		$dialogMoveCaseHN.dialog("close")
	}
}

jQuery.fn.extend({
	filldataWaiting : function(bookq) {
		let	row = this[0],
      cells = row.cells

		rowDecoration(row, bookq.opdate)

		cells[STAFFNAME].innerHTML = bookq.staffname
		cells[HN].innerHTML = bookq.hn
		cells[PATIENT].innerHTML = putNameAge(bookq)
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[CONTACT].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
	}
})
