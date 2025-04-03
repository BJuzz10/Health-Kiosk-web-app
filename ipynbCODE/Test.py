import pandas as pd
from datetime import datetime

#print(pd.io.excel.ExcelWriter)
#print(pd.options.io.excel.xlsx.writer)
exel = 'DataRecord_1743696532359.xls'
df = pd.read_excel(exel) #pip install openpyxl, pip install xlrd

#print(f"Pandas used: {pd.io.excel._detect_engine(exel)}")
print(df.head())  # Display the first few rows

print(pd.DataFrame(df))

df['Time'] = pd.to_datetime(df['Time'], format="%Y-%m-%d %H:%M:%S")
print(df['Time'])
#Assume that this section is log in logic
year = int(input("Enter Year: "))
month = int(input("Enter month: "))
day = int(input("Enter day: "))
hr = int(input("Enter hour: "))
minute = int(input("Enter minute: "))

custom_dt = datetime(year, month, day, hr, minute) #datetime(2025, 3, 29, 14, 30, 0)
print(custom_dt)

filtered_df = df[df['Time'] >= custom_dt]
print(pd.DataFrame(filtered_df))

filtered_df.to_csv("outputpulse2.csv", index=False)


"""
requirements.txt
Flask==3.1.0
gunicorn==23.0.0
pandas==2.2.3
openpyxl==3.1.5
xlrd==2.0.1
"""
