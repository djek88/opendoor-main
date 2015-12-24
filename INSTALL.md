### Installation steps

1. Install 
-	node.js
- npm
- MongoDB

2. Extract archive to desired folder on your server, cd into it and run
> npm install
> bower install

3. Copy example-config.js to config.js and set it up
- Enter your Gmail account in order to allow site to send mail (please contact me if you want to use another transport)
- Obtain Google Maps API key and enter it in config.js

4. Run server with
> node index.js

5. Register at site.You can become administrator doing in mongo console
> db.users.update({email: 'your_email_here'}, {$set:{isAdmin: true}})
### Known bugs
1. Server should be restarted after first launch in order to create indexes for locations