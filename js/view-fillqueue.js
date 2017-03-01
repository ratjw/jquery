function staffqueue(staffname)
{	//Display all cases of only one staff in dialog box
	var queuetbl = document.getElementById("queuetbl")
	var i, q
	var rowi = {}

	$('#titlename').html(staffname)
	var scrolled = $("#queuecontainer").scrollTop()
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	for (i=0,q=0; q < QWAIT.length; q++)
	{
		if (QWAIT[q].staffname == staffname)
		{
			rowi = makenextrowQueue(queuetbl, ++i)
			filldataQueue(QWAIT[q], i, $(rowi).children("td"))
		}
	}
	if (i==0)	//no patient in waiting list
	{
		rowi = makenextrowQueue(queuetbl, ++i)
		rowi.cells[QNUM].innerHTML = 1
		rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	}
	$("#queuetbl tr td:first-child").css({
		"backgroundColor":"#AABBCC",
		"color":"white"
		})
	$("#queuecontainer").scrollTop(scrolled)
	DragDropStaff()
}

function closequeue()
{
	$("#queuecontainer").hide()
	$("#queuecontainer").css("width", "0%")
	$("#tblcontainer").css("width", "100%")
}

function makenextrowQueue(table, i)
{	// i = the row to be made
	var cols = table.rows[0].cells.length
	var rowi

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = qdatatitle.innerHTML
	rowi.cells[QQN].style.display = "none"
	return rowi
}

function fillselectQueue(row, rowcell, waitnum, qn)	//seek the QWAIT row
{
	var q = 0
	if (waitnum)	//come from old queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].waitnum != waitnum))
			q++	
	else			//come from new queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
			q++	

	filldataQueue(QWAIT[q], row, rowcell)
}

function filldataQueue(bookq, row, rowcell)		
{
	rowcell.eq(QNUM).html(row)
	rowcell.eq(QSINCE).html(bookq.qsince? bookq.qsince.thDate() : "")
	rowcell.eq(QHN).html(bookq.hn)
	rowcell.eq(QNAME).html(bookq.patient)
	rowcell.eq(QAGE).html(bookq.dob? bookq.dob.getAge(bookq.qsince) : "")
	rowcell.eq(QDIAGNOSIS).html(bookq.diagnosis? bookq.diagnosis : "")
	rowcell.eq(QTREATMENT).html(bookq.treatment? bookq.treatment : "")
	rowcell.eq(QTEL).html(bookq.tel)
	rowcell.eq(QQN).html(bookq.qn)
}

function fillSetTableQueue(pointing)
{
	var rowmain = $(pointing).closest('tr')
	var casename = rowmain.find('td').eq(QNAME).html()
	var thisqqn = rowmain.find('td').eq(QQN).html()
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))
	var lastqqn = $("#queuetbl tr:last td:last").html()

	$("#qitem1").html("เพิ่ม case")
	if (lastqqn)
		$("#qitem1").removeClass(disabled)
	else
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
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	showup(pointing, "#queuemenu")
}

function addnewrowQ()
{
	var queuetbl = document.getElementById("queuetbl")
	var toscroll

	rownum = $("#queuetbl tr").length	//always append to table end
	rowi = makenextrowQueue(queuetbl, rownum)
	rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	toscroll = $("#queuetbl").height() - $("#queuecontainer").height() + $(rowi).height()
	$("#queuecontainer").scrollTop(toscroll)
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
// 	DragDropday(event)
}
