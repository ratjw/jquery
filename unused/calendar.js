function MoveCalendar(clickdate, qn)
{
	var Days_in_Month = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var Today = new Date();
	var First_Date
	var First_Day
	var FirstMonth = Today.getMonth() - 3;
	var FirstYear = Today.getFullYear();
	var Rows = 6;
	var dd, mm, opdate;
	var calendar = document.getElementById("calendar");
	var calendarin = document.getElementById("calendarin");
	var temp;

	var HTML_head = '<tr><td>';
		HTML_head += '<table class="calendartable">';
		HTML_head += '<tr><th colspan=7>';

	var HTML_String = '<table>';
	for (var k=0; k<15; k++)
	{
		First_Date = new Date(FirstYear, FirstMonth+k, 1);
		First_Day = new Date(First_Date).getDay();
		Month = First_Date.getMonth();
		Year = First_Date.getFullYear();
		if (Month == 1)
			Days_in_Month[1] = ((Year % 400 == 0) || ((Year % 4 == 0) && (Year % 100 !=0))) ? 29 : 28;
		HTML_String += HTML_head + MONTH_LABEL[Month] +' '+ parseInt(Year + 543) + '</th></tr>';

		HTML_String += '<tr>';
		for (var i=0; i<7; i++) {
			HTML_String += '<th>'+ NAMEOFDAYTHAI[i] +'</th>';
		}
		HTML_String += '</tr>';

		var Day_Counter = 1;
		var Loop_Counter = 0;
		for (var j = 0; j < Rows; j++) {
			HTML_String += '<tr>';
			for (var i = 0; i < 7; i++) {
				if ((Loop_Counter >= First_Day) && (Day_Counter <= Days_in_Month[Month])) {
					mm = Month + 1;
					mm = mm<10? "0"+ mm : ""+ mm;
					dd = Day_Counter<10? "0"+ Day_Counter : ""+ Day_Counter;
					opdate = Year +"-"+ mm +"-"+ dd;
					if (i == 0)
						temp = 'class="calendarsun"';
					else if (i == 6)
						temp = 'class="calendarsat"';
					else
						temp = 'class="calendarday"';
					if (opdate == Today.MysqlDate())
						temp = 'class="calendartoday"';
					if (opdate == clickdate)
						temp = 'class="calpremoveday"';
					temp += ' onclick="movecaseQbookToQbook('+ qn +',\''+ opdate +'\')"'
					HTML_String += '<td '+ temp +'>'
					HTML_String += '<STRONG>'+ Day_Counter +'</STRONG><br/>';
					HTML_String += countOR(opdate)
					HTML_String += '</td>'
					Day_Counter++;
				}
				else {
					HTML_String += '<td></td>'
				}
				Loop_Counter++;
			}
			HTML_String += '</tr>';
		}
		HTML_String += '</table></td></tr>'
	}
	HTML_String += '</table>';

	calendar.style.left = document.getElementById("tbl").rows[0].cells[4].offsetLeft +"px"
	calendar.style.display = "block"
	calendar.onmousedown = dragHandler
	calendarin.innerHTML = HTML_String
	calendarin.getElementsByTagName("TABLE")[4].scrollIntoView(true)
	calendarin.style.overflowY = "scroll"
}

function ConsultCalendar()
{
	var Days_in_Month = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var Today = new Date();
	var First_Date
	var First_Day
	var FirstMonth = Today.getMonth() - 3;
	var FirstYear = Today.getFullYear();
	var Rows = 6;
	var dd, mm, opdate;
	var calendar = document.getElementById("calendar");
	var calendarin = document.getElementById("calendarin");
	var temp;

	var HTML_head = '<tr><td>';
		HTML_head += '<table class="calendartable">';
		HTML_head += '<tr><th colspan=7>';

	var HTML_String = '<table>';
	for (var k=0; k<15; k++)
	{
		First_Date = new Date(FirstYear, FirstMonth+k, 1);
		First_Day = new Date(First_Date).getDay();
		Month = First_Date.getMonth();
		Year = First_Date.getFullYear();
		if (Month == 1)
			Days_in_Month[1] = ((Year % 400 == 0) || ((Year % 4 == 0) && (Year % 100 !=0))) ? 29 : 28;
		HTML_String += HTML_head + MONTH_LABEL[Month] + ' ' + parseInt(Year + 543) + '</th></tr>';

		HTML_String += '<tr>';
		for (var i=0; i<7; i++) {
			HTML_String += '<th>' + NAMEOFDAYTHAI[i]+'</th>';
		}
		HTML_String += '</tr>';

		var Day_Counter = 1;
		var Loop_Counter = 0;
		for (var j = 0; j < Rows; j++) {
			HTML_String += '<tr>';
			for (var i = 0; i < 7; i++) {
				if ((Loop_Counter >= First_Day) && (Day_Counter <= Days_in_Month[Month])) {
					mm = Month + 1;
					mm = mm<10? "0"+ mm : ""+ mm;
					dd = Day_Counter<10? "0"+ Day_Counter : ""+ Day_Counter;
					opdate = Year +"-"+ mm +"-"+ dd;
					if (i == 0)
						temp = 'class="calendarsun"';
					else if (i == 6)
						temp = 'class="calendarsat"';
					else
						temp = 'class="calendarday"';
					if (opdate == Today.MysqlDate())
						temp = 'class="calendartoday"';
					temp += ''
					HTML_String += '<td onclick="fillconsultcalendar(this, \''
					HTML_String += opdate +'\')" '+ temp +'>'
					HTML_String += '<STRONG>'+ Day_Counter +'</STRONG><br/>';
					HTML_String += constring(opdate)
					HTML_String += '</td>'
					Day_Counter++;
				}
				else {
					HTML_String += '<td></td>'
				}
				Loop_Counter++;
			}
			HTML_String += '</tr>';
		}
		HTML_String += '</table></td></tr>'
	}
	HTML_String += '</table>';

	calendar.style.left = document.getElementById("tbl").rows[0].cells[4].offsetLeft +"px"
	calendar.style.display = "block"
	calendar.onmousedown = dragHandler
	calendarin.innerHTML = HTML_String
	calendarin.getElementsByTagName("TABLE")[4].scrollIntoView(true)
	calendarin.style.overflowY = "scroll"
}

