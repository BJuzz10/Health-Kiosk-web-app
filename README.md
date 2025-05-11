This is a python backend using Flask 
# Initializing flask backend
```bash
python Healthtreefilter.py
``` 
# cmd command lines for filtering data
```bash
curl -X POST http://localhost:10000/download -H "Content-Type: application/json" -d "{\"link\": \"https://docs.google.com/spreadsheets/d/1WSihyvVi0OAwuW_Q--yHgUg4UgG-cpjc/edit?usp=sharing^&ouid=107580692425249955357^&rtpof=true^&sd=true\"}"
```
- for testing purposes cd your cmd to where the csv file is located first
- user_id will be the user's id number based from the frontend of the web app, but for testing purposes the number can be random

# How it works
1. User logs in on web app
2. Backend locks in the time the user logged in
3. When a user exports a new csv, backend sends file to /filter_csv backend where it will be processed and displays filtered data to command line
4. filter logic is written in filt.py, while user log_in time locking in logic is written on log.py
5. when testing use command line for locking in time of user log in first before using command line for filtering csv file

# To See data filtering process refer to ipynbCode folder
- this is a separate folder that has no backend functions, it's where it shows how data filtering logic works
- DataRecord_xxxxxxxxx.xls is the unfiltered xls where you can observe that data are displayed in one columnn as well as data from previous users
- outputpulse.csv is the filtered results where it displays the temperature data

## Expected output
```bash
#columns:
ID, PR(bpm), SpO2(%), Time
```