
function fillEquipTable(rownum, qn)
{
	var q = findBOOKrow(qn)
	var bookq = BOOK[q]
	var bookqEquip = bookq.equipment

	document.getElementById("opdate").innerHTML = bookq.opdate.thDate()
	document.getElementById("staffname").innerHTML = bookq.staffname
	document.getElementById("hn").innerHTML = bookq.hn
	document.getElementById("patientname").innerHTML = bookq.patient
	document.getElementById("age").innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	document.getElementById("diagnosis").innerHTML = bookq.diagnosis
	document.getElementById("treatment").innerHTML = bookq.treatment

	$('#dialogEquip').show()
	$('#dialogEquip input').prop('checked', false)
	$('#dialogEquip input').val('')
	$('#dialogEquip input[type=text]').prop('disabled', false)//make it easier to see

	if ( bookqEquip ) {			// If any, fill checked & others
		$.each(JSON.parse(bookqEquip), function(key, val) {
			if (val == 'checked') {
				$("#"+ key).prop("checked", true)	//radio and checkbox
			} else {
				$("#"+ key).val(val)	//Other1...8
			}
		});
		showNonEditableEquip(qn, bookqEquip)
		getEditedby(qn)
 	} else {
		showEditableEquip(qn, bookqEquip)
		document.getElementById("editedby").innerHTML = ""
	}
	$('#dialogEquip').dialog({
		title: "Equipment",
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 9 / 10,
		open: function(event, ui) {
			$("input").blur();
		}
	})
}

function showNonEditableEquip(qn, bookqEquip)
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "แก้ไข",
			fontSize: "6",
			height: "25",
			width: "100",
			click: function () {
				showEditableEquip(qn, bookqEquip)
			}
		},
		{
			text: "Cancel",
			fontSize: "6",
			height: "25",
			width: "100",
			click: function () {
				printpaper(qn);
			}
		}
	]);
	$('#dialogEquip input[type=radio]').prop("disabled", true)
	$('#dialogEquip input[type=text]').click(function() {
		$(this).prop('disabled', true)
	})
	$('#dialogEquip input').click(function() {
		return false
	})
}

function showEditableEquip(qn, bookqEquip)
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "Save",
			fontSize: "6",
			height: "25",
			width: "100",
			click: function () {
				Checklistequip(qn, bookqEquip)
				showNonEditableEquip(qn, bookqEquip)
			}
		},
		{
			text: "Print",
			fontSize: "6",
			height: "25",
			width: "100",
			click: function () {
				printpaper(qn);
			}
		}
	]);
	$('#dialogEquip input').prop('disabled', false)
	$('#dialogEquip input').off("click")
}

function getEditedby(qn)
{
	var sql = "sqlReturnData=SELECT editor, editdatetime FROM bookhistory "
	sql += "WHERE qn="+ qn + " AND equipment <> '';"

	Ajax(MYSQLIPHP, sql, callbackgetEditedby)

	function callbackgetEditedby(response)
		{
			if (!response || response.indexOf("DBfailed") != -1) {
				alert("DBfailed!\n" + response)
			} else {
				var Editedby = ""
				$.each(JSON.parse(response), function(key, val) {
					Editedby += (val.editor + " : " + val.editdatetime + "<br>")
				});
				document.getElementById("editedby").innerHTML = Editedby
			}
		}
}

function Checklistequip(qn, bookqEquip) 
{
	var equipment = {}
	$( "#dialogEquip input:checked" ).each( function() {
		equipment[this.id] = "checked"
	})
	$("#dialogEquip input[type=text]").each(function() {
		if (this.value) {
			equipment[this.id] = this.value
		}
	})
	equipment = JSON.stringify(equipment)
	if (equipment == bookqEquip) {
		return
	}
	var sql = "UPDATE book SET ";
	sql += "equipment='"+ equipment +"' ,";
	sql += "editor='"+ THISUSER +"' ";
	sql += "WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, "sqlReturnbook="+ sql, callbackEq);

	function callbackEq(response)
	{
		if (!response || response.indexOf("QTIME") == -1)
		{
			alert("Failed! update database \n\n" + response)
		}
		else	//there is some change
		{
			updateBOOK(response)
		}
	}
}

function printpaper(qn)	//*** have to set equip padding to top:70px; bottom:70px
{
	if (/Edge|MS/.test(navigator.userAgent)) {
		var dialogEquip = document.getElementById('dialogEquip');
		dialogEquip.style.paddingLeft = 0 + "px"
		dialogEquip.style.marginLeft = 0 + "px"
		var win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">');
		win.document.writeln(dialogEquip.outerHTML);

		var newequip = dialogEquip.getElementsByTagName("INPUT");
		var winequip = win.dialogEquip.getElementsByTagName("INPUT");
		for (var i = 0; i < newequip.length; i++) 
		{
			if (newequip[i].checked) {
				winequip[i].checked = newequip[i].checked
			}
			else if (newequip[i].value) {
				winequip[i].value = newequip[i].value
			}
			else {	//pale color for no input items
				temp = winequip[i]
				while (temp.nodeName != "SPAN")
					temp = temp.parentNode
				temp.className = "pale"
			}
		}

		win.document.close();
		win.focus();
		win.print();
		win.close();
	}
	else {
		var original = document.body.innerHTML;
		var orgequip = document.getElementById('dialogEquip');
		orgequip.style.height = orgequip.offsetHeight + 200 + "px"
		orgequip.style.width = orgequip.offsetWidth + 100 + "px"
		orgequip.style.paddingLeft = 0 + "px"
		orgequip.style.marginLeft = 0 + "px"
		document.body.innerHTML = orgequip.outerHTML;
		var dialogEquip = document.getElementById('dialogEquip');

		var newequip = orgequip.getElementsByTagName("INPUT");
		var winequip = dialogEquip.getElementsByTagName("INPUT");

		for (var i = 0; i < newequip.length; i++) 
		{
			if (newequip[i].checked) {
				winequip[i].checked = newequip[i].checked
			}
			else if (newequip[i].value) {
				winequip[i].value = newequip[i].value
			}
			else {	//pale color for no input items
				temp = winequip[i]
				while (temp.nodeName != "SPAN")
					temp = temp.parentNode
				temp.className = "pale"
			}
		}

		window.print();
		document.body.innerHTML = original;
		document.getElementById('dialogEquip').scrollIntoView(true);
		location.reload();
	}
}
