#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# use the cgi library
import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use internal sqlite3 database
import sqlite3
# use json
import json

#Define Main Function
def main():
    
    fs = cgi.FieldStorage()
    logid = fs.getvalue("LOGID")
    json_data = ""
    
    try:
        dbc = sqlite3.connect("data/rsp-admin.db")
        dbc.row_factory = sqlite3.Row
        # Set cursor
        csr = dbc.cursor()
        # get first DB table row from cursor after select
        csr.execute("SELECT * FROM LOGIN WHERE ID='" + logid + "'")
        rows = csr.fetchall()
        if rows != None:
            # Create JSON string
            json_data = json.dumps( [dict(idx) for idx in rows] )
            # Return JSON Data
            print "Content-Type: application/json"
            print
            print json_data
            
    except sqlite3.Error, e:
        # Handle Exception
        json_data = ""
 
    finally:
        if dbc:
            # close DB
            dbc.close()

# Run The Program
main()
