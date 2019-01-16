function fillEquipTable(book, $row, qn, blankcase)
{
	var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
		bookq = qn ? getBOOKrowByQN(book, qn) : blankcase,
		bookqEquip = bookq.equipment,
		JsonEquip = bookqEquip? JSON.parse(bookqEquip) : {},
		$dialogEquip = $("#dialogEquip"),
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
		width: 770,
		height: height > 1000 ? 1000 : height,
		open: function(event, ui) {
			//disable default autofocus on text input
			$("input").blur()
		},
		close: function(event, ui) {
			if (/^\d{1,2}$/.test(gv.user)) {
				history.back()
			}
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
	}
	showNonEditableEquip()

	$dialogEquip.find("div").each(function() {
		this.style.display = "none" 
	})
	$dialogEquip.find("input").each(function() {
		if (this.checked || this.value) {
			$(this).closest("div").css("display", "block")
		}
	})
	if ($dialogEquip.find("textarea").val()) {
		$dialogEquip.find("textarea").closest("div").css("display", "block")
	}
}

function showNonEditableEquip()
{
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "Print",
			width: "100",
			click: function () {
				printpaper()
			}
		}
	])

	$('#dialogEquip input').on("click", function() { return false })
	$('#dialogEquip input[type=text]').prop('disabled', true)
	$('#dialogEquip textarea').prop('disabled', true)
}

function printpaper()
{
	if (/Edge|MS|\.NET/.test(navigator.userAgent)) {
		var orgEquip = document.getElementById('dialogEquip');
		var win = window.open();
		win.document.open();
		win.document.write('<LINK type="text/css" rel="stylesheet" href="css/print.css">');
		win.document.writeln(orgEquip.outerHTML);

		var dialogEquip = win.document.getElementById('dialogEquip')

		preparePrint(orgEquip, dialogEquip)

		win.document.close();
		win.focus();
		win.print();
		win.close();
	} else {
		var original = document.body.innerHTML;
		var orgEquip = document.getElementById('dialogEquip');
		document.body.innerHTML = orgEquip.outerHTML;

		var dialogEquip = document.getElementById('dialogEquip');

		preparePrint(orgEquip, dialogEquip)

		window.focus();
		window.print();
		document.body.innerHTML = original;
		document.getElementById('dialogEquip').scrollIntoView(true);
		location.reload();
	}
}

function preparePrint(orgEquip, dialogEquip)
{
	var originINPUT = orgEquip.getElementsByTagName("INPUT");
	var printINPUT = dialogEquip.getElementsByTagName("INPUT");
	var originTEXTAREA = orgEquip.getElementsByTagName("TEXTAREA");
	var printTEXTAREA = dialogEquip.getElementsByTagName("TEXTAREA");

	for (var i = 0; i < originINPUT.length; i++) 
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
	for (var i = 0; i < originEquip.length; i++) 
	{
		if (originEquip[i].value) {
			printEquip[i].value = originEquip[i].value
		}
		else {
			var temp = printEquip[i]
			while (temp.nodeName !== "SPAN") {
				temp = temp.parentNode
			}
			temp.className = "pale"
			//pale color for no input items
		}
	}
}
