var GETNAMEHN		= "php/getnamehn.php";
var MYSQLIPHP		= "php/mysqli.php";
var CHECKPAC		= "php/checkpac.php";

var BOOK		= [];

var THISUSER	= "";
var TIMESTAMP	= "";
var TIMER		= "";

var OPDATE		= 0;
var STAFFNAME	= 1;
var HN			= 2;
var NAME		= 3;
var AGE			= 4;
var DIAGNOSIS	= 5;
var TREATMENT	= 6;
var CONTACT		= 7;
var QN			= 8;

var CASE		= 0;
var PATIENT		= 1;
var SDIAGNOSIS	= 2;
var STREATMENT	= 3;
var ADMISSION	= 4;
var FINAL		= 5;
var ADMIT		= 6;
var DISCHARGE	= 7;
var SQN			= 8;

var EDITABLE 	= [HN, DIAGNOSIS, TREATMENT, CONTACT];
var SEDITABLE	= [SDIAGNOSIS, STREATMENT, ADMISSION, FINAL, ADMIT, DISCHARGE]

var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
var DAYOFTHAINAME	= {"อาทิตย์":0, "จันทร์":1, "อังคาร":2, "พุธ":3, "พฤหัส":4, "ศุกร์":5, "เสาร์":6};

//use for row color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", 
						"thursday", "friday", "saturday"];

var NUMMONTH	= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};

var TRIMHTML	= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
var HTMLNOTBR	=/(<((?!br)[^>]+)>)/ig

var ISODATE			= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/
var HYPHENYYYYDATE	= /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{4}\b/
var HYPHENYYDATE	= /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{2}\b/
var SLASHYYYYDATE	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/
var SLASHYYDATE		= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/

var ISODATEG		= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/g
var HYPHENYYYYDATEG	= /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{4}\b/g
var HYPHENYYDATEG	= /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{2}\b/g
var SLASHYYYYDATEG	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/g
var SLASHYYDATEG	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/g

var STAFF = ["อ.เอก", "อ.อัตถพร", "อ.สรยุทธ", "อ.วัฒนา", "อ.เกรียงศักดิ์", "อ.พีรพงศ์"];

var HOLIDAY = {
	"2017-02-11" : "url('pic/Magha.jpg')",
	"2017-02-13" : "url('pic/Maghasub.jpg')",	//หยุดชดเชยวันมาฆบูชา
	"2017-05-10" : "url('pic/Vesak.jpg')",
	"2017-05-12" : "url('pic/Ploughing.jpg')",
	"2017-07-08" : "url('pic/Asalha.jpg')",
	"2017-07-09" : "url('pic/Vassa.jpg')",
	"2017-07-10" : "url('pic/Asalhasub.jpg')",
	"2017-07-11" : "url('pic/Vassasub.jpg')",	//หยุดชดเชยวันเข้าพรรษา,	
	"2018-03-01" : "url('pic/Magha.jpg')",
	"2018-05-09" : "url('pic/Ploughing.jpg')",
	"2018-05-29" : "url('pic/Vesak.jpg')",
	"2018-07-27" : "url('pic/Asalha.jpg')",
	"2018-07-28" : "url('pic/Vassa.jpg')",
	"2018-07-30" : "url('pic/Vassasub.jpg')",
	"2019-02-19" : "url('pic/Magha.jpg')",		//วันมาฆบูชา
	"2019-05-13" : "url('pic/Ploughing.jpg')",	//วันพืชมงคล
	"2019-05-18" : "url('pic/Vesak.jpg')",		//วันวิสาขบูชา
	"2019-05-20" : "url('pic/Vesaksub.jpg')",	//หยุดชดเชยวันวิสาขบูชา	
	"2019-07-16" : "url('pic/Asalha.jpg')",		//วันอาสาฬหบูชา
	"2019-07-17" : "url('pic/Vassa.jpg')"		//วันเข้าพรรษา
	}

var neuroSxOp = [
	/[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Cc]lip/, 
	/[Dd]ecom/, /DBS/, /[Dd]rain/, /[Ee]ctomy/, /ETS/,
	/[Ff]ix/, /[Ff]usion/, /[Ii]nsert/, /[Ll]esion/, /[Ll]ysis/, 
	/[Oo]cclu/, /[Oo]per/, /ostom/, /otom/, /plast/, /[Rr]emov/, /[Rr]epa/, /[Rr]evis/, 
	/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /[Tt]ranspos/, /[Tt]ransect/, /[Uu]ntether/
	]

var neuroMorbid = [
	/[Bb]rain death/, /[Bb]rain swelling/, /[Dd]elirium/, /[Dd]onor/, 
	/[Ll]eak/, /[Mm]orbid/, /[Ss]pastic/, /[Ss]eizure/, /DI/, 
	/[Pp]ost-op.*palsy/, /[Pp]ost-op.*paresis/, /[Pp]ost-op.*weakness/, 
	/[Pp]ost-op.*plegia/, /[Pp]ost-op.*gr [0123]/
	]
