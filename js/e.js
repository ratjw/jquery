
function fillEquipTable(rownum, qn)
{
	var q = findBOOKrow(qn)
	var bookq = BOOK[q]
	var equipOR = document.getElementById("equip")

	document.getElementById("opdate").innerHTML = bookq.opdate.thDate()
	document.getElementById("staffname").innerHTML = bookq.staffname
	document.getElementById("hn").innerHTML = bookq.hn
	document.getElementById("patientname").innerHTML = bookq.patient
	document.getElementById("age").innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	document.getElementById("diagnosis").innerHTML = bookq.diagnosis
	document.getElementById("treatment").innerHTML = bookq.treatment
	document.getElementById("SAVEEquip").onclick = function () {
		Checklistequip(qn)
	}
	document.getElementById("SAVEClose").onclick = function () {
		Checklistequip(qn)
		$('#equip').hide()
	}
	document.getElementById("CloseEquip").onclick = function () {
		$('#equip').hide()
	}
	document.getElementById("PrintEquip").onclick = function () {
		printpaper(qn)
	}

	equipOR.style.display = "block"
	equipOR.style.top = "0px"
	equipOR.style.left = $('#editcell').data('pointing').offsetWidth +"px"
	if (equipOR.offsetHeight > window.innerHeight) {
		equipOR.style.height = window.innerHeight - 60 +"px"
	}
	$('#equip input').prop('checked', false)
	$('#equip input').val('')

	if ( BOOK[q].equipment ) {			// If any, fill checked & others
		$.each(JSON.parse(BOOK[q].equipment), function(key, val) {
			if (val == 'checked') {
				$("#"+ key).prop("checked", true)	//radio and checkbox
			} else {
				$("#"+ key).val(val)	//Other1...8
			}
		});
		$('#equip input').click(function(event) {
			event.preventDefault()
			event.stopPropagation()
			return false
		})
		$('#equip input[type=text]').prop('disabled', false)
		$('#equip input[type=text]').click(function() {
			$(this).prop('disabled', true)
		})
		getEditedby(qn)
 	} else {
		showSaveEquip(qn)
		document.getElementById("editedby").innerHTML = ""
	}
}

function showSaveEquip(qn)
{
	document.getElementById("SAVEEquip").innerHTML = " SAVE "
	document.getElementById("SAVEClose").style.color = "black"
	document.getElementById("SAVEEquip").onclick = function () {
		Checklistequip(qn)
	}
	document.getElementById("SAVEClose").onclick = function () {
		Checklistequip(qn)
		$('#equip').hide()
	}
	$('#equip input').prop('disabled', false)
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

function Checklistequip(qn) 
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
	if (equipment == "{}") {
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
