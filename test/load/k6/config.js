const config = {
   baseurl: "http://localhost", //add port number if neeeded
   userToken: "testtoken",
   objectIDs: [
      "7bd7ee6a-ce5f-4464-b4ab-1b1818148e09",
      "44e90128-da9a-48e1-96f7-18499ef35204",
      "23959c90-7112-4694-9244-98291762f68f",
   ],
   // objects should have fields name, number
   recordIDs: [
      "a006bf5-7f7a-42e3-a9c4-d9071d4e37e1",
      "60da6d97-9328-4796-a463-def57f061c5f",
      "377377ac-71a8-4bed-863d-ce29eafccec1",
   ],
   // known record corresponding with the object at the same index
   user: "admin@email.com",
   password: "admin",
};

export default config;
