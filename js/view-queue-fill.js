function staffqueue(staffname)
{	//Display all cases of only one staff in dialog box
	var queuetbl = document.getElementById("queuetbl")
	var i = q = 0
	var rowi = {}

	$('#titlename').html(staffname)
	var scrolled = $("#queuecontainer").scrollTop()
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$( QWAIT ).each(function( q ) {
		// each q == this
		if ( this.staffname == staffname ) {
			$('#qdatatitle tr').clone()
				.insertAfter($('#queuetbl tr:last'))
					.filldataQueue(this)
		}
	});

	if ($('#queuetbl tr').length == 1)	//no patient in waiting list
	{
		$('#qdatatitle tr').clone().insertAfter($('#queuetbl tr:last'))
			.children("td").eq(QNUM).html(1)
			.parent().children("td").eq(QSINCE).html(new Date().MysqlDate().thDate())
	}

	$("#queuecontainer").scrollTop(scrolled)

	DragDropStaff()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		cell = $(this).children()
		cell.eq(QNUM).html(this.index())
		cell.eq(QSINCE).html(bookq.qsince? bookq.qsince.thDate() : "")
		cell.eq(QHN).html(bookq.hn)
		cell.eq(QNAME).html(bookq.patient)
		cell.eq(QAGE).html(bookq.dob? bookq.dob.getAge(bookq.qsince) : "")
		cell.eq(QDIAGNOSIS).html(bookq.diagnosis? bookq.diagnosis : "")
		cell.eq(QTREATMENT).html(bookq.treatment? bookq.treatment : "")
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
		.children("td").eq(QNUM).html($('#queuetbl tr:last').index())
		.parent().children("td").eq(QSINCE).html(new Date().MysqlDate().thDate())

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

function fillday(day)
{	//Display only one day of each week
	var i, k, q
	var rowi = {}
	var date = ""
	var opday = DAYOFTHAINAME[day]
	var madedate
	
	$("#tbldaycontainer").show()

	date = BOOK[0].opdate
	
	//delete previous queuetbl lest it accumulates
	$('#tblday tr').slice(1).remove()

	//i for rows in table
	i=0

	//q for rows in BOOK
	for (q=0; q < BOOK.length; q++)
	{	
		while (date < BOOK[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				if (k%7 == opday)
				{	//make a blank row for matched opday which is not already in the table
					i++
					rowi = makenextrow(i, date, 'tblday')
				}
				madedate = date
			}
			date = date.nextdays(1)
			k++	// = date.getDay() = nextday on the table
			if (k%7 == 0)
			{	//make table head row before every Sunday
				$('#tblday tbody').append($('#tblday tr:first').clone())
 				i++
			}
		}
		k = new Date(BOOK[q].opdate).getDay()
		if (k == opday)
		{
			i++
			rowi = makenextrow(i, date, 'tblday')
			madedate = date
			filldata(BOOK[q], rowi)
		}
	}
	$("#dialogContainer").html($("#tbldaycontainer").html())
	$("#dialogContainer").dialog({
		title: day,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100,
	})
	$(".ui-dialog").show()
}
