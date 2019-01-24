
import { postData, MYSQLIPHP } from "./fetch.js"
import {
	OPDATE, STAFFNAME, DIAGNOSIS, TREATMENT, CONTACT, QN
} from "./const.js"
import { USER } from "../main.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { URIcomponent } from "../util/util.js"

const GETNAMEHN	= "php/getnamehn.php"

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

	let sql = `hn=${content}\
				&waitnum=${waitnum}\
				&opdate=${opdate}\
				&staffname=${staffname}\
				&diagnosis=${diagnosis}\
				&treatment=${treatment}\
				&contact=${contact}\
				&qn=${qn}\
				&editor=${USER}`

	return postData(GETNAMEHN, sql)
}
