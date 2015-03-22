#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# use the cgi library
#import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use JSON encoding
import json

# use python sqlite3 database
import sqlite3

#Define Main Function
def main():

    try:
        # connect to the database
        dbc = sqlite3.connect("data/rsp-admin.db")
        dbc.row_factory = sqlite3.Row
        # execute SQL SELECT to Create JSON Data
        csr = dbc.cursor()
        csr.execute("SELECT * FROM LOGIN ORDER BY ID ASC")
        rows = csr.fetchall()
        if rows != None:
            json_data = json.dumps( [dict(idx) for idx in rows] )
            #
            # Print HTTP Response JSON
            #
            print "Content-Type: application/json"
            print
            print json_data

    except sqlite3.Error, e:
        # Handle Exceptions
        print ""
        
    finally:
        if dbc:
            dbc.close()
        
# Run The Program
main()
