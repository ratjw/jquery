
import {
	OPDATE, STAFFNAME, DIAGNOSIS, TREATMENT, CONTACT, QN
} from "./const.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { STAFF } from "../util/variables.js"
import { URIcomponent } from "../util/util.js"
import { OLDCONTENT } from "../control/edit.js"

// const
export const MYSQLIPHP	= "php/mysqli.php"

const GETNAMEHN	= "php/getnamehn.php"
const SEARCH	= "php/search.php"

export async function postData(url = ``, data) {
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

export function fetchStart() {
	return postData(MYSQLIPHP, "start=''");
}

export function fetchChangeOncall(pointing, opdate, staffname)
{
  let sql = `sqlReturnStaff=INSERT INTO oncall (dateoncall, staffname, edittime)
			 VALUES ('${opdate}','${staffname}',NOW());`

  return postData(MYSQLIPHP, sql);
}

export function fetchdoUpdate()
{
  let sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

  return postData(MYSQLIPHP, sql);
}

export function fetchGetUpdate()
{
  let sql = "nosqlReturnbook="

  return postData(MYSQLIPHP, sql);
}

export function fetchSaveTheatre(allOldCases, allNewCases, theatre, qn)
{
	let sql = "sqlReturnbook=" + updateCasenum(allOldCases)

	allNewCases.forEach((item, i) => {
		sql += item === qn
				? sqlNewTheatre(theatre, i + 1, qn)
				: sqlCaseNum(i + 1, item)
	})

	return postData(MYSQLIPHP, sql);
}

export function fetchSaveOpRoom(allOldCases, allNewCases, content, qn)
{
	let sql = "sqlReturnbook="

	if (allOldCases.length) {
		sql += updateCasenum(allOldCases)
	}

	if (allNewCases.length) {
		for (let i=0; i<allNewCases.length; i++) {
			if (allNewCases[i] === qn) {
				sql += sqlNewRoom(content, i + 1, qn)
			} else {
				sql += sqlCaseNum(i + 1, allNewCases[i])
			}
		}
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveOpTime(allCases, content, qn)
{
	let sql = "sqlReturnbook="

	for (let i=0; i<allCases.length; i++) {
		if (allCases[i] === qn) {
			sql += sqlNewTime(content, i + 1, qn)
		} else {
			sql += sqlCaseNum(i + 1, allCases[i])
		}
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveCaseNum(allCases, content, qn)
{
	let sql = "sqlReturnbook="

	if (content === "") {
		sql += sqlCaseNum(null, qn)
	} else {
		allCases.splice(content - 1, 0, qn)
	}

	allCases.forEach((item, i) => {
		if (item === qn) {
			sql += sqlCaseNum(content, qn)
		} else {
			sql += sqlCaseNum(i + 1, item)
		}
	})

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveContentQN(column, content, qn) {
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql);
}

export function fetchSaveContentNoQN(pointed, column, content) {
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
			VALUES (${waitnum},'${opdate}','${sql2}${content}','${USER}');`

	return postData(MYSQLIPHP, sql);
}

export function fetchMoveCaseHN(pointed, waiting, wanting)
{
	let	sql = `sqlReturnbook=UPDATE book SET deleted=1,editor='${USER}'
				WHERE qn=${waiting.qn};` + sqlCaseHN(pointed, waiting, wanting)

	return postData(MYSQLIPHP, sql);
}

export function fetchCopyCaseHN(pointed, waiting, wanting)
{
	let	sql = "sqlReturnbook=" + sqlCaseHN(pointed, waiting, wanting)

	return postData(MYSQLIPHP, sql);
}

function sqlCaseHN(pointed, waiting, wanting)
{
	let	qn = $(pointed).closest('tr').children("td")[QN].innerHTML

	if (!qn) {
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
		qn = $cells[QN].innerHTML,

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

export function fetchGetNameHN(pointed, content)
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
		waitnum = 0

	// if new case, calculate waitnum
	// store waitnum in row title
	if (!qn) {
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		$row[0].title = waitnum	
	}

	let sql = `hn=${content}
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

export function fetchGetEquip(qn)	{

	let sql = `sqlReturnData=SELECT editor,editdatetime
								FROM bookhistory
								WHERE qn=${qn} AND equipment <> ''
								ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveEquip(equipment, qn) {
	let sql = `sqlReturnbook=UPDATE book
							SET equipment='${equipment}',
								editor='${USER}'
							WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql);
}

export function fetchCancelAllEquip(qn)
{
	sql = `sqlReturnbook=UPDATE book SET equipment='',editor='${USER}' WHERE qn='${qn}';`

	return postData(MYSQLIPHP, sql)
}

export function fetchSortable(arg)
{
	let allOldCases = arg.movelist,
		allNewCases = arg.newlist,
		newWaitnum = arg.waitnum,
		thisOpdate = arg.opdate,
		thisroom = arg.room,
		moveqn = arg.qn,
		sql = "sqlReturnbook="

	if (allOldCases.length) {
		sql += updateCasenum(allOldCases)
	}

	if (allNewCases.length) {
		for (let i=0; i<allNewCases.length; i++) {
			sql += (allNewCases[i] === moveqn)
				? sqlMover(newWaitnum, thisOpdate, thisroom, i + 1, moveqn)
				: sqlCaseNum(i + 1, allNewCases[i])
		}
	} else {
		sql += sqlMover(newWaitnum, thisOpdate, null, null, moveqn)
	}

	if (!allOldCases.length && !allNewCases.length) {
		sql += sqlMover(newWaitnum, thisOpdate, null, null, moveqn)
	}

	return postData(MYSQLIPHP, sql);
}

export function fetchSearchDB(hn, staffname, others) {
	let sql = `hn=${hn}&staffname=${staffname}&others=${others}`

	return postData(SEARCH, sql)
}

export function fetchUndelete(allCases, qn, del) {
    let sql = "sqlReturnbook="

    allCases.forEach((item, i) => {
      sql += item === qn
          ? `UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`
          : sqlCaseNum(i + 1, item)
    })

	return postData(MYSQLIPHP, sql);
}

export function fetchAllDeletedCases() {
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

export function fetchAllCases() {
	let sql = `sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;`

	return postData(MYSQLIPHP, sql)
}

export function fetchCaseHistory(hn) {
	let sql = `sqlReturnData=SELECT * FROM bookhistory 
				WHERE qn in (SELECT qn FROM book WHERE hn='${hn}') 
				ORDER BY editdatetime DESC;`

	return postData(MYSQLIPHP, sql)
}

// In database, not actually delete the case but SET deleted=1
export function fetchDeleteCase(allCases, qn, del) {
	let sql = `sqlReturnbook=UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		if (del) { allCases = allCases.filter(e !== qn) }
		sql += updateCasenum(allCases)
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchPostponeCase(allCases, waitnum, thisdate, qn) {
	let sql = `sqlReturnbook=UPDATE book SET opdate='${thisdate}',
				waitnum=${waitnum},theatre='',oproom=null,casenum=null,
				optime='',editor='${USER}' WHERE qn=${qn};`

	if (allCases.length) {
		sql += updateCasenum(allCases.filter(e !== qn))
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchmoveCase(allOldCases, allNewCases, waitnum, thisdate, room, qn) {
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

export function fetchDoadddata()
{
	let vname = document.getElementById("sname").value
	let vspecialty = document.getElementById("scbb").value
	let vdate = document.getElementById("sdate").value
	let vnum = Math.max.apply(Math, STAFF.map(staff => staff.number)) + 1
	let sql = `sqlReturnStaff=INSERT INTO staff (number,staffname,specialty)
				VALUES(${vnum},'${vname}','${vspecialty}');`

	return postData(MYSQLIPHP, sql)
}

export function fetchDoupdatedata()
{
    let vname = document.getElementById("sname").value
    let vspecialty = document.getElementById("scbb").value
    let vdate = document.getElementById("sdate").value
    let vshidden = document.getElementById("shidden").value
    let sql = `sqlReturnStaff=UPDATE staff SET staffname='${vname}',
				specialty='${vspecialty}' WHERE number=${vshidden};`

	return postData(MYSQLIPHP, sql)
}

export function fetchDodeletedata()
{
    let vshidden = document.getElementById("shidden").value
	let sql = `sqlReturnStaff=DELETE FROM staff WHERE number=${vshidden};`

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveOnChange(column, content, qn)
{
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${URIcomponent(content)}',editor='${USER}'
				WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql)
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
	if (oproom === "") {
		return `UPDATE book SET oproom=null,casenum=null,editor='${USER}' WHERE qn=${qn};`
	}
	
	return `UPDATE book SET oproom=${oproom},casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

function sqlNewTime(optime, casenum, qn)
{
	return `UPDATE book SET optime=${optime},casenum=${casenum},editor='${USER}' WHERE qn=${qn};`
}

export function fetchSaveHoliday(vdate, vname)
{
	let sql = `sqlReturnData=INSERT INTO holiday (holidate,dayname) VALUES('${vdate}','${vname}');
							  SELECT * FROM holiday ORDER BY holidate;`

	return postData(MYSQLIPHP, sql)
}

export function fetchDelHoliday(vdate, holidayEng)
{
	let sql = `sqlReturnData=DELETE FROM holiday WHERE holidate='${vdate}' AND dayname='${holidayEng}');
							  SELECT * FROM holiday ORDER BY holidate;`

	return postData(MYSQLIPHP, sql)
}
