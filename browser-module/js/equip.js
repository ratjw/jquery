
import { EQUIPMENT, QN } from "./const.js"
import { clearEditcell } from "./edit.js"
import { USER } from "./main.js"
import { modelStart, modelGetEquip, modelSaveEquip } from "./model.js"
import {
	updateBOOK, getBOOKrowByQN, getTableRowByQN, putAgeOpdate,
	putThdate, ISOdate, nextdays, Alert
} from "./util.js"

import { viewAll, makeEquip } from "./view.js"

export { makeEquipTable }

// function declaration (definition ) : public
// function expression (literal) : local

// Make dialog box containing equiptment check list <div id="dialogEquip">
function makeEquipTable(book, $row, qn) {
	let NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
		bookq = getBOOKrowByQN(book, qn),
		bookqEquip = bookq.equipment,
		JsonEquip = bookqEquip? JSON.parse(bookqEquip) : {},
		$dialogEquip = $('#dialogEquip'),
		height = window.innerHeight,
		profile = {
			"oproom": bookq.oproom || "",
			"casenum": bookq.casenum || "",
			"optime": bookq.optime,
			"opday": NAMEOFDAYTHAI[(new Date(bookq.opdate)).getDay()],
			"opdate": putThdate(bookq.opdate),
			"staffname": bookq.staffname,
			"hn": bookq.hn,
			"patientname": bookq.patient,
			"age": putAgeOpdate(bookq.dob, bookq.opdate),
			"diagnosis": bookq.diagnosis,
			"treatment": bookq.treatment
		}

	for (let key in profile) {
		document.getElementById(key).innerHTML = profile[key]
	}

	// mark table row
	// clear all previous dialog values
	$row.addClass("marker")
	$dialogEquip.show()
	$dialogEquip.find('input').val('')
	$dialogEquip.find('textarea').val('')
	$dialogEquip.find('input').prop('checked', false)
	$dialogEquip.dialog({
		title: "เครื่องมือผ่าตัด",
		closeOnEscape: true,
		modal: true,
		width: 700,
		height: height > 1000 ? 1000 : height,
		close: function(event, ui) {
			$row.removeClass("marker")
		}
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
		getEditedBy(qn)
 	} else {
		showEditableEquip()
		$('#editedby').html("")
	}
	$dialogEquip.data("bookqEquip", bookqEquip)
	$dialogEquip.data("JsonEquip", JsonEquip)
	$dialogEquip.data("$row", $row)
	$dialogEquip.data("qn", qn)
	clearEditcell()
}

function showNonEditableEquip()
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "ยกเลิกทุกรายการ",
			style: "margin-right:450px",
			click: function () {
				if (confirm("ลบออกทั้งหมด และกลับคืนไม่ได้")) {
					cancelAll()
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
					cancelAll()
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
	$('#clearPosition').click( clearPosition )
	$('#clearShunt').click( clearShunt )
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

function getEditedBy(qn)
{
	modelGetEquip(qn).then(response => {
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
	let	$dialogEquip = $("#dialogEquip"),
		bookqEquip = $dialogEquip.data("bookqEquip"),
		JsonEquip = $dialogEquip.data("JsonEquip"),
		$row = $dialogEquip.data("$row"),
		qn = $dialogEquip.data("qn"),
		equipJSON = {},
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
	modelSaveEquip(equipment, qn).then(response => {
		let showup = function () {
			updateBOOK(response)
			$row = $(getTableRowByQN("tbl", qn))
			$row.find("td").eq(EQUIPMENT).html(makeEquip(equipJSON))
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

async function cancelAll()
{
	let	$dialogEquip = $("#dialogEquip"),
		bookqEquip = $dialogEquip.data("bookqEquip"),
		JsonEquip = $dialogEquip.data("JsonEquip"),
		$row = $dialogEquip.data("$row"),
		qn = $dialogEquip.data("qn"),

	sql = `sqlReturnbook=UPDATE book SET equipment='',editor='${USER}' WHERE qn='${qn}';`

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		if ($row.find("td").eq(QN).html() !== qn) {
			$row = getTableRowByQN("tbl", qn)
		}
		$row.find("td").eq(EQUIPMENT).html('')
		$dialogEquip.dialog('close')
	} else {
		// Error update server
		// Roll back. If old form has equips, fill checked & texts
		// prop("checked", true) : radio and checkbox
		// .val(val) : <input text> && <textarea>
		Alert("Checklistequip", response)
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
}
