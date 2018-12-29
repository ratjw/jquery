
import { QN, LARGESTDATE } from "./const.js"
import { USER } from "../main.js"
import { URIcomponent } from "./util.js"

// const
const GETIPD	= "php/getipd.php",
	GETNAMEHN	= "php/getnamehn.php",
	MYSQLIPHP	= "php/mysqli.php",
	SEARCH		= "php/search.php",
	LINEBOT		= "line/lineBot.php",
	LINENOTIFY	= "line/lineNotify.php"

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

export function modelStart() {
	return postData(MYSQLIPHP, "start=''");
}

export function modelIdling(timestamp) {
	let sql = `functionName=checkupdate&time=${timestamp}`

	return postData(MYSQLIPHP, sql);
}

export function modelChangeOncall(pointing, opdate, staffname)
{
  let sql = `sqlReturnStaff=INSERT INTO oncall (dateoncall, staffname, edittime)
			 VALUES ('${opdate}','${staffname}',NOW());`

  return postData(MYSQLIPHP, sql);
}

export function modeldoUpdate()
{
  let sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

  return postData(MYSQLIPHP, sql);
}

export function modelGetUpdate(fromDate, toDate)
{
  let sql

  if (fromDate) {
	  sql = "sqlReturnService=" + sqlOneMonth(fromDate, toDate)
  } else {
	  sql = "nosqlReturnbook="
  }
  return postData(MYSQLIPHP, sql);
}

export function modelSaveTheatre(allOldCases, allNewCases, theatre, qn)
{
	let sql = "sqlReturnbook=" + updateCasenum(allOldCases)

	allNewCases.forEach((item, i) => {
		sql += item === qn
				? sqlNewTheatre(theatre, i + 1, qn)
				: sqlCaseNum(i + 1, item)
	})

	return postData(MYSQLIPHP, sql);
}

export function modelSaveOpRoom(allOldCases, allNewCases, newcontent, qn)
{
	let sql = "sqlReturnbook="

	if (allOldCases.length) {
		sql += updateCasenum(allOldCases)

		if (newcontent === "") {
			sql += sqlNewRoom(null, null, qn)
		}
	}

	if (allNewCases.length) {
		for (let i=0; i<allNewCases.length; i++) {
			if (allNewCases[i] === qn) {
				sql += sqlNewRoom(newcontent, i + 1, qn)
			} else {
				sql += sqlCaseNum(i + 1, allNewCases[i])
			}
		}
	}

	return postData(MYSQLIPHP, sql)
}

export function modelSaveCaseNum(allCases, newcontent)
{
	let sql = "sqlReturnbook="

	if (newcontent === "") {
		sql += sqlCaseNum(null, qn)
	} else {
		allCases.splice(newcontent - 1, 0, qn)
	}

	allCases.forEach((item, i) => {
		if (item === qn) {
			sql += sqlCaseNum(newcontent, qn)
		} else {
			sql += sqlCaseNum(i + 1, item)
		}
	})

	return postData(MYSQLIPHP, sql)
}

export function modelSaveContentQN(column, content, qn) {
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql);
}

export function modelSaveContentNoQN(pointed, column, newcontent) {
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		titlename = $('#titlename').html(),
		sql1 = "",
		sql2 = "",
		sql,
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		// new case, calculate waitnum

	// store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		sql1 = "staffname, "
		sql2 = staffname + "','"
	}

	sql = `sqlReturnbook=INSERT INTO book (waitnum,opdate,${sql1}${column},editor)
			VALUES (${waitnum},'${opdate}','${sql2}${newcontent}','${USER}');`

	return postData(MYSQLIPHP, sql);
}

export function modelMoveCaseHN(pointed, waiting, wanting)
{
	let	sql = `sqlReturnbook=UPDATE book SET deleted=1,editor='${USER}'
				WHERE qn=${waiting.qn};` + sqlCaseHN(pointed, waiting, wanting)

	return postData(MYSQLIPHP, sql);
}

export function modelCopyCaseHN(qn)
{
	let	sql = "sqlReturnbook=" + sqlCaseHN()

	return postData(MYSQLIPHP, sql);
}

function sqlCaseHN(pointed, waiting, wanting)
{
	if (noqn) {
		return sqlInsertHN(pointed, waiting, wanting)
	} else {
		return sqlUpdateHN(pointed, waiting, wanting)
	}
}

