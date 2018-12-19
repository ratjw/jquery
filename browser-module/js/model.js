
import { QN, LARGESTDATE } from "./const.js"
import { user, URIcomponent } from "./util.js"

export {
	modelSaveRoomTime, modelSaveContent, modelSaveNoQN, modelSaveByHN,
	modelGetEquip, modelSaveEquip, modelChangeDate, modelAllCases,
	modelDeleteCase, modelCaseHistory, modelAllDeletedCases, modelUndelete,
	modelFind, modelGetfromServer, modelGetIPD, modelSaveService, modelStart,
	modelIdling, modelSortable, modelSyncServer, modelFindLatestEntry
}

// const
const GETIPD	= "php/getipd.php",
	GETNAMEHN	= "php/getnamehn.php",
	MYSQLIPHP	= "php/mysqli.php",
	SEARCH		= "php/search.php",
	LINEBOT		= "line/lineBot.php",
	LINENOTIFY	= "line/lineNotify.php"

// function declaration (definition ) : public
// function expression (literal) : local

function modelStart() {
	return postData(MYSQLIPHP, "start=''");
}

function modelIdling(timestamp) {
	return postData(MYSQLIPHP, "functionName=checkupdate&time=" + timestamp);
}

function modelSortable(args) {
	let finalWaitnum = args.finalWaitnum,
		roomtime = args.roomtime,
		thisOpdate = args.thisOpdate,
		thisqn = args.thisqn,
		sql = "sqlReturnbook=UPDATE book SET Waitnum="+ finalWaitnum
			+ ", opdate='" + thisOpdate
			+ (roomtime.roomtime &&
				("', oproom='" + roomtime.roomtime[0]
				+"', optime='" + roomtime.roomtime[1]))
			+ "', editor='"+ user
			+ "' WHERE qn="+ thisqn +";"

	return postData(MYSQLIPHP, sql);
}

function modelFindLatestEntry() {
	let sql = "sqlReturnData=SELECT qn FROM bookhistory "
			+ "WHERE editdatetime=(SELECT MAX(editdatetime) FROM bookhistory);"

	return postData(MYSQLIPHP, sql);
}

function modelSyncServer(book, consult) {
	let sql = "functionName=syncServer&book=" + book
			+ "&consult=" + consult

	return postData(MYSQLIPHP, sql);
}

function modelSaveService(column, content, qn) {
	let sql = "sqlReturnbook=UPDATE book SET "
			+ column +"='"+ content
			+ "', editor='"+ user
			+ "' WHERE qn="+ qn +";"

	return postData(MYSQLIPHP, sql);
}

function modelGetIPD(fromDate, toDate) {
	return postData(GETIPD, "from=" + fromDate + "&to=" + toDate)
}

function modelGetfromServer(fromDate, toDate) {
	let sql = "sqlReturnData=SELECT * FROM book "
			  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
			  + "' AND waitnum<>0 "
			  + "ORDER BY opdate, oproom='', oproom, optime, waitnum;";

	return postData(MYSQLIPHP, sql)
}

function modelFind(hn, patient, diagnosis, treatment, contact) {
	let sql = "sqlReturnData=SELECT * FROM book WHERE "
		sql += hn && ("hn='" + hn + "' ")
		sql += patient &&
				(hn ? ("AND patient like '%" + patient + "%' ")
					: ("patient like '%" + patient + "%' "))
		sql += diagnosis &&
				((hn || patient)
				? ("AND diagnosis like '%" + diagnosis + "%' ")
				: ("diagnosis like '%" + diagnosis + "%' "))
		sql += treatment &&
				((hn || patient || diagnosis)
				? ("AND treatment like '%" + treatment + "%' ")
				: ("treatment like '%" + treatment + "%' "))
		sql += contact &&
				((hn || patient || diagnosis || treatment)
				? ("AND contact like '%" + contact + "%' ")
				: ("contact like '%" + contact + "%' "))
		sql += "ORDER BY opdate DESC;"

	return postData(MYSQLIPHP, sql)
}

