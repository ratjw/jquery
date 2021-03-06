
import { postData, MYSQLIPHP } from "./fetch.js"
import { URIcomponent } from "../util/util.js"
import { USER } from "../main.js"

export function sqlStart() {
  return postData(MYSQLIPHP, "start=''");
}

export function sqlChangeOncall(pointing, opdate, staffname)
{
  let sql = `sqlReturnStaff=INSERT INTO oncall (dateoncall, staffname, edittime) VALUES ('${opdate}','${staffname}',NOW());`

  return postData(MYSQLIPHP, sql);
}

export function sqldoUpdate()
{
  let sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

  return postData(MYSQLIPHP, sql);
}

export function sqlGetUpdate()
{
  let sql = "nosqlReturnbook="

  return postData(MYSQLIPHP, sql);
}

export function sqlSaveOnChange(column, content, qn)
{
  let sql = `sqlReturnbook=UPDATE book SET ${column}='${URIcomponent(content)}',editor='${USER}' WHERE qn=${qn};`

  return postData(MYSQLIPHP, sql)
}
