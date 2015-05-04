#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import os

# use the cgi library
import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use internal sqlite3 database
import sqlite3

from time import asctime, localtime

# Error Class For File not Found
class noDBerror(Exception):
    def __init__(self, msg):
        self.msg = msg
    def __str__(self):
        return repr(self.msg)

# The MAIN Program Module
def main():
    
    fs = cgi.FieldStorage()
    svCode = fs.getvalue("SURVEY")
    surv = "data/" + svCode + ".db"
    
    print "Content-Type: text/html; charset=utf-8"
    print
    print "<!DOCTYPE html>"
    print "<html>"
    print "<head>"
    print '''<link rel="stylesheet" type="text/css" href="../css/display.css"></head>'''
    print "<title>Survey " + svCode + " Responses</title>"
    print "<body>"
    print "<h2>Current Responses for Survey: " + svCode + "</h2>"
    
    try:
        if os.path.exists(surv) == False:
            # the os function above does not raise an error, make our own
            raise noDBerror("We're Sorry, The Database for Survey: '" + svCode + "' Cannot Be Found.")
        
        dbc = sqlite3.connect(surv)
        dbc.row_factory = sqlite3.Row
        #print "Opened database successfully"
        
        cursor = dbc.execute("SELECT ID, SUBJECT, RATING from RESPONSE ORDER BY SUBJECT, ID")
        i = 1
        print '''<table><col width="60"><col width="120"><col width="160"><col = width="60">'''
        print "<tr><th>ROW</th><th>ID</th><th>SUBJECT</th><th>RATING</th></tr>"
        cnt = 0
        ctot = 0
        cavg = 0.00
        for row in cursor:
            if i == 1:
                cursub = row['SUBJECT']
            if row['SUBJECT'] == cursub:
                cnt = cnt + 1
                ctot += row['RATING']
            else:
                if cnt:
                    cavg = float(ctot) / cnt
                else:
                    cavg = float(0)
                print '<tr><td colspan="4" class="total">' + cursub + " Total: " + str(ctot) + " Count: " + str(cnt) + " Average Score: " + str(cavg) + "</td></tr>"
                cursub = row['SUBJECT']
                cnt = 1
                ctot = row['RATING']
                cavg = 0.00
            ptime = asctime(localtime(row['ID']))
            print "<tr><td>"+str(i)+"</td><td>"+ptime+"</td><td>"+row['SUBJECT']+"</td><td>"+str(row['RATING'])+"</td></tr>"
            i = i + 1
        if cnt:
            cavg = float(ctot) / cnt
        print '<tr><td colspan="4" class="total">'  + cursub + " Total: " + str(ctot) + " Count: " + str(cnt) + " Average Score: " + str(cavg) + "</td></tr>"
        print "</table>"
    
    except sqlite3.Error as e:
        print "Sqlite3 Err: " + e.args[0]
        print "<br><br>"
    except noDBerror as e:
        print "<p style='font-size:125%;font-wight:bold;color:red;''>"
        print e.msg
        print "</p>"
        
    finally:
        print "<br><em>*** DISPLAY COMPLETE ***</em><br><br>&nbsp&nbsp&nbsp&nbsp"
        print '''<button onclick="window.close()">OK</button>'''
        print "</body></html>"
    
    if dbc:
        dbc.close()

# Run The Program    
main()
