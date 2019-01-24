
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { STAFF } from "../util/variables.js"

const SEARCH	= "php/search.php"

export function fetchSearchDB(hn, staffname, others) {
	let sql = `hn=${hn}&staffname=${staffname}&others=${others}`

	return postData(SEARCH, sql)
}

export function fetchUndelete(allCases, oproom, qn, del) {
  let sql = "sqlReturnbook="

  allCases.forEach((item, i) => {
    if (item === qn) {
      sql += `UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`
    } else {
      if (oproom) {
        sql += sqlCaseNum(i + 1, item)
      }
    }
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
                ORDER BY editdatetime DESC;`

  return postData(MYSQLIPHP, sql)
}

export function fetchCaseAll() {
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
export function fetchDeleteCase(allCases, oproom, qn, del) {
	let sql = `sqlReturnbook=UPDATE book SET deleted=${del},editor='${USER}' WHERE qn=${qn};`

	if (allCases.length && oproom) {
		if (del) { allCases = allCases.filter(e !== qn) }
		sql += updateCasenum(allCases)
	}

	return postData(MYSQLIPHP, sql)
}

export function fetchDoadddata()
{
	let vname = document.getElementById("sname").value
	let vspecialty = document.getElementById("specialty").value
	let vdate = document.getElementById("soncall").value
	let vnum = Math.max.apply(Math, STAFF.map(staff => staff.number)) + 1
	let sql = `sqlReturnStaff=INSERT INTO staff (number,staffname,specialty)
				VALUES(${vnum},'${vname}','${vspecialty}');`

	return postData(MYSQLIPHP, sql)
}

export function fetchDoupdatedata()
{
    let vname = document.getElementById("sname").value
    let vspecialty = document.getElementById("specialty").value
    let vdate = document.getElementById("soncall").value
    let vsnumber = document.getElementById("snumber").value
    let sql = `sqlReturnStaff=UPDATE staff SET staffname='${vname}',
				specialty='${vspecialty}' WHERE number=${vsnumber};`

	return postData(MYSQLIPHP, sql)
}

export function fetchDodeletedata()
{
    let vsnumber = document.getElementById("snumber").value
	let sql = `sqlReturnStaff=DELETE FROM staff WHERE number=${vsnumber};`

	return postData(MYSQLIPHP, sql)
}

export function fetchSaveHoliday(vdate, vname)
{
  let sql=`sqlReturnData=INSERT INTO holiday (holidate,dayname)
							VALUES('${vdate}','${vname}');
						  SELECT * FROM holiday ORDER BY holidate;`

  return postData(MYSQLIPHP, sql)
}

export function fetchDelHoliday(vdate, holidayEng)
{
  let sql=`sqlReturnData=DELETE FROM holiday
						  WHERE holidate='${vdate}' AND dayname='${holidayEng}');
						 SELECT * FROM holiday ORDER BY holidate;`

  return postData(MYSQLIPHP, sql)
}
