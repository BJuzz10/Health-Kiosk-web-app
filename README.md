This is a python backend using Flask 
# Initializing flask backend
```bash
python Healthtreefilter.py
``` 
# cmd command lines for filtering data
```bash
#for locking in time of user log in:
curl -c cookies.txt -X POST http://127.0.0.1:5000/logtime -d "user_id=234"

#for filtering out exported csv file:
curl -b cookies.txt -X POST http://127.0.0.1:5000/filter_csv -F "file=@DataRecord_xxxxxxxxxxxx.xls"
```
- for testing purposes cd your cmd to where the csv(or for healthtree's purposes, .xls) file is located first
- user_id will be the user's id number based from the frontend of the web app, but for testing purposes the number can be random

# How it works
1. User logs in on web app
2. Backend locks in the time the user logged in
3. When a user exports a new csv, backend sends file to /filter_csv backend where it will be processed and displays filtered data to command line
4. filter logic is written in filt.py, while user log_in time locking in logic is written on log.py
5. when testing use command line for locking in time of user log in first before using command line for filtering csv file

# To See data filtering process refer to ipynbCode folder
- this is a separate folder that has no backend functions, it's where it shows how data filtering logic works
- DataRecord_xxxxxxxxxxx.xls is the unfiltered raw data where you can observe that data are displayed in one columnn as well as data from previous users
- Ouputpulse.csv is the filtered results where it displays the SpO2(%) and PR(bpm) data

## Expected output
```bash
#columns:
ID, Time, SpO2(%), PR(bpm)
```
