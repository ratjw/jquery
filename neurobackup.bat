@echo off
echo Running dump...
"C:\Program Files (x86)\SErverApp\database\MySQL\bin\mysqldump" -userverapp -ppass SErverApp -P 10600 --result-file="Z:\backup.%DATE%.sql"
echo Done!

@echo off
for /F "tokens=2,3,4 delims=/ " %i in ('date /t') do set myDate=%i%j%k
echo Running dump...
"C:\Program Files (x86)\SErverApp\database\MySQL\bin\mysqldump" -userverapp -ppass SErverApp -P 10600 --result-file="Z:\backup.%myDate%.sql"

@ECHO OFF

set TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%

REM Export all databases into file C:\path\backup\databases.[year][month][day].sql
"C:\path-to\mysql\bin\mysqldump.exe" --all-databases --result-file="C:\path-to\backup\databases.%TIMESTAMP%.sql" --user=username --password=password

REM Change working directory to the location of the DB dump file.
C:
CD \path-to\backup\

REM Compress DB dump file into CAB file (use "EXPAND file.cab" to decompress).
MAKECAB "databases.%TIMESTAMP%.sql" "databases.%TIMESTAMP%.sql.cab"

REM Delete uncompressed DB dump file.
DEL /q /f "databases.%TIMESTAMP%.sql"

@ECHO OFF

@REM Set dir variables. Use ~1 format in win2k
SET basedir=C:\BACKUP~1
SET workdir=c:\TEMP
SET mysqldir=c:\mysql\bin
SET gzipdir=c:\PROGRA~1\GnuWin32\bin
SET mysqlpassword=mygoodpassword
SET mysqluser=myrootuser

@REM Change to mysqldir
CD %mysqldir%

@REM dump database. This is all one line
mysqldump -u %mysqluser% -p%mysqlpassword% --all-databases >%workdir%\backup.sql

@REM Change to workdir
CD %workdir%

@REM Zip up database
%gzipdir%\gzip.exe backup.sql

@REM Move to random file name
MOVE backup.sql.gz backup.%random%.gz

@REM FTP file to repository
FTP -n -s:%basedir%\ftp-commands.txt

@REM Remove old backup files
del backup.sql
del backup.*.gz

@REM Change back to base dir
CD %basedir%

@ECHO OFF
for /f "tokens=1-4 delims=/ " %%a in ('date/t') do (
set dw=%%a
set mm=%%b
set dd=%%c
set yy=%%d
)

SET bkupdir=C:\path\to\where\you\want\backups
SET mysqldir=D:\path\to\mysql
SET dbname=this_is_the_name_of_my_database
SET dbuser=this_is_my_user_name

@ECHO Beginning backup of %dbname%...

%mysqldir%\bin\mysqldump -B %dbname% -u %dbuser% > %bkupdir%\dbBkup_%dbname%_%yy%%mm%%dd%.sql
@ECHO Done! New File: dbBkup_%dbname%_%yy%%mm%%dd%.sql
pause
