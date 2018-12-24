
import { QN, LARGESTDATE } from "./const.js"
import { USER } from "./main.js"
import { URIcomponent } from "./util.js"

export {
	modelSaveRoomTime, modelSaveContent, modelSaveNoQN, modelSaveByHN,
	modelChangeOncall, modelGetEquip, modelSaveEquip, modelChangeDate, modelAllCases,
	modelDeleteCase, modelCaseHistory, modelAllDeletedCases, modelUndelete, modelFind, 
	modelGetServiceOneMonth, modelGetIPD, modelSaveService, modelStart, modelIdling,
	modeldoUpdate, modelGetUpdate, modelSortable, modelSyncServer, modelFindLatestEntry
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
	let sql = `functionName=checkupdate&time=${timestamp}`

	return postData(MYSQLIPHP, sql);
}

function modelChangeOncall(pointing, opdate, staffname)
{
  let sql = "sqlReturnStaff=INSERT INTO oncall "
      + "(dateoncall, staffname, edittime) "
      + "VALUES ('" + opdate
      + "','" + staffname
      + "',NOW());"

  return postData(MYSQLIPHP, sql);
}

function modeldoUpdate()
{
  let sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

  return postData(MYSQLIPHP, sql);
}

function modelGetUpdate(fromDate, toDate)
{
  let sql

  if (fromDate) {
	  sql = "sqlReturnService=" + sqlOneMonth(fromDate, toDate)
  } else {
	  sql = "nosqlReturnbook="
  }
  return postData(MYSQLIPHP, sql);
}

function modelSortable(arg)
{
	let allOldCases = arg.oldlist,
		allNewCases = arg.newlist,
		newWaitnum = arg.waitnum,
		thisOpdate = arg.opdate,
		thisroom = arg.room,
		oldqn = arg.qn,
		sql = "sqlReturnbook="

	// sameDateRoomTableQN is of tbl only, the mover must be removed manually
	if (allOldCases.length) {
		sql += updateCasenum(allOldCases)
	}

	if (allNewCases.length) {
		for (let i=0; i<allNewCases.length; i++) {
			sql += (allNewCases[i] === oldqn)
				? sqlMover(newWaitnum, thisOpdate, thisroom, i + 1, oldqn)
				: sqlCaseNum(i + 1, allNewCases[i])
		}
	} else {
		sql += sqlMover(newWaitnum, thisOpdate, null, null, oldqn)
	}

	if (!allOldCases.length && !allNewCases.length) {
		sql += sqlMover(newWaitnum, thisOpdate, null, null, oldqn)
	}

	return postData(MYSQLIPHP, sql);
}

function updateCasenum(allCases)
{
	let sql = ""
	for (let i=0; i<allCases.length; i++) {
		sql += sqlCaseNum(i + 1, allCases[i])
	}
	return sql
}

function sqlCaseNum(casenum, qn)
{	
  return "UPDATE book SET "
		+  "casenum=" + casenum
		+  ",editor='" + USER
		+  "' WHERE qn="+ qn + ";";
}

