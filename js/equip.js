function fillEquipTable(book, rowi, qn)
{
	const NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];

	var bookq = getBOOKrowByQN(book, qn)
	var bookqEquip = bookq.equipment

	document.getElementById("oproom").innerHTML = bookq.oproom
	document.getElementById("optime").innerHTML = bookq.optime
	document.getElementById("opday").innerHTML = NAMEOFDAYTHAI[(new Date(bookq.opdate)).getDay()]
	document.getElementById("opdate").innerHTML = putOpdate(bookq.opdate)
	document.getElementById("staffname").innerHTML = bookq.staffname
	document.getElementById("hn").innerHTML = bookq.hn
	document.getElementById("patientname").innerHTML = bookq.patient
	document.getElementById("age").innerHTML = putAgeOpdate(bookq.dob, bookq.opdate)
	document.getElementById("diagnosis").innerHTML = bookq.diagnosis
	document.getElementById("treatment").innerHTML = bookq.treatment

	$(rowi).addClass("bordergroove")
	$('#dialogEquip').show()
	$('#dialogEquip input').prop('checked', false)
	$('#dialogEquip input').val('')
	$('#dialogEquip textarea').val('')
	$('#dialogEquip input[type=text]').prop('disabled', false)//make it easier to see
	$('#dialogEquip textarea').prop('disabled', false)//make it easier to see
	$('#clearPosition').click(function() {	//uncheck radio button of all Positions
		$('#dialogEquip input[name=pose]').prop('checked', false)
	})
	$('#clearShunt').click(function() {	//uncheck radio button of all Shunts
		$('#dialogEquip input[name=head]').prop('checked', false)
		$('#dialogEquip input[name=peritoneum]').prop('checked', false)
		$('#dialogEquip input[name=program]').prop('checked', false)
	})

	if ( bookqEquip ) {			// If any, fill checked & others
		$.each(JSON.parse(bookqEquip), function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)	//radio and checkbox
			} else {
				$("#"+ key).val(val)	//fill <input> && <textarea>
			}
		});
		showNonEditableEquip(qn, bookqEquip)

		var sql = "sqlReturnData=SELECT editor, editdatetime FROM bookhistory "
		sql += "WHERE qn="+ qn + " AND equipment <> '';"

		Ajax(MYSQLIPHP, sql, callbackgetEditedby)

		function callbackgetEditedby(response)
		{
			if (/{/.test(response)) {
				makeFind(response, hn)
			} else {
				var Editedby = ""
				$.each(JSON.parse(response), function(key, val) {
					Editedby += (val.editor + " : " + val.editdatetime + "<br>")
				});
				$('#editedby').html(Editedby)
			}
		}
 	} else {
		showEditableEquip(qn, bookqEquip)
		$('#editedby').html("")
	}
	var height = window.innerHeight
	if (height > 800) {
		height = 800
	}
	$('#dialogEquip').dialog({
		title: "เครื่องมือผ่าตัด",
		closeOnEscape: true,
		modal: true,
		width: 750,
		height: height,
		open: function(event, ui) {
			$("input").blur();	//disable default autofocus on text input
		},
		close: function(event, ui) {
			$(rowi).removeClass("bordergroove")
		}
	})
	
}

function showNonEditableEquip(qn, bookqEquip)
{
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
	$('#dialogEquip input[type=radio]').prop("disabled", true)
	$('#dialogEquip input[type=text]').on("click", function() {
		$(this).prop('disabled', true)
	})
	$('#dialogEquip textarea').on("click", function() {
		$(this).prop('disabled', true)
	})
	$('#dialogEquip input').on("click", function() {
		return false
	})
}

function showEditableEquip(qn, bookqEquip)
{
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
	$('#dialogEquip input').off("click")
	$('#dialogEquip textarea').prop('disabled', false)
	$('#dialogEquip textarea').off("click")
}

function showNonEditableForScrub()
{
	var height = window.innerHeight
	if (height > 800) {
		height = 800
	}
	$('#dialogEquip').dialog("option", "buttons", {})
	$('#dialogEquip').dialog({height: height})
	$('#dialogEquip input[type=radio]').prop("disabled", true)
	$('#dialogEquip input[type=text]').on("click", function() {
		$(this).prop('disabled', true)
	})
	$('#dialogEquip input').on("click", function() {
		return false
	})
	$('#dialogEquip textarea').on("click", function() {
		$(this).prop('disabled', true)
	})
	$('#dialogEquip textarea').on("click", function() {
		return false
	})
	$('#clearPosition').off('click')
	$('#clearShunt').off('click')
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
	$("#dialogEquip textarea").each(function() {
		if (this.value) {
			equipment[this.id] = this.value
		}
	})
	equipment = JSON.stringify(equipment)
	if (equipment === bookqEquip) {
		return
	}
	equipment = equipment.replace(/\\/g,"\\\\").replace(/'/g,"\\'")
	//escape the \ (escape) and ' (single quote) for sql string, not for JSON

	var sql = "sqlReturnbook=UPDATE book SET ";
	sql += "equipment='"+ equipment +"' ,";
	sql += "editor='"+ getUser() +"' ";
	sql += "WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, callbackEq);

	function callbackEq(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
		} else {
			//Error update server
			alert("Checklistequip", response)
			//Roll back
			$('#dialogEquip input').val('')
			$('#dialogEquip textarea').val('')
			if ( bookqEquip ) {			// If any, fill checked & others
				$.each(JSON.parse(bookqEquip), function(key, val) {
					if (val === 'checked') {
						$("#"+ key).prop("checked", true)	//radio and checkbox
					} else {
						$("#"+ key).val(val)	//fill <input> && <textarea>
					}
				});
			}
		}
	}
}

function printpaper(qn)	//*** have to set equip padding to top:70px; bottom:70px
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
			else {	//pale color for no input items
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
			}
		}

		var originEquip = orgEquip.getElementsByTagName("TEXTAREA");
		var printEquip = dialogEquip.getElementsByTagName("TEXTAREA");

		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {	//pale color for no input items
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
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
			else {	//pale color for no input items
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
			}
		}

		var originEquip = orgEquip.getElementsByTagName("TEXTAREA");
		var printEquip = dialogEquip.getElementsByTagName("TEXTAREA");

		for (var i = 0; i < originEquip.length; i++) 
		{
			if (originEquip[i].value) {
				printEquip[i].value = originEquip[i].value
			}
			else {	//pale color for no input items
				temp = printEquip[i]
				while (temp.nodeName !== "SPAN") {
					temp = temp.parentNode
				}
				temp.className = "pale"
			}
		}

		window.focus();
		window.print();
		document.body.innerHTML = original;
		document.getElementById('dialogEquip').scrollIntoView(true);
		location.reload();
	}
}
