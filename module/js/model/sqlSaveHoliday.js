
import { postData, MYSQLIPHP } from "./fetch.js"

export function sqlSaveHoliday(vdate, vname)
{
  let sql=`sqlReturnData=INSERT INTO holiday (holidate,dayname)
              VALUES('${vdate}','${vname}');
            SELECT * FROM holiday ORDER BY holidate;`

  return postData(MYSQLIPHP, sql)
}

export function sqlDelHoliday(vdate, holidayEng)
{
  let sql=`sqlReturnData=DELETE FROM holiday
              WHERE holidate='${vdate}' AND dayname='${holidayEng}');
            SELECT * FROM holiday ORDER BY holidate;`

  return postData(MYSQLIPHP, sql)
}
