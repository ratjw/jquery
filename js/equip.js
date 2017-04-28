
function fillEquipTable(rownum, qn)
{
	var table = document.getElementById("tbl")
	var rowmain = table.rows[rownum]
	var opdate = rowmain.cells[OPDATE].innerHTML
	var staffname = rowmain.cells[STAFFNAME].innerHTML
	var hn = rowmain.cells[HN].innerHTML
	var patientname = rowmain.cells[NAME].innerHTML
	var age = rowmain.cells[AGE].innerHTML
	var diagnosis = rowmain.cells[DIAGNOSIS].innerHTML
	var treatment = rowmain.cells[TREATMENT].innerHTML
	var equipOR = document.getElementById("equip")

	document.getElementById("opdate").innerHTML = opdate
	document.getElementById("staffname").innerHTML = staffname
	document.getElementById("patientname").innerHTML = patientname
	document.getElementById("age").innerHTML = age
	document.getElementById("hn").innerHTML = hn
	document.getElementById("diagnosis").innerHTML = diagnosis
	document.getElementById("treatment").innerHTML = treatment
	document.getElementById("SAVE").value = qn
	document.getElementById("Print").value = qn

	equipOR.style.display = "block"
	equipOR.style.top = "0px"
	equipOR.style.left = rowmain.cells[OPDATE].offsetWidth +"px"	//show first column
	if (equipOR.offsetHeight > window.innerHeight) {
		equipOR.style.height = window.innerHeight - 60 +"px"
	}
	var q = findBOOKrow(qn)
	if ( BOOK[q].equipment )
	{								//fill checked equip if any
		$.each(JSON.parse(BOOK[q].equipment), function(key, val){
			if (val == 'checked') {
				$("#"+ key).prop("checked", true)	//radio and checkbox
			} else {
				$("#"+ key).val(val)	//Other1...8
			}
		});
 	}
	getEditedby(qn)
}

function saveequip(qn) 
{
	Checklistequip(qn)
	$("#equip").hide()
}

function cancelset()
{
	$("#equip").hide()
}

function Checklistequip(qn) 
{
	var equipment = {}
	$( "input:checked" ).each( function() {
		equipment[this.id] = "checked"
	})
	$('input[type=text]').each(function() {
		if (this.value)
			equipment[this.id] = this.value
	})
	equipment = JSON.stringify(equipment)

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
		var win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/printIE.css">');
		win.document.writeln(equip.outerHTML);

		var newequip = equip.getElementsByTagName("INPUT");
		var winequip = win.equip.getElementsByTagName("INPUT");
		for (var i = 0; i < newequip.length; i++) 
		{
			winequip[i].checked = newequip[i].checked
			winequip[i].value = newequip[i].value
			if (!winequip[i].checked || !winequip[i].value)
			{	//pale color for no input items
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
		document.body.innerHTML = orgequip.outerHTML;
		var equip = document.getElementById('equip');

		var oldinput = orgequip.getElementsByTagName("INPUT");
		var wininput = equip.getElementsByTagName("INPUT");
		for (var i = 0; i < oldinput.length; i++) 
		{
			wininput[i].checked = oldinput[i].checked
			wininput[i].value = oldinput[i].value
			if (!wininput[i].checked || !wininput[i].value)
			{
				var temp = wininput[i]
				while (temp.nodeName != "SPAN")
					temp = temp.parentNode
				temp.className = "pale"	//pale color for no input items
			}
		}

		window.print();
		document.body.innerHTML = original;
		document.getElementById('equip').scrollIntoView(true);
		location.reload();
	}
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
			$('#editedby').html(Editedby)
		}
	}
}
