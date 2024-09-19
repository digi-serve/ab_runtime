import Index from "./transactions/Index.js";
// import Authenticate from "./transactions/authenticate.js";
import { ModelGet, ModelCreate, ModelUpdate } from "./transactions/model.js";
import { thinkTime } from "./utils/common.js";
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
            { duration: "30s", target: 500 },
            // maintain load
            { duration: "60s", target: 500 },
            // ramp down to zero
            { duration: "30s", target: 0 },
         ],
      },
   },
};

export function setup() {
   // This is setup code. It runs once at the beginning of the test, regardless of the number of VUs.
}

export default function () {
   // This is VU code. It runs repeatedly until the test is stopped.
   Index();
   // thinkTime();
   // Authenticate();
   thinkTime();
   ModelGet();
   thinkTime();
   ModelCreate();
   thinkTime();
   ModelUpdate();
   thinkTime();
}
