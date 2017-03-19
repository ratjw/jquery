
function DragDrop()
{
	$("#tbl tr:has(td)").draggable({
		revert: "true",
		helper: function(){
					var copy = $(this).clone();
					copy.find("td").css({
						"fontSize": "14px",
						"border": "solid 1px silver",
					})
					return copy;
				},
		appendTo: 'body',
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function (event) {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#tbl tr:has(td)").droppable({
		accept: "tr:has(td)",

		over: function (event, ui){
			if ($(ui.helper).position().top < 50) {
				$('#tblcontainer').animate({
					scrollTop: $('#tblcontainer').scrollTop() - 200
				}, 200);
			}
			if ($(ui.helper).position().top > $('#tblcontainer').innerHeight() - 50) {
				$('#tblcontainer').animate({
					scrollTop: $('#tblcontainer').scrollTop() + 200
				}, 200);
			}
		},

		drop: function (event, ui) {
			var dropWaitnum, nextWaitnum, finalWaitnum
			var prevDate, prevqn, dropqn, caseNum
			var staffname = $( "#titlename" ).html()
			var dragcell = $(ui.draggable).children("td")
			var dropcell = $(this).children("td")
			var dragqn = dragcell.eq(QN).html()
			var dropDate = dropcell.eq(OPDATE).html().numDate()

			if (!dragqn)
				return false

			dropqn = dropcell.eq(QN).html()
			if (dropqn) {	//drop on existing case
				caseNum = findcaseNum(dropqn)	//look in BOOK
			} else {		//drop on blank row
				if (!(prevDate = $(this).prev().children("td").eq(OPDATE).html()))	//undefined
					finalWaitnum = 1		//no case in this date
				if (prevDate != dropDate) {
					finalWaitnum = 1		//no case in this date
				} else {
					prevqn = $(this).prev().children("td").eq(QN).html()	//case in this date
					caseNum = findcaseNum(prevqn)	//look in BOOK
				}
			}

			if (!finalWaitnum) {
				dropWaitnum = Number(BOOK[caseNum].waitnum)
				caseNum++
				if ((caseNum > BOOK.length - 1) ||
					(BOOK[caseNum].opdate != dropDate)) {
					finalWaitnum = dropWaitnum + 1
				} else {
					nextWaitnum = Number(BOOK[caseNum].waitnum)
					finalWaitnum = (nextWaitnum + dropWaitnum) / 2	//interposition
				}
			}

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + dropDate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ dragqn +";"

			Ajax(MYSQLIPHP, sql, callbackDragDrop);

			function callbackDragDrop(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response)
					refillall()
					if (($('#queuecontainer').css('display') == 'block') &&
						($( "#titlename" ).html() == staffname))
						staffqueue(staffname)

					DragDrop()
				}
			}
		}
	});
}

function DragDropStaff()
{
	$("#queuetbl tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#queuetbl tr:has(td)").droppable({
		accept: "tr:has(td)",

		over: function (event, ui) {
			if ($(ui.helper).position().top < 50) {
				$('#queuecontainer').animate({
					scrollTop: $('#queuecontainer').scrollTop() - 100
				}, 200);
			}
			if ($(ui.helper).position().top > $('#queuecontainer').innerHeight() - 50) {
				$('#queuecontainer').animate({
					scrollTop: $('#queuecontainer').scrollTop() + 100
				}, 200);
			}
		},

		drop: function (event, ui) {
			var dropWaitnum, nextWaitnum, finalWaitnum
			var prevDate, prevqn, dropqn, caseNum
			var staffname = $( "#titlename" ).html()
			var dragcell = $(ui.draggable).children("td")
			var dropcell = $(this).children("td")
			var dragqn = dragcell.eq(QN).html()
			var dropDate = dropcell.eq(OPDATE).html().numDate()

			if (!dragqn)
				return false
			if (staffname != dragcell.eq(STAFFNAME).html())//accept only same staff name
				return false

			dropqn = dropcell.eq(QN).html()
			if (dropqn) {	//drop on existing case
				caseNum = findcaseNum(dropqn)	//look in BOOK
			} else {		//drop on blank row
				if (!(prevDate = $(this).prev().children("td").eq(OPDATE).html()))	//undefined
					finalWaitnum = 1		//no case in this date
				if (prevDate != dropDate) {
					finalWaitnum = 1		//no case in this date
				} else {
					prevqn = $(this).prev().children("td").eq(QN).html()	//case in this date
					caseNum = findcaseNum(prevqn)	//look in BOOK
				}
			}

			if (!finalWaitnum) {
				dropWaitnum = Number(BOOK[caseNum].waitnum)
				caseNum++
				if ((caseNum > BOOK.length - 1) ||
					(BOOK[caseNum].opdate != dropDate)) {
					finalWaitnum = dropWaitnum + 1
				} else {
					nextWaitnum = Number(BOOK[caseNum].waitnum)
					finalWaitnum = (nextWaitnum + dropWaitnum) / 2	//interposition
				}
			}

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + dropDate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ dragqn +";"

			Ajax(MYSQLIPHP, sql, callbackDragDropStaff);

			function callbackDragDropStaff(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response);
					staffqueue(staffname)
					refillall()
					DragDrop()
				}
			}
		}
	});
}

function findcaseNum(qn)
{  
	var i = 0
	while (i < BOOK.length && BOOK[i].qn != qn)
		i++

	return i
}

function findwaitnum(qn)
{  
	var waitnum
	$.each( BOOK, function() {
		waitnum = this.waitnum
		return (this.qn != qn)
	})
	return Number(waitnum)
}
