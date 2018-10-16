
import { BOOK, CONSULT, QN, updateBOOK } from "./control.js"
import { modelStart, modelGetEquip, modelSaveEquip } from "./model.js"
import {
	getBOOKrowByQN, putAgeOpdate, putThdate,
	ISOdate, nextdays, Alert
} from "./util.js"
import { viewAll } from "./view.js"

export { userOR, makeEquipTable }

// function declaration (definition ) : public
// function expression (literal) : local

// For OR personels with login id 000000 / no password
function userOR() {
	modelStart().then(response => {
		if (/BOOK/.test(response)) {
			success(response)
		} else {
			Alert("userOR", response)
		}
	}).catch(error => {})
}

function success(response) {
	updateBOOK(response)
	makeOneWeekTable()

	// Limit click to only one function makeEquipTable
	$("#wrapper").on("click", function (event) {
		event.preventDefault()
		event.stopPropagation()
		let target = event.target,
			$rowi = $(target).closest('tr'),
			qn = $rowi.children('td').eq(QN).html(),
			openEquip = function () {
				makeEquipTable($rowi, qn)
				$('#dialogEquip').dialog("option", "buttons", {})
				$('#dialogEquip input').prop("disabled", true)
				$('#dialogEquip textarea').prop('disabled', true)
				$('#clearPosition').off('click')
				$('#clearShunt').off('click')
			}

		target.nodeName === "TD" && !!qn && openEquip()
	})

	// Block all key input
	$("#wrapper").keydown(function(e) {
		e.preventDefault();
	})
}

// main table 1 week starting today
function makeOneWeekTable() {
	let tableID = "tbl",
		table = document.getElementById(tableID),
		start = ISOdate(new Date()),
		until = nextdays(start, 6)

	viewAll(BOOK, table, start, until)
}

// Make dialog box containing equiptment check list <div id="dialogEquip">
function makeEquipTable($rowi, qn) {
	let q = getBOOKrowByQN(BOOK, qn),
		bookqEquip = q.equipment,
		NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
		profile = {
		"oproom": q.oproom,
		"optime": q.optime,
		"opday": NAMEOFDAYTHAI[(new Date(q.opdate)).getDay()],
		"opdate": putThdate(q.opdate),
		"staffname": q.staffname,
		"hn": q.hn,
		"patientname": q.patient,
		"age": putAgeOpdate(q.dob, q.opdate),
		"diagnosis": q.diagnosis,
		"treatment": q.treatment
	}

	for (let key in profile) {
		document.getElementById(key).innerHTML = profile[key]
	}

	$rowi.addClass("borderfound")
	$('#dialogEquip').show()
	$('#dialogEquip input').prop('checked', false)
	$('#dialogEquip input').val('')
	$('#dialogEquip textarea').val('')
	$('#dialogEquip input[type=text]').prop('disabled', false)//make it easier to see
	$('#dialogEquip textarea').prop('disabled', false)//make it easier to see
	$('#clearPosition').click(function() {	// uncheck radio button of all Positions
		$('#dialogEquip input[name=pose]').prop('checked', false)
	})
	$('#clearShunt').click(function() {	// uncheck radio button of all Shunts
		$('#dialogEquip input[name=head]').prop('checked', false)
		$('#dialogEquip input[name=peritoneum]').prop('checked', false)
		$('#dialogEquip input[name=program]').prop('checked', false)
	})

	let hasEquip = function () {			// If any, fill checked & others' text
		$.each(JSON.parse(bookqEquip), function(key, val) {
			val === 'checked'
			? $("#"+ key).prop("checked", true)	// radio and checkbox
			: $("#"+ key).val(val)	// Fill <input> && <textarea>
		});
		showNonEditableEquip(qn, bookqEquip)
		modelGetEquip(qn).then(response => {
			let hasData = function () {
				let Editedby = ""
				$.each(JSON.parse(response), function(key, val) {
					Editedby += (val.editor + " : " + val.editdatetime + "<br>")
				});
				$('#editedby').html(Editedby)
			};

			;/{/.test(response) ? hasData() : Alert("callbackgetEditedby", response)
		}).catch(error => {})
	},
	noEquip = function () {
		showEditableEquip(qn, bookqEquip)
		$('#editedby').html("")
	}

	bookqEquip ? hasEquip() : noEquip()	

	let height = winHeight()
	if (height > 800) { height = 800 }

	$('#dialogEquip').dialog({
		title: "เครื่องมือผ่าตัด",
		closeOnEscape: true,
		modal: true,
		width: 750,
		height: height,
		hide: 200,
		open: function(event, ui) {
			$("input").blur();	// disable default autofocus on text input
		},
		close: function(event, ui) {
			$rowi.removeClass("borderfound")
		}
	})
}

let showNonEditableEquip = function (qn, bookqEquip) {
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "แก้ไข",
			width: "100",
			click: function () {
				showEditableEquip(qn, bookqEquip)
			}
		},
		{
			text: "Print",
			width: "100",
			click: function () {
				printpaper(qn);
			}
		}
	]);
	$('#dialogEquip input').prop("disabled", true)
	$('#dialogEquip textarea').prop('disabled', true)
}

