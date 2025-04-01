import pandas as pd
from datetime import datetime

df = pd.read_csv('[OMRON] Measurement Data.csv')#, header=None) 
datafram = pd.DataFrame(df)
print(df.columns)

print(datafram)
# Convert 'Measurement Date' to datetime format (adjust column name as needed)
df['Measurement Date'] = pd.to_datetime(df['Measurement Date'], format="%m/%d/%Y %H:%M", errors='coerce')

print(df['Measurement Date'])
#time value
custom_dt = datetime.now().strftime("%m/%d/%Y %H:%M")
    
#filter data frame
filtered_df = df[df['Measurement Date'] >= custom_dt]
    
#remove unecessary columns
fildf = filtered_df[['Measurement Date','SYS(mmHg)','DIA(mmHg)']]
fildf.to_csv("output3.csv", index=False) #filtered_df.to_csv("output2.csv", index=False)