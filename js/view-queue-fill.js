function staffqueue(staffname)
{
	var todate = new Date().mysqlDate()
	var i = q = 0
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$( BOOK ).each(function() {
		// each == this
		if (( this.staffname == staffname ) && this.opdate >= todate) {
			$('#qdatatitle tr').clone()
				.insertAfter($('#queuetbl tr:last'))
					.filldataQueue(this)
		}
	});

	if ($('#queuetbl tr').length == 1)	//no patient in waiting list
	{
		$('#qdatatitle tr').clone().insertAfter($('#queuetbl tr:last'))
			.children("td").eq(QOPDATE).html(todate.thDate())
			.parent().children("td").eq(QSINCE).html(todate().thDate().slice(0,-4))
	}

	$("#queuecontainer").scrollTop(scrolled)

	DragDropStaff()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		cell = $(this).children()
		cell.eq(QOPDATE).html(bookq.opdate.thDate())
		cell.eq(QSINCE).html(bookq.qsince.thDate().slice(0,-4))
		cell.eq(QHN).html(bookq.hn)
		cell.eq(QNAME).html(bookq.patient)
		cell.eq(QAGE).html(bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
		cell.eq(QDIAGNOSIS).html(bookq.diagnosis)
		cell.eq(QTREATMENT).html(bookq.treatment)
		cell.eq(QTEL).html(bookq.tel)
		cell.eq(QQN).html(bookq.qn)
	}
})

function fillSetTableQueue(pointing)
{
	var rowmain = $(pointing).closest('tr')
	var casename = rowmain.find('td').eq(QNAME).html()
	var thisqqn = rowmain.find('td').eq(QQN).html()
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))
	var lastqqn = $("#queuetbl tr:last td").eq(QQN).html()

	$("#qitem1").html("เพิ่ม case")
	if (lastqqn)		//no blank
		$("#qitem1").removeClass(disabled)
	else				//blank last row
		$("#qitem1").addClass(disabled)
	$("#qitem2").html("ลบ case " + casename)
	if (thisqqn)
		$("#qitem2").removeClass(disabled)
	else
		$("#qitem2").addClass(disabled)

	$("#queuemenu").menu({
		select: function( event, ui ) {
			if ($(this).attr("class") == "disabled")
				return
			var item = $(this).attr("aria-activedescendant")
			switch(item)
			{
				case "qitem1":
					addnewrowQ()
					break
				case "qitem2":
					deletecaseQ(rowmain, thisqqn)
					break
			}
			$("#editcell").data("location", "")
			$("#editcell").hide()
			$(".ui-menu").hide()
			return false
		}
	});

	showMenu(pointing, "#queuemenu", "#queuecontainer")
}

function addnewrowQ()
{
	$('#qdatatitle tr').clone().insertAfter($('#queuetbl tr:last'))
		.children("td").eq(QOPDATE).html($('#queuetbl tr:last').index())
		.parent().children("td").eq(QSINCE).html(new Date().mysqlDate().thDate())

	$("#queuecontainer").scrollTop($("#queuetbl tr:last").height())

	DragDropStaff()
}

function deletecaseQ(rowmain, qn)
{
	var staffname = $( "#titlename" ).html()
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, qcallbackdeleterow)

	function qcallbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
			updateBOOK(response);
			$(rowmain).remove()
	}
}
