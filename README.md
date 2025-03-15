This is main branch, to access ung latest progress, go to AuthHelpDev branch


Ung mk4Dev-Branch ay ung branch na ginagamit ng Render web hosting. Currently live syang nag hohost ng web kaya do not touch that branch unless ready nang magpush ng changes dun sa branch na yon

# Development Mark Phases:

- Mark 1: A simple Web app on a local host("Hello World")

- Mark 2: Added input functions on the web app on a local host

- Mark 3: Deploy on Render, allows web app to open medical apps via deeplinks

- Mark 4: Create log-in feature for session mode on web app. This must allow users to access their own profile(Patients), or have access to all data records(Healthworkers - admin role). I used Firebase Auth so that users could access their profiles by using their Google account. 

- Mark 5: integrate AWS database for exported files from google drive, data must be visible by end user's profile on the web app(BP, Oxygen Saturation, and Temperature). 

- Mark 6: Automate exported files from Google Drive to AWS PostgreSQL database. Since our kiosk uses medical devices with bluetooth features, data will be exported in csv/xls format exported from their respective apps(Bp - Omron Connect app, OxySat - HealthTree app, Temperature - Beurer Health Manager Pro App). The health kiosk web app must only display data of their own users, meaning ang makikita lang dapat ng pasyente ay ung sarili nilang data na lumabas sa mga apps na ginamit nila nung nagpa BP or pulse oxy, or thermometer sila. 

- Mark 7: Integrate EHR systems(PPD clinic app, as required by College of Medicine). This will be on the Doctor's side where every patient data will be saved/accessible by the doctor in charge. 

- Mark 8: UI/UX improvement phase. Use CSS to make the web app appealing for end users. Add additinal instructions for end users how to navigate the web app, as well as instructions for the medical devices apps so that users know how use and to export csv/xls output to Google Drive. Since walang public API details for the said medical devices apps mentioned in Mark 6(or atleast to my knowledge and research), we have to rely on using deeplinks and export csv/xls functions ng apps in order to integrate those apps sa health kiosk web app natin. So exporting csv/xls files is very important for the backend data processing/frontend display. Also add Google meet links for health kiosk patient to doctor online consultations for telemedicine. Online consultations ang pinaka "use" ng Health kiosk talaga para makapag consult ang mga tao from GIDA locations to a doctor. Doctors must also be able to send their "reseta" to the patients who use the health kiosk, and the web app must be able to display ung reseta ng doctor to that patient. 

# Current phase: Mark 4
Problems encountered that hindered Mark 4's progress: encountered bugs after trying to use aws database for firebase authentication 

# Important Notes
- Omron Connect and Beurer HealthManager Pro can export data as csv. HealthTree app can only send data as xls, so need sya maconvert into csv in the backend after exporting.
- Health Kiosk Web App must be able to display telemedicine/telemetry features. Which is why importante na kaya ng health kiosk makapag conduct ng online consultations, receive/print out "resetas", as well as use the medical devices of the health kiosk.
- programming languages used: python(backend logic), HTML(sturcture), CSS(Mark 8 phase, for web app style)
- Eventually need ilipat ang web hosting from Render to AWS since ang free tier ng Render ay may cool down every 15mins of being inactive which would be a problem sa User experience ng health kiosk