function countOR(opdate)
{
	var ORneuro = {}
	var HTML = ""
	var room
	var q

	for (q=0; q<QBOOK.length; q++) 
		if (QBOOK[q].opdate == opdate)
			break
	while ((q < QBOOK.length) && (QBOOK[q].opdate == opdate))
	{
		room = QBOOK[q].oproom? QBOOK[q].oproom : "OR??"
		if (ORneuro[room] == undefined)
			ORneuro[room] = 0
		ORneuro[room]++
		q++
	}
	for (room in ORneuro)
	{
		if (ORneuro[room] != 0)
		{
			HTML += room +" "+ ORneuro[room] +"<br>"
		}
	}
	return HTML
}

function xcalendar()
{
	document.getElementById("calendar").style.display = ""
}

function sinceCalendar(pointing, qn)
{
	var Days_in_Month = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var Today = new Date();
	var First_Date
	var First_Day
	var FirstMonth = Today.getMonth() - 12;
	var FirstYear = Today.getFullYear();
	var Rows = 6;
	var dd, mm, opdate;
	var qcalendar = document.getElementById("qcalendar");
	var qcalendarin = document.getElementById("qcalendarin");
	var temp;

	var HTML_head = '<tr><td>';
		HTML_head += '<table class="calendartable">';
		HTML_head += '<tr><th colspan=7>';

	var HTML_String = '<table>';
	for (var k=0; k<15; k++)
	{
		First_Date = new Date(FirstYear, FirstMonth+k, 1);
		First_Day = new Date(First_Date).getDay();
		Month = First_Date.getMonth();
		Year = First_Date.getFullYear();
		if (Month == 1)
			Days_in_Month[1] = ((Year % 400 == 0) || ((Year % 4 == 0) && (Year % 100 !=0))) ? 29 : 28;
		HTML_String += HTML_head + MONTH_LABEL[Month] +' '+ parseInt(Year + 543) + '</th></tr>';

		HTML_String += '<tr>';
		for (var i=0; i<7; i++) {
			HTML_String += '<th>'+ NAMEOFDAYTHAI[i] +'</th>';
		}
		HTML_String += '</tr>';

		var Day_Counter = 1;
		var Loop_Counter = 0;
		for (var j = 0; j < Rows; j++) {
			HTML_String += '<tr>';
			for (var i = 0; i < 7; i++) {
				if ((Loop_Counter >= First_Day) && (Day_Counter <= Days_in_Month[Month])) {
					mm = Month + 1;
					mm = mm<10? "0"+ mm : ""+ mm;
					dd = Day_Counter<10? "0"+ Day_Counter : ""+ Day_Counter;
					opdate = Year +"-"+ mm +"-"+ dd;
					if (i == 0)
						temp = 'class="calendarsun"';
					else if (i == 6)
						temp = 'class="calendarsat"';
					else
						temp = 'class="calendarday"';
					if (opdate == Today.MysqlDate())
						temp = 'class="calendartoday"';
					temp += ' onclick="sinceDate('+ qn +', \''+ opdate +'\')"'
					HTML_String += '<td '+ temp +'>'
					HTML_String += '<STRONG>'+ Day_Counter +'</STRONG><br/>';
					HTML_String += countOR(opdate)
					HTML_String += '</td>'
					Day_Counter++;
				}
				else {
					HTML_String += '<td></td>'
				}
				Loop_Counter++;
			}
			HTML_String += '</tr>';
		}
		HTML_String += '</table></td></tr>'
	}
	HTML_String += '</table>';

	qcalendar.style.top = 0 +"px"
	qcalendar.style.left = document.getElementById("queuetbl").rows[0].cells[4].offsetLeft +"px"
	qcalendar.style.display = "block"
	qcalendarin.innerHTML = HTML_String
	qcalendarin.getElementsByTagName("TABLE")[12].scrollIntoView(true)
	qcalendarin.style.overflowY = "scroll"

	sinceDate = function (qn, sincedate)
	{
		var table = document.getElementById("queuetbl")
		var sql = ""

		table.style.cursor = 'wait'
		sql = "sqlReturnbook=UPDATE book SET opdate='" + sincedate
		sql += "', editor='"+ THISUSER
		sql += "' WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbacksinceDate);

		document.getElementById("qcalendar").style.display = ""
			
		function callbacksinceDate(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
				alert ("sinceDate failed!\n" + response)
			else
			{
				updateQBOOK(response)
				pointing.innerHTML = sincedate.thDate()
			}
			stopEditmode()
			xqcalendar()
			table.style.cursor = 'default'
		}	
	}
}

function xqcalendar()
{
	document.getElementById("qcalendar").style.display = ""
}
