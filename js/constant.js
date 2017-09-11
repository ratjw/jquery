
const STAFF 		= [	"อ.เอก",
						"อ.อัตถพร", 
						"อ.สรยุทธ", 
						"อ.วัฒนา", 
						"อ.เกรียงศักดิ์", 
						"อ.พีรพงศ์"
					];

const MYSQLIPHP		= "php/mysqli.php";

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

//use for row color
const NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
const NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const NUMMONTH		= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};

const LARGESTDATE	= "9999-12-31";
