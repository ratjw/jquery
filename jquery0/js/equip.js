function fillEquipTable(book, $row, qn)
{
	var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
		bookq = getBOOKrowByQN(book, qn),
		bookqEquip = bookq.equipment,
		JsonEquip = bookqEquip? JSON.parse(bookqEquip) : {},
		$dialogEquip = $("#dialogEquip")

	document.getElementById("oproom").innerHTML = bookq.oproom
	document.getElementById("casenum").innerHTML = bookq.casenum
	document.getElementById("optime").innerHTML = bookq.optime
	document.getElementById("opday").innerHTML = NAMEOFDAYTHAI[(new Date(bookq.opdate)).getDay()]
	document.getElementById("opdate").innerHTML = putOpdate(bookq.opdate)
	document.getElementById("staffname").innerHTML = bookq.staffname
	document.getElementById("hn").innerHTML = bookq.hn
	document.getElementById("patientname").innerHTML = bookq.patient
	document.getElementById("age").innerHTML = putAgeOpdate(bookq.dob, bookq.opdate)
	document.getElementById("diagnosis").innerHTML = bookq.diagnosis
	document.getElementById("treatment").innerHTML = bookq.treatment

	// mark table row
	// clear all previous dialog values
	$row.addClass("bordergroove")
	$dialogEquip.dialog()
	$dialogEquip.dialog('close')
	$dialogEquip.show()
	$dialogEquip.find('input').val('')
	$dialogEquip.find('textarea').val('')
	$dialogEquip.find('input').prop('checked', false)

	// If ever filled, show checked equips & texts
	// .prop("checked", true) : radio and checkbox
	// .val(val) : <input text> && <textarea>
	if ( Object.keys(JsonEquip).length ) {
		$.each(JsonEquip, function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)
			} else {
				$("#"+ key).val(val)
			}
		});
		getEditedBy(qn)
 	} else {
		$('#editedby').html("")
	}
	showNonEditableEquip()

	var height = window.innerHeight
	if (height > 1000) {
		height = 1000
	}
	$dialogEquip.dialog({
		title: "เครื่องมือผ่าตัด",
		closeOnEscape: true,
		modal: true,
		width: 750,
		height: height,
		open: function(event, ui) {
			//disable default autofocus on text input
			$("input").blur()
		},
		close: function(event, ui) {
			$row.removeClass("bordergroove")
		}
	})
}

function showNonEditableEquip()
{
	$('#dialogEquip').dialog("option", "buttons", [])
	disableInput()
}

function disableInput() {
	$('#dialogEquip input').on("click", returnFalse)
	$('#dialogEquip input[type=text]').prop('disabled', true)
	$('#dialogEquip textarea').prop('disabled', true)
	$('#clearPosition').off('click', clearPosition)
	$('#clearShunt').off('click', clearShunt)
}

// clearPosition : uncheck radio button of Positions
// clearShunt : uncheck radio button of Shunts
function enableInput() {
	$('#dialogEquip input').off("click", returnFalse)
	$('#dialogEquip input[type=text]').prop('disabled', false)
	$('#dialogEquip textarea').prop('disabled', false)
	$('#clearPosition').on('click', clearPosition)
	$('#clearShunt').on('click', clearShunt)
}

function clearPosition() {
	$('#dialogEquip input[name=pose]').prop('checked', false)
}

function clearShunt() {
	$('#dialogEquip input[name=head]').prop('checked', false)
	$('#dialogEquip input[name=peritoneum]').prop('checked', false)
	$('#dialogEquip input[name=program]').prop('checked', false)
}

function returnFalse() {
	return false
}

function getEditedBy(qn) {
	var sql = "sqlReturnData=SELECT editor,editdatetime FROM bookhistory "
			+ "WHERE qn="+ qn + " AND equipment <> '' "
			+ "ORDER BY editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackgetEditedby)

	function callbackgetEditedby(response)
	{
		if (/{/.test(response)) {
			var Editedby = ""
			$.each(JSON.parse(response), function(key, val) {
				Editedby += (val.editor + " : " + val.editdatetime + "<br>")
			});
			$('#editedby').html(Editedby)
		} else {
			alert("getEditedby", response)
		}
	}
}
