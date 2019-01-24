
import { EQUIPMENT, QN } from "../model/const.js"
import { clearEditcell } from "../control/edit.js"
import { USER } from "../main.js"
import { fetchGetEquip, fetchSaveEquip, fetchCancelAllEquip } from "../model/savedata.js"
import { putAgeOpdate, putThdate } from "../util/date.js"
import { getBOOKrowByQN, getTableRowByQN } from "../util/getrows.js"
import { BOOK, CONSULT, updateBOOK } from "../util/variables.js"
import { Alert, isConsultsTbl } from "../util/util.js"
import { viewEquipJSON } from "../view/viewEquip.js"

const NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"]

let bookqEquip,
	JsonEquip,
	thisqn,
	$dialogEquip = $('#dialogEquip')

export function getEQUIP(pointing)
{
	let qn = pointing.closest('tr').cells[QN].innerHTML

	if (!qn) { return }

	let tableID = pointing.closest('table').id,
		book = isConsultsTbl(tableID)? CONSULT : BOOK,
		bookq = getBOOKrowByQN(book, qn),
		height = window.innerHeight,
		thisEquip = {
			oproom: bookq.oproom || "",
			casenum: bookq.casenum || "",
			optime: bookq.optime,
			opday: NAMEOFDAYTHAI[(new Date(bookq.opdate)).getDay()],
			opdate: putThdate(bookq.opdate),
			staffname: bookq.staffname,
			hn: bookq.hn,
			patientname: bookq.patient,
			age: putAgeOpdate(bookq.dob, bookq.opdate),
			diagnosis: bookq.diagnosis,
			treatment: bookq.treatment
		}

	for (let key in thisEquip) {
		document.getElementById(key).innerHTML = thisEquip[key]
	}

	bookqEquip = bookq.equipment
	JsonEquip = bookqEquip? JSON.parse(bookqEquip) : {}
	thisqn = qn

	// clear all previous dialog values
	$dialogEquip.show()
	$dialogEquip.find('input').val('')
	$dialogEquip.find('textarea').val('')
	$dialogEquip.find('input').prop('checked', false)
	$dialogEquip.dialog({
		title: "เครื่องมือผ่าตัด",
		closeOnEscape: true,
		modal: true,
		width: 700,
		height: height > 1000 ? 1000 : height
	})

	// If ever filled, show checked equips & texts
	// .prop("checked", true) shown in radio and checkbox
	// .val(val) shown in <input text> && <textarea>
	if ( Object.keys(JsonEquip).length ) {
		$.each(JsonEquip, function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)
			} else {
				$("#"+ key).val(val)
			}
		})
		showNonEditableEquip()
		getEditedBy(thisqn)
 	} else {
		showEditableEquip()
		$('#editedby').html("")
	}

	clearEditcell()
}

function showNonEditableEquip()
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "ยกเลิกทุกรายการ",
			style: "margin-right:450px",
			click: function () {
				if (confirm("ลบออกทั้งหมด")) {
					cancelAllEquip()
				}
			}
		},
		{
			text: "แก้ไข",
			click: function () {
				showEditableEquip()
			}
		}
	])
	disableInput()
}

// having any equip must have copay. if no copay, ->alert
// having no equip, cancel copay
let showEditableEquip = function () {
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "Save",
			click: function () {
				if (checkEquip()) {
					if ($('#copay').val()) {
						Checklistequip()
						showNonEditableEquip()
					} else {
						Alert("Checklistequip", "<br>ต้องระบุจำนวนเงิน<br>จ่ายไม่ได้เลย = 0")
					}
				} else {
					cancelAllEquip()
				}
			}
		}
	])
	enableInput()
}

function disableInput()
{
	$('#dialogEquip input').prop('disabled', true)
	$('#dialogEquip textarea').prop('disabled', true)
	$('#clearPosition').off('click')
	$('#clearShunt').off('click')
}

