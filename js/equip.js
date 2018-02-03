function fillEquipTable(book, $row, qn)
{
	var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
	var bookq = getBOOKrowByQN(book, qn)
	var bookqEquip = bookq.equipment
	var JsonEquip = bookqEquip? JSON.parse(bookqEquip) : {}
	var $dialogEquip = $('#dialogEquip')
	var height = window.innerHeight
	if (height > 800) {
		height = 800
	}

	document.getElementById("oproom").innerHTML = bookq.oproom || ""
	document.getElementById("casenum").innerHTML = bookq.casenum || ""
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
	$dialogEquip.show()
	$dialogEquip.find('input[type=text]').val('')
	$dialogEquip.find('textarea').val('')
	$dialogEquip.find('input[type=checkbox]').prop('checked', false)
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
		showNonEditableEquip()
		getEditedBy(qn)
 	} else {
		showEditableEquip()
		$('#editedby').html("")
	}
	$dialogEquip.data("bookqEquip", bookqEquip)
	$dialogEquip.data("JsonEquip", JsonEquip)
	$dialogEquip.data("qn", qn)
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
				printpaper();
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
				printpaper();
			}
		}
	]);
	enableInput()
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
		if (/\[/.test(response)) {
			var Editedby = ""
			$.each(JSON.parse(response), function(key, val) {
				Editedby += (val.editor + " : " + val.editdatetime + "<br>")
			});
			$('#editedby').html(Editedby)
		} else {
			Alert("getEditedby", response)
		}
	}
}

function Checklistequip() 
{
	var bookqEquip = $('#dialogEquip').data("bookqEquip"),
		JsonEquip = $('#dialogEquip').data("JsonEquip"),
		qn = $('#dialogEquip').data("qn"),
		equipment = {}

	$( "#dialogEquip input, #dialogEquip textarea" ).each( function() {
		this.checked && (equipment[this.id] = "checked")
		this.value && (equipment[this.id] = this.value)
	})
	equipment = JSON.stringify(equipment)
	if (equipment === bookqEquip) {
		return
	}

	//escape the \ (escape) and ' (single quote) for sql string, not for JSON
	equipment = equipment.replace(/\\/g,"\\\\").replace(/'/g,"\\'")

	var sql = "sqlReturnbook=UPDATE book SET ";
	sql += "equipment='"+ equipment +"' ,";
	sql += "editor='"+ gv.user +"' ";
	sql += "WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, callbackEq);

	function callbackEq(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
		} else {
			// Error in update server
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
				});
			}
		}
	}
}

//*** have to set equip padding to top:70px; bottom:70px
function printpaper()
{
	if (/Edge|MS/.test(navigator.userAgent)) {
		var orgEquip = document.getElementById('dialogEquip');
		orgEquip.style.paddingLeft = 0 + "px"
		orgEquip.style.marginLeft = 0 + "px"
		var win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">');
		win.document.writeln(orgEquip.outerHTML);
		win.document.getElementById('dialogEquip').id = "printEquip" 

		var originEquip = orgEquip.getElementsByTagName("INPUT");
		var printEquip = win.document.getElementById('printEquip').getElementsByTagName("INPUT");
		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].checked) {
				printEquip[i].checked = originEquip[i].checked
			}
			else if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
				//pale color for no input items
			}
		}

		var originEquip = orgEquip.getElementsByTagName("TEXTAREA");
		var printEquip = dialogEquip.getElementsByTagName("TEXTAREA");

		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
				//pale color for no input items
			}
		}

		win.document.close();
		win.focus();
		win.print();
		win.close();
	} else {
		var original = document.body.innerHTML;
		var orgEquip = document.getElementById('dialogEquip');
		orgEquip.style.height = orgEquip.offsetHeight + 200 + "px"
		orgEquip.style.width = orgEquip.offsetWidth + 100 + "px"
		orgEquip.style.paddingLeft = 0 + "px"
		orgEquip.style.marginLeft = 0 + "px"
		document.body.innerHTML = orgEquip.outerHTML;
		var dialogEquip = document.getElementById('dialogEquip');

		var originEquip = orgEquip.getElementsByTagName("INPUT");
		var printEquip = dialogEquip.getElementsByTagName("INPUT");

		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].checked) {
				printEquip[i].checked = originEquip[i].checked
			}
			else if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
				//pale color for no input items
			}
		}

		var originEquip = orgEquip.getElementsByTagName("TEXTAREA");
		var printEquip = dialogEquip.getElementsByTagName("TEXTAREA");

		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
				//pale color for no input items
			}
		}

		window.focus();
		window.print();
		document.body.innerHTML = original;
		document.getElementById('dialogEquip').scrollIntoView(true);
		location.reload();
	}
}
