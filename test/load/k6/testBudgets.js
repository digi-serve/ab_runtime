import Index from "./transactions/Index.js";
import {
   AccountingInit,
   AccountingTeardown,
   CreateBudget,
} from "./transactions/accounting.js";
import { thinkTime } from "./utils/common.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

let numVUs = 500;

// define configuration
export const options = {
   // define thresholds
   thresholds: {
      http_req_failed: ["rate<0.01"], // http errors should be less than 1%
      // http_req_duration: ["p(99)<3000"], // 99% of requests should be below 1s
   },
   // define scenarios
   scenarios: {
      // arbitrary name of scenario
      average_load: {
         executor: "ramping-vus",
         stages: [
            // ramp up to average load of 20 virtual users
            { duration: "30s", target: numVUs },
            // maintain load
            { duration: "60s", target: numVUs },
            // ramp down to zero
            { duration: "30s", target: 0 },
         ],
      },
   },
};

export function setup() {
   // This is setup code. It runs once at the beginning of the test, regardless of the number of VUs.
   let data = AccountingInit({});
   return data;
   // the data you return here will be sent into each VU's main function.
}

export default function (data) {
   // {obj} data : shared data that was created in setup()

   // This is VU code. It runs repeatedly until the test is stopped.
   Index();
   thinkTime();

   // create several Budgets
   let numBudgets = randomIntBetween(1, 3);
   for (var i = 0; i < numBudgets; i++) {
      CreateBudget(data);
   }
}

export function teardown(data) {
   AccountingTeardown(data);
}
