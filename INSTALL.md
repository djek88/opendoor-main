### Installation steps

1. Install
- node.js (npm will be installed also)
- MongoDB
- bower

2. Clone repository to desired folder, cd into it and run
> npm install
> bower install

3. Copy config options from example-config.js to config.js and set it up
- obtain Google Maps API key and enter it in config.js

4. Run server with
> node index.js

5. Register at site. You can become administrator doing in mongo console
> db.users.update({email: 'your_email_here'}, {$set:{isAdmin: true}})

### Import places data to db
1. Run mongodb
> mongod

2. Import data to db
> mongoimport --db opendoor --collection places --type json --file "path-to\result_proper_addrs.json" --jsonArray

### Known bugs
1. Server should be restarted after first launch in order to create indexes for locations