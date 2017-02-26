
function DragDrop()
{
	$("#tbl tr:has(td)").draggable({
		revert: "true",
		helper: function(){
					var copy = $(this).clone();
					copy.find("td").css({
						"fontSize": "16px",
						"border": "solid 1px silver",
					})
					return copy;
				},
		appendTo: 'body',
		scroll: false,
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function (event) {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#tbl tr:has(td)").droppable({
		accept: "tr",
		drop: function (event, ui) {
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
					else if (dragTable == "queuetbl")
					{
						var staffname = $( "#titlename" ).html()
						staffqueue(staffname)
					}

					if (thisqn)
						this_row.after(this_row.clone());

					filluprefill()
					DragDrop()
				}
			}	
		}
	});
}

function DragDropday()
{
	$("#tblday tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#tblday tr:has(td)").droppable({
		accept: "#tbl tr, #tblday tr",
		drop: function (event, ui) {
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
			}	
		}
	});
}

function DragDropStaff()
{
	$("#queuetbl tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
//		appendTo: "body",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#queuetbl tr:has(td)").droppable({
		accept: "#tbl tr, #tblday tr",
		drop: function (event, ui) {
			var staffdrag = $(ui.draggable).children("td").eq(STAFFNAME).html()
			if (!staffdrag)
				return false
			var staffname = $( "#titlename" ).html()
			if (staffdrag != staffname)
				return
			var thatqn = $(ui.draggable).children("td").eq(QN).html()
			var waitnum = findwaitnum(thatqn)
			if (!(waitnum > 0))
				waitnum = findMAXwaitnum() + 1
			var qsince = findQsince(thatqn)
			if (!qsince)
				qsince = $("#queuetbl tr:last td").eq(QSINCE).html().numDate()

			var sql = "sqlReturnbook=UPDATE book SET waitnum = "+ waitnum
			sql += ", qsince='"+ qsince
			sql += "', opdate='0000-00-00'"
			sql += ", editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

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
			}	
		}
	});
}
