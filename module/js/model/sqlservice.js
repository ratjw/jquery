
import { postData, MYSQLIPHP } from "./fetch.js"
import { USER } from "../main.js"
import { URIcomponent } from "../util/util.js"
import { serviceFromDate, serviceToDate } from "../service/setSERVICE.js"

const GETIPD  = "php/getipd.php"

export function sqlSaveOnChangeService(column, content, qn)
{
  let sql = sqlColumn(column, URIcomponent(content), qn)
      + sqlOneMonth()

  return postData(MYSQLIPHP, sql)
}

export function sqlGetServiceOneMonth() {
  let sql = "sqlReturnData=" + sqlOneMonth()

  return postData(MYSQLIPHP, sql)
}

export function sqlGetIPD() {
  let sql = `from=${serviceFromDate}&to=${serviceToDate}&sql=` + sqlOneMonth()

  return postData(GETIPD, sql)
}

export function sqlSaveService(pointed, column, content, qn) {
  let sql = "sqlReturnService="
  
  if (column) {
    sql += sqlItem(column, content, qn)
  } else {
    sql += sqlRecord(pointed, content, qn)
  }

  sql  += sqlOneMonth()

  return postData(MYSQLIPHP, sql);
}

export function sqlGetUpdateService()
{
  let sql = "sqlReturnService=" + sqlOneMonth()

  return postData(MYSQLIPHP, sql);
}

function sqlOneMonth()
{
  return `SELECT b.* FROM book b left join staff s on b.staffname=s.staffname
          WHERE opdate BETWEEN '${serviceFromDate}' AND '${serviceToDate}'
            AND deleted=0
            AND waitnum<>0
            AND hn
          ORDER BY s.number,opdate,oproom,casenum,waitnum;`
}

function sqlRecord(pointing, setRecord, qn)
{
  let sql = ""

  $.each(setRecord, function(column, content) {
    if (column === "disease" && content === "") {
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
          SET doneby='',scale='',manner='',editor='${USER}'
          WHERE qn=${qn};`
}

function sqlItem(column, content, qn)
{
  return `UPDATE book SET ${column}='${content}',editor='${USER}' WHERE qn=${qn};`
}