// clearPosition : uncheck radio button of Positions
// clearShunt : uncheck radio button of Shunts
function enableInput()
{
	$('#dialogEquip input').prop('disabled', false)
	$('#dialogEquip textarea').prop('disabled', false)
	$('#clearPosition').off("click").on("click", clearPosition)
	$('#clearShunt').off("click").on("click", clearShunt)
}

function clearPosition()
{
	$('#dialogEquip input[name=pose]').prop('checked', false)
}

function clearShunt()
{
	$('#dialogEquip input[name=head]').prop('checked', false)
	$('#dialogEquip input[name=peritoneum]').prop('checked', false)
	$('#dialogEquip input[name=program]').prop('checked', false)
}

function getEditedBy()
{
	fetchGetEquip(thisqn).then(response => {
		let hasData = function () {
			let Editedby = ""
			$.each(response, function(key, val) {
				Editedby += (val.editor + " : " + val.editdatetime + "<br>")
			});
			$('#editedby').html(Editedby)
		};

		typeof response === "object"
		? hasData()
		: Alert("getEditedby", response)
	}).catch(error => {})
}

function checkEquip()
{
	let equip = false

	$( "#dialogEquip input:not(#copay), #dialogEquip textarea" ).each( function() {
		if (this.checked) {
			equip = true
			return false
		} else if (this.type === "text" || this.type === "textarea") {
			if (this.value) {
				equip = true
				return false
			}
		}
	})

	return equip
}

let Checklistequip = function () {
	let equipJSON = {},
		equipment = "",
		sql = ""

	$( "#dialogEquip input, #dialogEquip textarea" ).each( function() {
		if (this.checked) {
			equipJSON[this.id] = "checked"
		} else if (this.type === "text" || this.type === "textarea") {
			if (this.value) {
				equipJSON[this.id] = this.value
			}
		}
	})

	equipment = JSON.stringify(equipJSON)
	if (equipment === bookqEquip) {
		return
	}

	// escape the \ (escape) and ' (single quote) for sql string, not for JSON
	equipment = equipment.replace(/\\/g,"\\\\").replace(/'/g,"\\'")
	fetchSaveEquip(equipment, thisqn).then(response => {
		let showup = function () {
			updateBOOK(response)
			let row = getTableRowByQN("tbl", thisqn)
			$(row).find("td").eq(EQUIPMENT).html(viewEquipJSON(equipJSON))
			$dialogEquip.dialog('close')
		}
		let rollback = function () {
			// Error update server
			Alert("Checklistequip", response)

			// Roll back
			$('#dialogEquip input').val('')
			$('#dialogEquip textarea').val('')
			bookqEquip &&
				$.each(JSON.parse(bookqEquip), function(key, val) {
					val === 'checked'
					? $("#"+ key).prop("checked", true)	// radio and checkbox
					: $("#"+ key).val(val)	// fill <input> && <textarea>
				});
		};

		typeof response === "object" ? showup() : rollback()
	}).catch(error => {})
}

function cancelAllEquip()
{
	fetchCancelAllEquip(thisqn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			delelteAllEquip(response)
		}

		typeof response === "object"
		? hasData()
		: restoreAllEquip(response, bookqEquip, JsonEquip)

	}).catch(error => {})
}

function delelteAllEquip(qn)
{
	let $row = getTableRowByQN("tbl", qn)

	$row.find("td").eq(EQUIPMENT).html('')
	$("#dialogEquip").dialog('close')
}

function restoreAllEquip(response, bookqEquip, JsonEquip)
{
	// Error update server
	// Roll back. If old form has equips, fill checked & texts
	// prop("checked", true) : radio and checkbox
	// .val(val) : <input text> && <textarea>
	Alert("cancelAllEquip", response)
	$('#dialogEquip input').val('')
	$('#dialogEquip textarea').val('')
	if ( bookqEquip ) {
		$.each(JsonEquip, function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)
			} else {
				$("#"+ key).val(val)
			}
		})
	}
}
