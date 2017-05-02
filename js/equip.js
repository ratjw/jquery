
function fillEquipTable(rownum, qn)
{
	var q = findBOOKrow(qn)
	var bookq = BOOK[q]
	var bookqEquip = bookq.equipment
	var equipdiv = document.getElementById("equipdiv")

	document.getElementById("opdate").innerHTML = bookq.opdate.thDate()
	document.getElementById("staffname").innerHTML = bookq.staffname
	document.getElementById("hn").innerHTML = bookq.hn
	document.getElementById("patientname").innerHTML = bookq.patient
	document.getElementById("age").innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	document.getElementById("diagnosis").innerHTML = bookq.diagnosis
	document.getElementById("treatment").innerHTML = bookq.treatment
	document.getElementById("printEquip").onclick = function () {
		printpaper(qn)
	}
	document.getElementById("closeEquip").onclick = function () {
		$('#equipdiv').hide()
	}

	equipdiv.style.display = "block"
	equipdiv.style.top = "0px"
	equipdiv.style.left = $('#editcell').data('pointing').offsetWidth +"px"
	if (equipdiv.offsetHeight > window.innerHeight) {
		equipdiv.style.height = window.innerHeight - 60 +"px"
	}
	$('#equip input').prop('checked', false)
	$('#equip input').val('')
	$('#equip input[type=text]').prop('disabled', false)//make it easier to see

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
}

function showNonEditableEquip(qn, bookqEquip)
{
	document.getElementById("saveEquip").innerHTML = " แก้ไข "
	document.getElementById("saveEquip").onclick = function () {
		showEditableEquip(qn, bookqEquip)
	}
	$('#equip input[type=radio]').prop("disabled", true)
	$('#equip input[type=text]').click(function() {
		$(this).prop('disabled', true)
	})
	$('#equip input').click(function() {
		return false
	})
}

function showEditableEquip(qn, bookqEquip)
{
	document.getElementById("saveEquip").innerHTML = " SAVE "
	document.getElementById("saveEquip").onclick = function () {
		Checklistequip(qn, bookqEquip)
		showNonEditableEquip(qn, bookqEquip)
	}
	$('#equip input').prop('disabled', false)
	$('#equip input').off("click")
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
	$( "#equip input:checked" ).each( function() {
		equipment[this.id] = "checked"
	})
	$("#equip input[type=text]").each(function() {
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
		var equip = document.getElementById('equip');
		equip.style.paddingLeft = 0 + "px"
		equip.style.marginLeft = 0 + "px"
		var win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">');
		win.document.writeln(equip.outerHTML);

		var newequip = equip.getElementsByTagName("INPUT");
		var winequip = win.equip.getElementsByTagName("INPUT");
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
		var orgequip = document.getElementById('equip');
		orgequip.style.height = orgequip.offsetHeight + 200 + "px"
		orgequip.style.width = orgequip.offsetWidth + 100 + "px"
		orgequip.style.paddingLeft = 0 + "px"
		orgequip.style.marginLeft = 0 + "px"
		document.body.innerHTML = orgequip.outerHTML;
		var equip = document.getElementById('equip');

		var newequip = orgequip.getElementsByTagName("INPUT");
		var winequip = equip.getElementsByTagName("INPUT");

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
		document.getElementById('equip').scrollIntoView(true);
		location.reload();
	}
}