function sqlInsertHN(pointed, waiting, wanting)
{
	let	$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),

		hn = waiting.hn,
		patient = waiting.patient,
		dob = waiting.dob

	// new row, calculate waitnum
	// store waitnum in row title
	let waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
	$row[0].title = waitnum

	return `INSERT INTO book
		(waitnum,opdate,hn,patient,dob,staffname,diagnosis,treatment,contact,editor)
		VALUES (${waitnum},'${opdate}','${hn}','${patient}','${dob}',
		'${wanting.staffname}','${URIcomponent(wanting.diagnosis)}',
		'${URIcomponent(wanting.treatment)}','${URIcomponent(wanting.contact)}',
		'${USER}');`
}

function sqlUpdateHN(pointed, waiting, wanting)
{
	let	$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		qn = $cells[QN].innerHTML,
		noqn = !qn,

		hn = waiting.hn,
		patient = waiting.patient,
		dob = waiting.dob

	return `UPDATE book
		SET hn='${hn}',
			patient='${patient}',
			dob='${dob}',
			staffname='${wanting.staffname}',
			diagnosis='${URIcomponent(wanting.diagnosis)}',
			treatment='${URIcomponent(wanting.treatment)}',
			contact='${URIcomponent(wanting.contact)}',
			editor='${USER}'
		WHERE qn=${qn};`
}

export function modelGetNameHN(pointed, content)
{
	let tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		cellindex = pointed.cellIndex,
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		diagnosis = $cells[DIAGNOSIS].innerHTML,
		treatment = $cells[TREATMENT].innerHTML,
		contact = $cells[CONTACT].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,
		oldcontent = getOldcontent(),
		waitnum = 0,
		sql = ""

	// if new case, calculate waitnum
	// store waitnum in row title
	if (noqn) {
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		$row[0].title = waitnum	
	}

	sql = `hn=${content}
			&waitnum=${waitnum}
			&opdate=${opdate}
			&staffname=${staffname}
			&diagnosis=${diagnosis}
			&treatment=${treatment}
			&contact=${contact}
			&qn=${qn}
			&editor=${USER}`

	return postData(GETNAMEHN, sql)
}

export function modelGetEquip(qn)	{

	let sql = `sqlReturnData=SELECT editor,editdatetime
								FROM bookhistory
								WHERE qn=${qn} AND equipment <> ''
								ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

export function modelSaveEquip(equipment, qn) {
	let sql = `sqlReturnbook=UPDATE book
							SET equipment='${equipment}',
								editor='${USER}'
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql);
}

export function modelCancelAllEquip(qn)
{
	sql = `sqlReturnbook=UPDATE book SET equipment='',editor='${USER}' WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql)
}

export function modelSortable(arg)
{
	let allOldCases = arg.oldlist,
		allNewCases = arg.newlist,
		newWaitnum = arg.waitnum,
		thisOpdate = arg.opdate,
		thisroom = arg.room,
		oldqn = arg.qn,
		sql = "sqlReturnbook="

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

export function modelSearchDB(hn, staffname, others) {
	let sql = `hn=${hn}&staffname=${staffname}&others=${others}`

	return postData(SEARCH, sql)
}

export function modelUndelete(allCases, qn, del) {
    let sql = "sqlReturnbook="

    allCases.forEach((item, i) => {
      sql += item === qn
          ? `UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`
          : sqlCaseNum(i + 1, item)
    })

	return postData(MYSQLIPHP, sql);
}

export function modelAllDeletedCases() {
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

export function modelAllCases() {
	let sql = `sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;`

	return postData(MYSQLIPHP, sql)
}

export function modelCaseHistory(hn) {
	let sql = `sqlReturnData=SELECT * FROM bookhistory 
				WHERE qn in (SELECT qn FROM book WHERE hn='${hn}') 
				ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

// In database, not actually delete the case but SET deleted=1
export function modelDeleteCase(allCases, qn, del) {
	let sql = `sqlReturnbook=UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		if (del) { allCases = allCases.filter(e !== qn) }
		sql += updateCasenum(allCases)
	}

	return postData(MYSQLIPHP, sql)
}

export function modelPostponeCase(allCases, waitnum, thisdate, qn) {
	let sql = `sqlReturnbook=UPDATE book SET opdate='${thisdate}',
				waitnum=${waitnum},theatre='',oproom=null,casenum=null,
				optime='',editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		sql += updateCasenum(allCases.filter(e !== qn))
	}

	return postData(MYSQLIPHP, sql)
}

