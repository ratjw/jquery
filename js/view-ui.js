
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
			
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var dragcell = $(ui.draggable).children("td")
			var dropcell = $(this).children("td")
			var prevcell = $(this).prev().children("td")
			var staffname = dragcell.eq(STAFFNAME).html()
			var dragqn = dragcell.eq(QN).html()
			var dropDate = dropcell.eq(OPDATE).html().numDate()
			var dropqn = dropcell.eq(QN).html()

			if (!dragqn)
				return false

			var finalWaitnum = getfinalWaitnum(prevcell, dropqn, dropDate)

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
					DragDrop()
					if (dragTable == "queuetbl")
						staffqueue(staffname)
				}
			}
		}
	});
}

function sortable(id)
{
	var prevplaceholder
	var thisplaceholder
	var thisdrop
	var finalWaitnum

	$(id + " tbody").sortable({
		items: "> tr:has(td)",
		start: function(e, ui){
			ui.placeholder.height(ui.item.height());
		},
		forceHelperSize: true,
		forcePlaceholderSize: true,
		change: function(e, ui){
			prevplaceholder = thisplaceholder
			thisplaceholder = ui.placeholder.index()
		},
		stop: function(e, ui){
			var previtem = ui.item.prev()
			var thisitem = ui.item
			var nextitem = ui.item.next()
			var stoppos = ui.position.top
			var prevpos = previtem.offset().top
			var thispos = thisitem.offset().top
			var nextpos = nextitem.offset().top
			var nearprev = Math.abs(stoppos - prevpos)
			var nearplace = Math.abs(stoppos - thispos)
			var nearnext = Math.abs(stoppos - nextpos)
			var nearest = Math.min(nearprev, nearplace, nearnext)
			if (nearest == nearprev) 
				thisdrop = previtem
			if (nearest == nearnext) 
				thisdrop = nextitem
			if (nearest == nearplace) 
				if (prevplaceholder < thisplaceholder)
					thisdrop = previtem
				else
					thisdrop = nextitem

			var prevopdate = previtem.children("td").eq(OPDATE).html().numDate()
			var thisopdate = thisdrop.children("td").eq(OPDATE).html().numDate()
			var nextopdate = nextitem.children("td").eq(OPDATE).html().numDate()
			var prevqn = previtem.children("td").eq(QN).html()
			var thisqn = thisitem.children("td").eq(QN).html()
			var nextqn = nextitem.children("td").eq(QN).html()
			if (thisdrop == previtem) {
				finalWaitnum = prevWaitnum(prevqn, thisopdate)
			}
			if (thisdrop == nextitem) {
				finalWaitnum = nextWaitnum(nextqn, thisopdate)
			}

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisopdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbackDragDropStaff);

			function callbackDragDropStaff(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
					$( id + " tbody" ).sortable( "cancel" )
				}
				else
				{
//					$( id + " tbody" ).sortable( "refresh" )
//					$( id + " tbody" ).sortable( "refreshPositions" )
					updateBOOK(response)
					refillall()
				}
			}
		}
	})
}

function findcaseNum(qn)
{  
	var i = 0
	while (i < BOOK.length && BOOK[i].qn != qn)
		i++

	return i
}

function prevWaitnum(prevqn, dropDate)
{  
	if (!prevqn)
		return 0
	var caseNum = findcaseNum(prevqn)
	var dropWaitnum = Number(BOOK[caseNum].waitnum)
	caseNum++
	if ((caseNum > BOOK.length - 1) ||
		(BOOK[caseNum].opdate != dropDate)) {
		return dropWaitnum + 1
	} else {
		var afterWaitnum = Number(BOOK[caseNum].waitnum)
		return (afterWaitnum + dropWaitnum) / 2
	}
}

function nextWaitnum(nextqn, dropDate)
{  
	if (!nextqn)
		return 0
	var caseNum = findcaseNum(nextqn)
	var dropWaitnum = Number(BOOK[caseNum].waitnum)
	caseNum--
	if ((caseNum < 0) ||
		(BOOK[caseNum].opdate != dropDate)) {
		return 0
	} else {
		var beforeWaitnum = Number(BOOK[caseNum].waitnum)
		return (beforeWaitnum + dropWaitnum) / 2
	}
}
