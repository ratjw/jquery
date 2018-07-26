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

	if (height > 1000) {
		height = 1000
	}

	$.each(profile, function(key, val) {
		document.getElementById(key).innerHTML = val
	})

	// mark table row
	// clear all previous dialog values
	$row.addClass("bordergroove")
	$dialogEquip.show()
	$dialogEquip.find('input').val('')
	$dialogEquip.find('textarea').val('')
	$dialogEquip.find('input').prop('checked', false)
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
		});
 	} else {
		$('#editedby').html("")
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
	$('#dialogEquip input').on("click", function() { return false })
	$('#dialogEquip input[type=text]').prop('disabled', true)
	$('#dialogEquip textarea').prop('disabled', true)
}