function modelUndelete(opdate, qn) {
	let sql = "functionName=undelete&qn=" + qn
			+ "&opdate=" + opdate
			+ "&editor=" + user

	return postData(MYSQLIPHP, sql);
}

function modelAllDeletedCases() {
	return postData(MYSQLIPHP, "functionName=deletedCases")
}

function modelAllCases() {
	let sql = "sqlReturnData=SELECT * FROM book "
			+ "WHERE waitnum > 0 "
			+ "ORDER BY opdate;"

	return postData(MYSQLIPHP, sql)
}

function modelCaseHistory(qn) {
	let sql = "sqlReturnData=SELECT * FROM bookhistory "
			+ "WHERE qn="+ qn +" ORDER BY editdatetime DESC;"

	return postData(MYSQLIPHP, sql)
}

function modelDeleteCase(waitnum, qn) {
	// In database, not actually delete the case but SET waitnum=NULL
	let sql = "sqlReturnbook=UPDATE book SET waitnum=" + waitnum + ", "
			+ "editor='" + user + "' WHERE qn="+ qn + ";"

	return postData(MYSQLIPHP, sql)
}

function modelChangeDate(args) {
	let sql = "sqlReturnbook=UPDATE book SET opdate='" + args.thisDate + "', "
			+ (args.oproom
				? ("oproom='" + args.oproom + "', optime='" + args.optime + "', ")
				: "")
			+ "editor='" + user + "' WHERE qn="+ args.qn + ";"

	return postData(MYSQLIPHP, sql)
}

function modelSaveRoomTime(args) {
	let waitnum = args.waitnum,
		opdate = args.opdate,
		oproom = args.oproom,
		optime = args.optime,
		qn = args.qn,
		sql = qn ? "sqlReturnbook=UPDATE book SET "
					+ "oproom='" + oproom + "', "
					+ "optime='" + optime + "', "
					+ "editor='" + user + "' WHERE qn="+ qn + ";"	
				 : "sqlReturnbook=INSERT INTO book ("
					+ "waitnum, opdate, oproom, optime, editor) VALUES ("
					+ waitnum + ", '" + opdate +"','" + oproom +"','" + optime
					+ "','"+ user +"');"

	return postData(MYSQLIPHP, sql)
}

function modelSaveContent(args) {
	let column = args.column,
		content = args.content,
		qn = args.qn,
		sql = "sqlReturnbook=UPDATE book SET "
				+ column +"='"+ content
				+ "', editor='"+ user
				+ "' WHERE qn="+ qn +";"

	return postData(MYSQLIPHP, sql);
}

function modelSaveNoQN(args) {
	let tableID = args.tableID,
		column = args.column,
		waitnum = args.waitnum,
		opdate = args.opdate,
		oproom = args.oproom,
		optime = args.optime,
		content = args.content,
		staffname = args.staffname,
		$cells = args.$cells,
		qn = args.qn,
		sql = ""

	if (waitnum) {
		sql = (tableID === "queuetbl") && (column !== "staffname")
			? "sqlReturnbook=INSERT INTO book ("
				+ "waitnum,opdate,oproom,optime,staffname," + column + ",qn,editor) VALUES ("
				+ waitnum + ",'" + opdate +"','" + oproom +"','" + optime + "','"
				+ staffname + "','"+ content + "'," + qn + ",'" + user +"');"
			: "sqlReturnbook=INSERT INTO book ("
				+ "waitnum,opdate,oproom,optime," + column + ",qn,editor) VALUES ("
				+ waitnum + ",'" + opdate + "','" + oproom + "','" + optime
				+ "','" + content + "'," + qn + ",'" + user + "');"
	} else {
		// argsold (passed as args) has no waitnum
		sql = "sqlReturnbook=DELETE FROM book WHERE qn=" + qn + ";"
	}

	return postData(MYSQLIPHP, sql);
}