function sqlMover(waitnum, opdate, oproom, casenum, qn)
{
  return "UPDATE book SET "
		+  "waitnum=" + waitnum
		+  ", opdate='" + opdate
		+  "',oproom=" + oproom
		+  ",casenum=" + casenum
		+  ",editor='" + USER
		+  "' WHERE qn="+ qn + ";";
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

function modelGetServiceOneMonth(fromDate, toDate) {
	let sql = "sqlReturnData=" + sqlOneMonth(fromDate, toDate)

	return postData(MYSQLIPHP, sql)
}

function modelGetIPD(fromDate, toDate) {
	let sql = "from=" + fromDate
			+ "&to=" + toDate
			+ "&sql=" + sqlOneMonth(fromDate, toDate)

	return postData(GETIPD, sql)
}

function modelSaveService(column, content, qn, fromDate, toDate) {
	let sql = "sqlReturnService=" + sqlItem(column, content, qn) + sqlOneMonth(fromDate, toDate)

	return postData(MYSQLIPHP, sql);
}

function sqlOneMonth(fromDate, toDate)
{
	return "SELECT b.* FROM book b left join staff s on b.staffname=s.staffname "
		  + "WHERE opdate BETWEEN '" + fromDate + "' AND '" + toDate
		  + "' AND deleted=0 "
		  + "AND waitnum<>0 "
		  + "AND hn "
		  + "ORDER BY s.number,opdate,oproom,casenum,waitnum;";
}

function sqlDefaults(qn)
{
  return "UPDATE book SET "
		+ "operated='',"
		+ "doneby='',"
		+ "scale='',"
		+ "manner='',"
		+ "editor='" + USER
		+ "' WHERE qn=" + qn + ";"
}

function sqlItem(column, content, qn)
{
  return "UPDATE book SET "
		+ column + "='" + content
		+ "',editor='" + USER
		+ "' WHERE qn=" + qn + ";"
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

function modelUndelete(allCases, qn, del) {
    let sql = "sqlReturnbook="

    allCases.forEach((item, i) => {
      sql += item === qn
          ? `UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`
          : sqlCaseNum(i + 1, item)
    })

	return postData(MYSQLIPHP, sql);
}

function modelAllDeletedCases() {
  let sql = `sqlReturnData=SELECT editdatetime, b.* 
                             FROM book b 
							   LEFT JOIN bookhistory bh ON b.qn = bh.qn 
                             WHERE editdatetime>DATE_ADD(NOW(), INTERVAL -3 MONTH) 
							   AND b.deleted>0 
							   AND bh.action='delete' 
							 GROUP BY b.qn 
                             ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

function modelAllCases() {
	let sql = `sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;`

	return postData(MYSQLIPHP, sql)
}

function modelCaseHistory(hn) {
	let sql = `sqlReturnData=SELECT * FROM bookhistory 
				WHERE qn in (SELECT qn FROM book WHERE hn='${hn}') 
				ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

// In database, not actually delete the case but SET deleted=1
function modelDeleteCase(allCases, qn, del) {
	let sql = `sqlReturnbook=UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		if (del) {
			index = allCases.indexOf(qn)
			allCases.splice(index, 1)
		}
		sql += updateCasenum(allCases)
	}

	return postData(MYSQLIPHP, sql)
}

function modelPosttponeCase(allCases, waitnum, thisdate, qn) {
	let sql = `sqlReturnbook=UPDATE book SET opdate='${thisDate}',
				waitnum=${waitnum},theatre='',oproom=null,casenum=null,
				optime='',editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)
		sql += updateCasenum(allCases)
	}

	return postData(MYSQLIPHP, sql)
}

function modelChangeDate(allOldCases, allNewCases, waitnum, thisdate, room, qn) {
	let sql = "sqlReturnbook=" + updateCasenum(allOldCases)

	for (let i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === qn) {
			let casenum = room? (i + 1) : null
			sql += sqlMover(waitnum, thisdate, room || null, casenum, qn)
		} else {
			sql += sqlCaseNum(i + 1, allNewCases[i])
		}
	}

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
					+ "editor='" + USER + "' WHERE qn="+ qn + ";"	
				 : "sqlReturnbook=INSERT INTO book ("
					+ "waitnum, opdate, oproom, optime, editor) VALUES ("
					+ waitnum + ", '" + opdate +"','" + oproom +"','" + optime
					+ "','"+ USER +"');"

	return postData(MYSQLIPHP, sql)
}

function modelSaveContent(args) {
	let column = args.column,
		content = args.content,
		qn = args.qn,
		sql = "sqlReturnbook=UPDATE book SET "
				+ column +"='"+ content
				+ "', editor='"+ USER
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
				+ staffname + "','"+ content + "'," + qn + ",'" + USER +"');"
			: "sqlReturnbook=INSERT INTO book ("
				+ "waitnum,opdate,oproom,optime," + column + ",qn,editor) VALUES ("
				+ waitnum + ",'" + opdate + "','" + oproom + "','" + optime
				+ "','" + content + "'," + qn + ",'" + USER + "');"
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
			+	"&username="+ USER)
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
			+	"&username="+ USER)
	},

	// redo new case, use previous data *to conform with undo*
	redoNew = function() {
		return postData(MYSQLIPHP, "sqlReturnbook=INSERT INTO book ("
			+ "waitnum,opdate,oproom,optime,staffname,hn,patient,dob,qn,editor) VALUES ("
			+ waitnum + ",'" + opdate +"','" + oproom +"','" + optime + "','"
			+ staffname + "','"+ content + "','" + args.patientnew + "','" + args.dobnew + "',"
			+ qnnew + ",'" + USER +"');")
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

	let sql = `sqlReturnData=SELECT editor,editdatetime
								FROM bookhistory
								WHERE qn=${qn} AND equipment <> ''
								ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

function modelSaveEquip(equipment, qn) {
	let sql = `sqlReturnbook=UPDATE book
							SET equipment='${equipment}',
								editor='${USER}'
							WHERE qn='${qn}';`

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
