
CREATE TABLE staff (
	number tinyInt,
	active tinyInt default 1,
	code varchar(10),
	staffname varchar(255),
	specialty varchar(255),
	staffoncall varchar(255),
	dateoncall date
) DEFAULT CHARSET = utf8;