function modelSaveByHN(args) {
	let tableID = args.tableID,
		waitnum = args.waitnum,
		opdate = args.opdate,
		oproom = args.oproom,
		optime = args.optime,
		content = args.content,
		staffname = args.staffname,
		qn = args.qn,
		qnnew = args.qnnew,

	// existing case (with another columns): send the qn
	existedCase = function () {
		return postData(GETNAMEHN, "hn=" + content
			+	"&opdate="+ opdate
			+	"&qn="+ qn
			+	"&username="+ user)
	},

	// new row: send waitnum, oproom, optime, no qn
	// and store waitnum in row title
	newCase = function () {
		return postData(GETNAMEHN, "hn=" + content
			+	"&waitnum="+ waitnum
			+	"&opdate="+ opdate
			+	"&oproom="+ oproom
			+	"&optime="+ optime
			+	((tableID === "queuetbl") ? ("&staffname="+ staffname) : "")
			+	"&username="+ user)
	},

	// redo new case, use previous data *to conform with undo*
	redoNew = function() {
		return postData(MYSQLIPHP, "sqlReturnbook=INSERT INTO book ("
			+ "waitnum,opdate,oproom,optime,staffname,hn,patient,dob,qn,editor) VALUES ("
			+ waitnum + ",'" + opdate +"','" + oproom +"','" + optime + "','"
			+ staffname + "','"+ content + "','" + args.patientnew + "','" + args.dobnew + "',"
			+ qnnew + ",'" + user +"');")
	},

	// redo existed case, revert to new input
	redoExisted = function() {
		return postData(MYSQLIPHP, "sqlReturnbook=UPDATE book SET "
					+ "hn='" + content + "',"
					+ "patient='" + URIcomponent(args.patientnew) + "',"
					+ "dob='" + URIcomponent(args.dobnew) + "',"
					+ "diagnosis='" + URIcomponent(args.diagnosisnew) + "',"
					+ "treatment='" + URIcomponent(args.treatmentnew) + "',"
					+ "contact='" + URIcomponent(args.contactnew)
					+ "' WHERE qn="+ qn + ";")
	},

	// Undo new case = delete from database
	undoNew = function () {
		return postData(MYSQLIPHP, "sqlReturnbook=DELETE FROM book WHERE qn=" + qnnew + ";")
	},

	// Undo existing case with another columns
	undoExisted = function () {
		return postData(MYSQLIPHP, "sqlReturnbook=UPDATE book SET "
					+ "hn='',patient='',dob=null,"
					+ "diagnosis='" + URIcomponent(args.diagnosisold) + "',"
					+ "treatment='" + URIcomponent(args.treatmentold) + "',"
					+ "contact='" + URIcomponent(args.contactold)
					+ "' WHERE qn="+ qnnew + ";")
	}

	//					waitnum	qnnew	qn		content
	// argsnew(blank)		1	  -		 0			1		newCase()
	// argsnew(existed)		-	  -		 1			1		existedCase()
	// argsold(blank)		-	  -		 0			0		undoNew()
	// argsold(existed)		-	  -		 1			0
	// argsreturn			-	  1		 -			-
	// new(blank) + return  1	  1		 0			1		redoNew()
	// new(existed)+return	-	  1		 1			1		redoExisted()
	// old(existed)+return  -	  1		 1			0		undoExisted()
	//	undo:
	//		$.extend(argsold, argsreturn)
	//	redo:
	//		$.extend(argsnew, argsreturn)
	return waitnum
			? qnnew
				? redoNew()
				: newCase()
			: qn
				? qnnew
					? content
						? redoExisted()
						: undoExisted()
					: existedCase()
				: undoNew()
}

function modelGetEquip(qn)	{

	let sql = "sqlReturnData=SELECT editor, editdatetime FROM bookhistory "
			+ "WHERE qn="+ qn + " AND equipment <> '';"

	return postData(MYSQLIPHP, sql)
}

function modelSaveEquip(equipment, qn) {
	let sql = "sqlReturnbook=UPDATE book SET "
			+ "equipment='"+ equipment +"' ,"
			+ "editor='"+ user +"' "
			+ "WHERE qn="+ qn +";"

	return postData(MYSQLIPHP, sql);
}

async function postData(url = ``, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
		body: data
    })
    const text = await response.text()
    try {
        const result = JSON.parse(text)
        return result
    } catch(e) {
        return text
    }
}
