#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# use the cgi library
import cgi

import time

# enable debugging
#import cgitb
#cgitb.enable()

# use internal sqlite3 database
import sqlite3

def main():
    
    fs = cgi.FieldStorage()
    utim = time.time()
    survdb = "data/" + fs.getvalue("SURVEY") + ".db" # data/<code>+.db
    subj = fs.getvalue("SUBJECT")
    ratg = fs.getvalue("RATING")
    dbsts = "OK"

    try:
        # Open the DB
        dbc = sqlite3.connect(survdb)
        # Create Table if it does not Exist.
        dbc.execute('''CREATE TABLE IF NOT EXISTS RESPONSE
               (ID REAL PRIMARY KEY     NOT NULL,
               SUBJECT           TEXT    NOT NULL,
               RATING            INT     NOT NULL);''')
        # Insert the Timestamp and the Survey Response Values
        dbc.execute("INSERT INTO RESPONSE (ID,SUBJECT,RATING) \
              VALUES (" + str(utim) + ", '" + subj + "', " + ratg + ")")
        # Update and Release DB Resources
        dbc.commit()

    except sqlite3.Error, e:
        # Handle the Exception
        if dbc:
            # Rollback the DB Transaction
            dbc.rollback()
        # Format the Error Message
        dbsts = "ERR:" + e.arg[0]
        
    finally:
        if dbc:
            # Close the DB
            dbc.close()
        #
        # Print HTTP Response text: "OK" if no errors, else
        # print "ERR:" and sqlite3 error string.
        # Variable "dbsts" will be set to either condition.
        #
        print "Content-Type: text/plain"
        print
        print dbsts,

#run the program
main()
