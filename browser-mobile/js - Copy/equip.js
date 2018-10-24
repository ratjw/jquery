function fillEquipTable(book, $row, qn)
{
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

	$.each(profile, function(key, val) {
		document.getElementById(key).innerHTML = val
	})

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
		width: 750,
		height: height > 1000 ? 1000 : height,
		open: function(event, ui) {
			//disable default autofocus on text input
			$("input").blur()
		},
		close: function(event, ui) {
			$row.removeClass("marker")
		}
	})

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
			text: "แก้ไข",
			width: "100",
			click: function () {
				showEditableEquip()
			}
		},
		{
			text: "Print",
			width: "100",
			click: function () {
				printpaper()
			}
		}
	])
	disableInput()
}

function showEditableEquip()
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "Save",
			width: "100",
			click: function () {
				if (!$('#copay').val()) {
					Alert("Checklistequip", "<br>ต้องระบุจำนวนเงิน<br>จ่ายไม่ได้เลย = 0")
					return
				}
				Checklistequip()
				showNonEditableEquip()
			}
		},
		{
			text: "Print",
			width: "100",
			click: function () {
				printpaper()
			}
		}
	])
	enableInput()
}

function disableInput()
{
	$('#dialogEquip input').on("click", returnFalse)
	$('#dialogEquip input[type=text]').prop('disabled', true)
	$('#dialogEquip textarea').prop('disabled', true)
	$('#clearPosition').off('click', clearPosition)
	$('#clearShunt').off('click', clearShunt)
}

// clearPosition : uncheck radio button of Positions
// clearShunt : uncheck radio button of Shunts
function enableInput()
{
	$('#dialogEquip input').off("click", returnFalse)
	$('#dialogEquip input[type=text]').prop('disabled', false)
	$('#dialogEquip textarea').prop('disabled', false)
	$('#clearPosition').on('click', clearPosition)
	$('#clearShunt').on('click', clearShunt)
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

async function getEditedBy(qn)
{
	let sql = "sqlReturnData=SELECT editor,editdatetime FROM bookhistory "
			+ "WHERE qn="+ qn + " AND equipment <> '' "
			+ "ORDER BY editdatetime DESC;"

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		let Editedby = ""
		$.each(response, function(key, val) {
			Editedby += (val.editor + " : " + val.editdatetime + "<br>")
		})
		$('#editedby').html(Editedby)
	} else {
		Alert("getEditedby", response)
	}
}

async function Checklistequip() 
{
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

	//escape the \ (escape) and ' (single quote) for sql string, not for JSON
	equipment = equipment.replace(/\\/g,"\\\\").replace(/'/g,"\\'")

	sql = "sqlReturnbook=UPDATE book SET "
		+ "equipment='"+ equipment +"' ,"
		+ "editor='"+ gv.user +"' "
		+ "WHERE qn="+ qn +";"

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		if ($row.find("td").eq(QN).html() !== qn) {
			$row = getTableRowByQN("tbl", qn)
		}
		$row.find("td").eq(EQUIPMENT).html(makeEquip(equipJSON))
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

function printpaper()
{
	if (/Edge|MS|\.NET/.test(navigator.userAgent)) {
		let orgEquip = document.getElementById('dialogEquip')
		let win = window.open()
		win.document.open()
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">')
		win.document.writeln(orgEquip.outerHTML)

		let dialogEquip = win.document.getElementById('dialogEquip')

		preparePrint(orgEquip, dialogEquip)

		win.document.close()
		win.focus()
		win.print()
		win.close()
	} else {
		let original = document.body.innerHTML
		let orgEquip = document.getElementById('dialogEquip')
		let cloneEquip = $('#dialogEquip').clone()

		document.body.innerHTML = ""//orgEquip.outerHTML
		$("body").append(cloneEquip)

		let dialogEquip = document.getElementById('dialogEquip')

		preparePrint(orgEquip, dialogEquip)

		window.focus()
		window.print()
		document.body.innerHTML = original
		document.getElementById('dialogEquip').scrollIntoView(true)
		location.reload()
	}
}

function preparePrint(orgEquip, dialogEquip)
{
	let originINPUT = orgEquip.getElementsByTagName("INPUT")
	let printINPUT = dialogEquip.getElementsByTagName("INPUT")
	let originTEXTAREA = orgEquip.getElementsByTagName("TEXTAREA")
	let printTEXTAREA = dialogEquip.getElementsByTagName("TEXTAREA")

	for (let i = 0; i < originINPUT.length; i++) 
	{
		if (originINPUT[i].checked) {
			printINPUT[i].checked = originINPUT[i].checked
		}
		else {
			prepareText(originINPUT, printINPUT)
		}
	}

	prepareText(originTEXTAREA, printTEXTAREA)
}

function prepareText(originEquip, printEquip)
{
	for (let i = 0; i < originEquip.length; i++) 
	{
		if (originEquip[i].value) {
			printEquip[i].value = originEquip[i].value
		}
		else {
			let temp = printEquip[i]
			while (temp.nodeName !== "SPAN") {
				temp = temp.parentNode
			}
			temp.className = "pale"
			//pale color for no input items
		}
	}
}
