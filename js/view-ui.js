
function DragDrop()
{
	$("#tbl tr:has(td)").draggable({
		revert: "true",
		refreshPositions: true,
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
/*
		drag: function (event, ui){
			if ($(ui.helper).position().top < 50) {
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() - 10)
			}
			if ($(ui.helper).position().top > $('#tblcontainer').innerHeight() - 50)
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() + 10)
		},
*/
		start : function (event) {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#tbl tr:has(td)").droppable({
		accept: "tr",

		over: function (event, ui){
			if ($(ui.helper).position().top < 100) {
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() - 100)
			}
			if ($(ui.helper).position().top > $('#tblcontainer').innerHeight() - 100)
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() + 100)
		},

		drop: function (event, ui) {
			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html()
			var thisdate = $(this).children("td").eq(OPDATE).html()
			if (thatdate)
				thatdate = thatdate.numDate()
			if (thisdate)
				thisdate = thisdate.numDate()
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
					if (dragTable == "queuetbl") {
						staffqueue($( "#titlename" ).html())
					} else {
						deleteRow(that_row, thatdate)
					}
						
					if (thisqn)
						this_row.after(this_row.clone());

					fillthisDay(thisdate)
				}
			}	
			DragDrop()
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
/*
		drag: function (event, ui){
			if ($(ui.helper).position().top < 50)
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() - 10)
			if ($(ui.helper).position().top > $('#tblcontainer').innerHeight() - 50)
				$('#tblcontainer').scrollTop($('#tblcontainer').scrollTop() + 10)
			if ($(ui.helper).position().top < 50)
				$('#queuecontainer').scrollTop($('#queuecontainer').scrollTop() - 10)
			if ($(ui.helper).position().top > $('#queuecontainer').innerHeight() - 50)
				$('#queuecontainer').scrollTop($('#queuecontainer').scrollTop() + 10)
		},
*/
		start : function () {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#queuetbl tr:has(td)").droppable({
		accept: "#tbl tr, #queuetbl tr",

		over: function (event, ui) {
			if ($(ui.helper).position().top < 100)
				$('#queuecontainer').scrollTop($('#queuecontainer').scrollTop() - 50)
			if ($(ui.helper).position().top > $('#queuecontainer').innerHeight() - 100)
				$('#queuecontainer').scrollTop($('#queuecontainer').scrollTop() + 50)
		},

		drop: function (event, ui) {
			var finalWaitnum
			var staffname = $( "#titlename" ).html()
			var thatRow = ui.draggable
			var uidrag = $(ui.draggable).children("td")
			var thatDate = uidrag.eq(OPDATE).html().numDate()
			var dragTable = $(ui.draggable).closest("table").attr("id")
			if (dragTable == "tbl") {
				var staffdrag = uidrag.eq(STAFFNAME).html()
				if (staffdrag != staffname)
					return
				var dragqn = uidrag.eq(QN).html()
			} else {
				var dragqn = uidrag.eq(QQN).html()
			}
			var prevqn = $(this).prev().children("td").eq(QQN).html()
			if (prevqn) {
				var prevWaitnum = findwaitnumQ(prevqn)
			} else {
				var prevWaitnum = 0
			}
			var dropqn = $(this).children("td").eq(QQN).html()
			if (dropqn) {
				var dropWaitnum = findwaitnumQ(dropqn)
				if (dragTable == "tbl")
					thisdrop = $(this)	//ui.draggable from another table, same number of rows
				else
					thisdrop = $(this).next()	//ui.draggable was added to last row of same table
				if (thisdrop.is(":last-child"))
					finalWaitnum = dropWaitnum + 1000000000000
				else
					finalWaitnum = (prevWaitnum + dropWaitnum) / 2
			} else {
				finalWaitnum = prevWaitnum + 1000000000000
			}

			var sql = "sqlReturnbook=UPDATE book SET waitnum = "+ finalWaitnum
			sql += ", opdate=0000-00-00"
			sql += ", editor='"+ THISUSER
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
					if (dragTable == "tbl") {
						deleteRow(thatRow, thatDate)
					}
				}
			}
			DragDropStaff()
		}
	});
}
