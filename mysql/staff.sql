
CREATE TABLE staff (
	number tinyInt,
	active tinyInt default 1,
	code varchar(10),
	staffname varchar(255),
	specialty varchar(255),
	substitute varchar(255),
	oncalldate date
) ENGINE = myISAM DEFAULT CHARSET = utf8;