let showEditableEquip = function (qn, bookqEquip) {
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "Save",
			width: "100",
			click: function () {
				Checklistequip(qn, bookqEquip)
				showNonEditableEquip(qn, bookqEquip)
			}
		},
		{
			text: "Print",
			width: "100",
			click: function () {
				printpaper(qn);
			}
		}
	]);
	$('#dialogEquip input').prop('disabled', false)
	$('#dialogEquip textarea').prop('disabled', false)
}

let Checklistequip = function (qn, bookqEquip) {
	let equipment = {}
	$( "#dialogEquip input, #dialogEquip textarea" ).each( function() {
		this.checked && (equipment[this.id] = "checked")
		this.value && (equipment[this.id] = this.value)
	})

	equipment = JSON.stringify(equipment)
	if (equipment === bookqEquip) {
		return
	}
	// escape the \ (escape) and ' (single quote) for sql string, not for JSON
	equipment = equipment.replace(/\\/g,"\\\\").replace(/'/g,"\\'")
	modelSaveEquip(equipment, qn).then(response => {
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

		;/BOOK/.test(response) ? updateBOOK(response) : rollback()
	}).catch(error => {})
}

//*** have to set equip padding to top:70px; bottom:70px
let printpaper = function (qn) {
	let temp = {},
		closestSPAN = function () {
		while (temp.nodeName !== "SPAN") {
			temp = temp.parentNode
		}
	},
	msie = function () {
		let orgEquip = document.getElementById('dialogEquip');
		orgEquip.style.paddingLeft = 0 + "px"
		orgEquip.style.marginLeft = 0 + "px"
		let win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">');
		win.document.writeln(orgEquip.outerHTML);
		win.document.getElementById('dialogEquip').id = "printEquip" 

		let	originInput = orgEquip.getElementsByTagName("INPUT"),
			printInput = win.document.getElementById('printEquip').getElementsByTagName("INPUT");
		for (let i = 0; i < originInput.length; i++) 
		{
			originInput[i].checked
			? printInput[i].checked = originInput[i].checked
			: originInput[i].value
				? printInput[i].value = originInput[i].value
					// pale color for no input items
				: (temp = printInput[i],
					closestSPAN(),
					temp.className = "pale")
		}

		let	originText = orgEquip.getElementsByTagName("TEXTAREA"),
			printText = dialogEquip.getElementsByTagName("TEXTAREA");

		for (let i = 0; i < originText.length; i++) 
		{
			originText[i].value
			? printText[i].value = originText[i].value
				// pale color for no input items
			: (temp = printText[i],
				closestSPAN(),
				temp.className = "pale")
		}

		win.document.close();
		win.focus();
		win.print();
		win.close();
	},
	chromeFF = function () {
		let original = document.body.innerHTML,
			orgEquip = document.getElementById('dialogEquip');
		orgEquip.style.height = orgEquip.offsetHeight + 200 + "px"
		orgEquip.style.width = orgEquip.offsetWidth + 100 + "px"
		orgEquip.style.paddingLeft = 0 + "px"
		orgEquip.style.marginLeft = 0 + "px"
		document.body.innerHTML = orgEquip.outerHTML;
		let dialogEquip = document.getElementById('dialogEquip'),
			originInput = orgEquip.getElementsByTagName("INPUT"),
			printInput = dialogEquip.getElementsByTagName("INPUT");

		for (let i = 0; i < originInput.length; i++) 
		{
			originInput[i].checked
			? printInput[i].checked = originInput[i].checked
			: originInput[i].value
				? printInput[i].value = originInput[i].value
					// pale color for no input items
				: (temp = printInput[i],
					closestSPAN(),
					temp.className = "pale")
		}

		let originText = orgEquip.getElementsByTagName("TEXTAREA"),
			printText = dialogEquip.getElementsByTagName("TEXTAREA");

		for (let i = 0; i < originText.length; i++) 
		{
			originText[i].value
			? printText[i].value = originText[i].value
				// pale color for no input items
			: (temp = printText[i],
				closestSPAN(),
				temp.className = "pale")
		}

		window.focus();
		window.print();
		document.body.innerHTML = original;
		document.getElementById('dialogEquip').scrollIntoView(true);
		location.reload();
	};

	/Edge|MS/.test(navigator.userAgent) ? msie() : chromeFF()
}
