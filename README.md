# SURVEYOR
## A simple survey system designed for an internal LAN

## DESCRIPTION
Surveyor is written in javascript and python (v2), taking advantage of python's
built-in CGI-HTTP server (although it should work with any http server) and
SQLite3 Database as well as its native CGI and JSON library functions. It
allows a Survey creator user to login and create surveys that are later
run by survey users. Each survey creates its own SQLite3 database in
the '/data' directory under the http server root. The survey user then
navigates to the 'index.html' file in the http server's root directory and
then simply enters the survey code (which is also the name of the database).
The survey will appear in the same page and the responses to the survey are
stored in the database with the name ('TITLE') of the item and a time stamp
and the value of the item. Current item type choices are:

- Horizontal radio button list (default)
- Vertical radio button list (better for mobile devices)
- Min-Max Range slider Bar

Once a survey item's value is selected, it is posted individually, so the
entire survey is not posted at the same time. This allows each item to be
tabulated as it is being reviewed on line. It works this way because the
main use of this tool was intended to be for school performance ratings,
where each individual performance is rated and posted as it is performed
not only at the end. There is a function for the survey creator to view the
survey in realtime as results are added to the database (just by manually
refreshing the survey display page - could be enhanced here).

There is not much security built in, except for the detection of login status
of a survey creator. Currently any survey creator can change any other survey
creators password and email. The database is also wide open, anyone with an
SQLite3 database browser of the command line tools can change anything in the
database.

## COMPONENTS

### StartWebServer.bat
Starts the built in Python CGI Webserver. Modify the file to use whatever
platform and http server you want. Currently set to listen on port 8000.

### index.html
The main default html file in the http root directory. Should be loaded
when the http server's address and port number are accessed by a contemporary
web browser. As in:

http://127.0.0.1:8000

THIS COMPONENT REQUIRES (in http root):
- js/index.js
- css/index.css
- data/rsp-survey.db
- cgi-bin/rsp_survey.py
- cgi-bin/rsp_post.py

### html/login.html


### html/admin.html


### html/survey.html

## CHANGE LOG
05-04-15 ALB Moved online GitHub repo up a directory level
			 Created new local eGit clone repository
05-29-15 ALB Fixed myriad of bugs, Added "HOME" button to take user back to
             the main navigation page. Added boxes around choices using the
             HTML <fieldset> tag, and added pulldown lists for items in the
             Survey Setup page using dynamic <select><option> tags.
             
