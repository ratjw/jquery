
import { postData, MYSQLIPHP } from "./fetch.js"
import { URIcomponent } from "../util/util.js"

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

export function fetchSaveOnChange(column, content, qn)
{
	let sql = `sqlReturnbook=UPDATE book
				SET ${column}='${URIcomponent(content)}',editor='${USER}'
				WHERE qn=${qn};`

	return postData(MYSQLIPHP, sql)
}