export function modelChangeDate(allOldCases, allNewCases, waitnum, thisdate, room, qn) {
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

export function modelDoadddata()
{
	let vname = document.getElementById("sname").value
	let vspecialty = document.getElementById("scbb").value
	let vdate = document.getElementById("sdate").value
	let vnum = Math.max.apply(Math, getSTAFF().map(staff => staff.number)) + 1
	let sql = `sqlReturnStaff=INSERT INTO staff (number,staffname,specialty)
				VALUES(${vnum},'${vname}','${vspecialty}');`

	return postData(MYSQLIPHP, sql)
}

export function modelDoupdatedata()
{
    let vname = document.getElementById("sname").value
    let vspecialty = document.getElementById("scbb").value
    let vdate = document.getElementById("sdate").value
    let vshidden = document.getElementById("shidden").value
    let sql = `sqlReturnStaff=UPDATE staff SET staffname='${vname}',
				specialty='${vspecialty}' WHERE number=${vshidden};`

	return postData(MYSQLIPHP, sql)
}

export function modelDodeletedata()
{
    let vshidden = document.getElementById("shidden").value
	let sql = `sqlReturnStaff=DELETE FROM staff WHERE number=${vshidden};`

	return postData(MYSQLIPHP, sql)
}

export function modelSaveOnChange(column, content, qn)
{
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${URIcomponent(content)}',editor='${USER}'
				WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql)
}

export function modelSaveOnChangeService(column, content, qn)
{
	let sql = sqlColumn(column, URIcomponent(content), qn),
		fromDate = $("#monthstart").val(),
		toDate = $("#monthpicker").val()

	sql  += sqlOneMonth(fromDate, toDate)

	return postData(MYSQLIPHP, sql)
}

export function modelGetServiceOneMonth(fromDate, toDate) {
	let sql = "sqlReturnData=" + sqlOneMonth(fromDate, toDate)

	return postData(MYSQLIPHP, sql)
}

export function modelGetIPD(fromDate, toDate) {
	let sql = `from=${fromDate}&to=${toDate}&sql=` + sqlOneMonth(fromDate, toDate)

	return postData(GETIPD, sql)
}

export function modelSaveService(pointed, column, content, qn, fromDate, toDate) {
	let sql = "sqlReturnService="
	
	if (column) {
		sql += sqlItem(column, content, qn)
	} else {
		sql += sqlRecord(pointed, content, qn)
	}

	sql	+= sqlOneMonth(fromDate, toDate)

	return postData(MYSQLIPHP, sql);
}

function sqlNewTheatre(theatre, casenum, qn)
{
	return `UPDATE book
				SET theatre='${theatre}',casenum=${casenum},editor='${USER}'
				WHERE qn=${qn};`
}

function updateCasenum(allCases)
{
	let sql = ""
	allCases.forEach((item, i) => {
		sql += sqlCaseNum(i + 1, item)
	})
	return sql
}

function sqlCaseNum(casenum, qn)
{	
  return `UPDATE book SET casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

function sqlMover(waitnum, opdate, oproom, casenum, qn)
{
  return `UPDATE book SET waitnum=${waitnum},opdate='${opdate}',oproom=${oproom},
			casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

function sqlNewRoom(oproom, casenum, qn)
{
	return `UPDATE book SET oproom=${oproom},casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

function sqlOneMonth(fromDate, toDate)
{
	return `SELECT b.* FROM book b left join staff s on b.staffname=s.staffname
			WHERE opdate BETWEEN '${fromDate}' AND '${toDate}'
				AND deleted=0
				AND waitnum<>0
				AND hn
			ORDER BY s.number,opdate,oproom,casenum,waitnum;`
}

function sqlRecord(pointing, setRecord, qn)
{
	let sql = ""

	$.each(setRecord, function(column, content) {
		if (column === "disease" && content === "No") {
			sql += sqlDefaults(qn)			
		}
		sql += sqlItem(column, content, qn)
	})

	return sql
}

function sqlColumn(column, content, qn)
{
	return "sqlReturnService=" + sqlItem(column, content, qn)
}

function sqlDefaults(qn)
{
  return `UPDATE book
			SET operated='',doneby='',scale='',manner='',editor='${USER}'
			WHERE qn=${qn};`
}

function sqlItem(column, content, qn)
{
  return `UPDATE book SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`
}
