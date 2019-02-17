
import { postData, MYSQLIPHP } from "./fetch.js"

export function sqlDoAddStaff()
{
  let vname = document.getElementById("sname").value
  let vspecialty = document.getElementById("specialty").value
  let vdate = document.getElementById("soncall").value
  let vnum = Math.max.apply(Math, STAFF.map(staff => staff.number)) + 1
  let sql = `sqlReturnStaff=INSERT INTO staff (number,staffname,specialty)
             VALUES(${vnum},'${vname}','${vspecialty}');`

  return postData(MYSQLIPHP, sql)
}

export function sqlDoUpdateStaff()
{
    let vname = document.getElementById("sname").value
    let vspecialty = document.getElementById("specialty").value
    let vdate = document.getElementById("soncall").value
    let vsnumber = document.getElementById("snumber").value
    let sql = `sqlReturnStaff=UPDATE staff SET staffname='${vname}',
               specialty='${vspecialty}' WHERE number=${vsnumber};`

  return postData(MYSQLIPHP, sql)
}

export function sqlDoDeleteStaff()
{
    let vsnumber = document.getElementById("snumber").value
  let sql = `sqlReturnStaff=DELETE FROM staff WHERE number=${vsnumber};`

  return postData(MYSQLIPHP, sql)
}
