
const STAFF 		= [	"อ.เอก",
						"อ.อัตถพร", 
						"อ.สรยุทธ", 
						"อ.วัฒนา", 
						"อ.เกรียงศักดิ์", 
						"อ.พีรพงศ์"
					];

const GETNAMEHN		= "php/getnamehn.php";
const GETIPD		= "php/getipd.php";
const MYSQLIPHP		= "php/mysqli.php";
const CHECKPAC		= "php/checkpac.php";

//tbl, queuetbl
const OPDATE		= 0;
const ROOMTIME		= 1;
const STAFFNAME		= 2;
const HN			= 3;
const NAME			= 4;
const DIAGNOSIS		= 5;
const TREATMENT		= 6;
const CONTACT		= 7;
const QN			= 8;

//servicetbl
const CASENUM		= 0;
const SHN			= 1;
const SNAME			= 2;
const SDIAGNOSIS	= 3;
const STREATMENT	= 4;
const ADMISSION		= 5;
const FINAL			= 6;
const ADMIT			= 7;
const DISCHARGE		= 8;
const SQN			= 9;

//historytbl
const HEDITDATETIME	= 0;
const HOPDATE		= 1;
const HSTAFFNAME	= 2;	//used in undelete
const HHN			= 3;
const HPATIENT		= 4;
const HDIAGNOSIS	= 5;
const HTREATMENT	= 6;
const HCONTACT		= 7;
const HEDITOR		= 8;
const HQN			= 9;	//used in undelete

const EDITABLE 		= [HN, DIAGNOSIS, TREATMENT, CONTACT];
const SEDITABLE		= [SDIAGNOSIS, STREATMENT, ADMISSION, FINAL]

const NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
const DAYOFTHAINAME	= {"อาทิตย์":0, "จันทร์":1, "อังคาร":2, "พุธ":3, "พฤหัส":4, "ศุกร์":5, "เสาร์":6};

//use for row color
const NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
const NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const NUMMONTH		= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};

const TRIMHTML		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
const HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

const ISODATE		= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/
const THAIDATE		= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/
const SHORTDATE		= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/

const ISODATEG		= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/g
const THAIDATEG		= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/g
const SHORTDATEG	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/g

const LARGESTDATE	= "9999-12-31";
const ORSURG 		= "XSU";
const ORNEURO 		= "4"
const ORTIME 		= "09.00"
