
function DragDrop()
{
	$("#tbl tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 1000,	//z-index of #container increased by each dropping
		start : function (event) {
			$("#editcell").hide()
			$("#menu").hide()
			$("#stafflist").hide()
		}
	});

	$("#tbl, #tbl tr").droppable({
		accept: "tr",
		drop: function (event, ui) {
			if (!$(this).children("td").eq(OPDATE).html())		//drop on header
				return false

			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html().numDate()
			var thisdate = $(this).children("td").eq(OPDATE).html().numDate()
			var thisqn = $(this).children("td").eq(QN).html()

			if (dragTable == "queuetbl") 
			{
				var thatqn = $(ui.draggable).children("td").eq(QQN).html()
				if (!thatqn)
					return false
				thatdate = nextdate	//trigger "that_row.remove()"
			}
			else if (dragTable == "tbl")
			{
				var thatqn = $(ui.draggable).children("td").eq(QN).html()
				if (!thatqn)
					return false

				if (prevdate = $(ui.draggable).prev().children("td").eq(OPDATE).html()) 
					prevdate = prevdate.numDate()
				if (nextdate = $(ui.draggable).next().children("td").eq(OPDATE).html())
					nextdate = nextdate.numDate()
			}
			$("#tbl").css("cursor", 'wait')
			var sql = "sqlReturnbook=UPDATE book SET "
			sql += "opdate='" + thisdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

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
					if (prevdate == thatdate || thatdate == nextdate)
						that_row.remove()
//					else if (dragTable == "queuetbl")
//					{
//						var staffname = $( "#container" ).dialog( "option", "title" )
//						staffqueue(staffname)
//					}

					if (thisqn)
						this_row.after(this_row.clone());

					filluprefill()
					DragDrop()
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}

function DragDropday()
{
	$("#tblday tr:has(td)").draggable({
		helper: "clone",
		revert: "invalid",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			event.stopPropagation()
		}
	});

	$("#tblday tr").droppable({
		accept: "#tbl tr, #tblday tr",
		drop: function (event, ui) {
			event.stopPropagation()

			if (!$(this).children("td").eq(OPDATE).html())		//drop on header
				return true

			$("#tbl").css("cursor", 'wait')
			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html().numDate()
			var thisdate = $(this).children("td").eq(OPDATE).html().numDate()
			var thisqn = $(this).children("td").eq(QN).html()

			if (dragTable == "queuetbl") 
			{
				var thatqn = $(ui.draggable).children("td").eq(QQN).html()
				var sql = "sqlReturnbook=UPDATE book SET waitnum = NULL, "
				sql += "opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"

				prevdate = thatdate
				nextdate = thatdate
			}
			else if (dragTable == "tbl")
			{
				var thatqn = $(ui.draggable).children("td").eq(QN).html()
				var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisdate
				sql += "', editor='"+ THISUSER
				sql += "' WHERE qn="+ thatqn +";"

				if (prevdate = $(ui.draggable).prev().children("td").eq(OPDATE).html()) 
					prevdate = prevdate.numDate()
				if (nextdate = $(ui.draggable).next().children("td").eq(OPDATE).html())
					nextdate = nextdate.numDate()
			}

			Ajax(MYSQLIPHP, sql, callbackDragDropday);

			function callbackDragDropday(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					if (prevdate == thatdate || thatdate == nextdate)
						that_row.remove();				

					if (thisqn)
						this_row.after(this_row.clone());

					updateBOOK(response);
					filluprefill()
					DragDrop(event)
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}

function DragDropStaff()
{
	$("#queuetbl tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			$( "#tbl tr" ).droppable( "disable" )
		}
	});
//test hijack
	//add "#container" to trigger "over" at the "start" of draggable "#queuetbl tr"
	//this is essential even it causes "#tbl" draggable enter "drop" 2 times
	//because "#queuetbl tr" will move to "#tbl" when it was slightly dragged
	//the first "drop" (because of #container) is filtered out by "drop on header"
	$("#container, #queuetbl tr").droppable({
		greedy: true,
		over: function(event, ui){
			$( "#tbl tr" ).droppable( "disable" )
		},
		out: function(event, ui){
			$( "#tbl tr" ).droppable( "enable" )
		},
		accept: "tr",
		drop: function (event, ui) {

			if (!$(this).children("td").eq(OPDATE).html())	//drop on header
				return true

			var staffdrag = $(ui.draggable).children("td").eq(STAFFNAME).html()
			if (!staffdrag)
				return false
			var staffname = $( "#container" ).dialog( "option", "title" )
			if (staffdrag != staffname)
				return
			var thatqn = $(ui.draggable).children("td").eq(QN).html()
			var waitnum = findwaitnum(thatqn)
			if (!waitnum)
				waitnum = findMAXwaitnum() + 1
			var qsince = findQsince(thatqn)
			if (!qsince)
				qsince = $("#queuetbl tr:last td").eq(QSINCE).html().numDate()

			var sql = "sqlReturnbook=UPDATE book SET waitnum = "+ waitnum
			sql += ", qsince='"+ qsince
			sql += "', opdate='0000-00-00'"
			sql += ", editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

			$("#tbl").css("cursor", 'wait')

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
					filluprefill()
					DragDrop(event)
				}
				$("#tbl").css("cursor", 'default')
			}	
		}
	});
}
