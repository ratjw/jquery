
function scrollUpDown()
{
	var tableheight = document.getElementById("tbl").offsetHeight
	var scrolly = Yscrolled()

	if ($(window).scrollTop() < 2)
	{
		fillupscroll(-1)
	}
	else if (tableheight <= window.innerHeight + scrolly)
	{
		fillupscroll(+1)
	}
}

function PACS(hn) 
{ 
	open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);
} 

function edithistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackedithistory)
	}

	function callbackedithistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			$("#alert").text("Data history DBfailed!\n" + response);
			$("#alert").fadeIn();
		}
		else
		{
			makehistory(rowmain, response)
		}
		$("#editcell").hide()
	}
}

function makehistory(rowmain, response)
{
	var history = JSON.parse(response);

	var HTML_String = '<table class="historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:30%">Diagnosis</th>';
	HTML_String += '<th style="width:30%">Treatment</th>';
	HTML_String += '<th style="width:25%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if (!history[j].diagnosis && !history[j].treatment && !history[j].tel)
			continue
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#container").html(HTML_String);
	$("#container").dialog({
		dialogClass: "dialog",
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
}

function deletehistory(rowmain, qn)
{
	var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE waitnum=0;"

		Ajax(MYSQLIPHP, sql, callbackdeletehistory)

	function callbackdeletehistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			$("#alert").text("Delete history DBfailed!\n" + response);
			$("#alert").fadeIn();
		}
		else
		{
			makeDeleteHistory(rowmain, response)
		}
		$("#editcell").hide()
	}
}

function makeDeleteHistory(rowmain, response)
{
	var history = JSON.parse(response);

	var HTML_String = '<table class="historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:25%">Diagnosis</th>';
	HTML_String += '<th style="width:25%">Treatment</th>';
	HTML_String += '<th style="width:20%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].hn +'</td>';
		HTML_String += '<td>' + history[j].patient +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#container").html(HTML_String);
	$("#container").dialog({
		dialogClass: "dialog",
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
}

function holiday(date)
{
	var monthdate = date.substring(5)
	var dayofweek = (new Date(date)).getDay()
	var holidayname = ""

	for (var key in HOLIDAY) 
	{
		if (key == date)
			return HOLIDAY[key]	//matched a holiday
		if (key > date)
			break		//not a listed holiday
						//either a fixed or a compensation holiday
	}
	switch (monthdate)
	{
	case "12-31":
		holidayname = "url('pic/Yearend.jpg')"
		break
	case "01-01":
		holidayname = "url('pic/Newyear.jpg')"
		break
	case "01-02":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Yearendsub.jpg')"
		break
	case "01-03":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Newyearsub.jpg')"
		break
	case "04-06":
		holidayname = "url('pic/Chakri.jpg')"
		break
	case "04-07":
	case "04-08":
		if (dayofweek == 1)
			holidayname = "url('pic/Chakrisub.jpg')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('pic/Songkran.jpg')"
		break
	case "04-16":
	case "04-17":
		if (dayofweek && (dayofweek < 4))
			holidayname = "url('pic/Songkransub.jpg')"
		break
	case "05-05":
		holidayname = "url('pic/Coronation.jpg')"
		break
	case "05-06":
	case "05-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Coronationsub.jpg')"
		break
	case "08-12":
		holidayname = "url('pic/Queen.jpg')"
		break
	case "08-13":
	case "08-14":
		if (dayofweek == 1)
			holidayname = "url('pic/Queensub.jpg')"
		break
	case "10-23":
		holidayname = "url('pic/Piya.jpg')"
		break
	case "10-24":
	case "10-25":
		if (dayofweek == 1)
			holidayname = "url('pic/Piyasub.jpg')"
		break
	case "12-05":
		holidayname = "url('pic/King.jpg')"
		break
	case "12-06":
	case "12-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Kingsub.jpg')"
		break
	case "12-10":
		holidayname = "url('pic/Constitution.jpg')"
		break
	case "12-11":
	case "12-12":
		if (dayofweek == 1)
			holidayname = "url('pic/Constitutionsub.jpg')"
		break
	}
	return holidayname
}
