const config = {
   baseurl: `http://localhost:${__ENV.WEB_PORT}`, //add port number if neeeded
   userToken: "testtoken",
   objectIDs: [
      "7bd7ee6a-ce5f-4464-b4ab-1b1818148e09",
      "44e90128-da9a-48e1-96f7-18499ef35204",
      "23959c90-7112-4694-9244-98291762f68f",
   ],
   // objects should have fields name, number
   recordIDs: {
      // objectID : [ <recordID>, ... ]
   },
   // known record corresponding with the object at the same index
   user: "admin@email.com",
   password: "admin",
};

config.objectIDs.forEach((o) => {
   config.recordIDs[o] = [];
});

export default config;
