import { check, group } from "k6";
import http from "k6/http";
import config from "../config.js";
import {
   randomIntBetween,
   randomString,
   randomItem,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

const BASEURL = config.baseurl;
export function ModelGet() {
   group("Model Get", () => {
      const url = `${BASEURL}/app_builder/model/${randomItem(
         config.objectIDs,
      )}`;

      const res = http.get(url, {
         headers: { "user-token": config.userToken },
      });
      check(res, {
         "response code was 200": (res) => res.status == 200,
      });
   });
}

export function ModelCreate() {
   group("Model Create", () => {
      const url = `${BASEURL}/app_builder/model/${randomItem(
         config.objectIDs,
      )}`;
      const body = JSON.stringify({
         name: randomString(randomIntBetween(5, 10)),
         number: randomIntBetween(0, 10000),
      });
      const res = http.post(url, body, {
         headers: {
            "Content-Type": "application/json",
            "user-token": config.userToken,
         },
      });
      check(res, {
         "response code was 200": (res) => res.status == 200,
      });
   });
}

export function ModelUpdate() {
   const i = randomIntBetween(0, config.objectIDs.length);
   const url = `${BASEURL}/app_builder/model/${config.objectIDs[i]}/${config.recordIDs[i]}`;
   const body = JSON.stringify({
      name: randomString(randomIntBetween(5, 10)),
      number: randomIntBetween(0, 10000),
   });
   const res = http.put(url, body, {
      headers: {
         "Content-Type": "application/json",
         "user-token": config.userToken,
      },
   });
   check(res, {
      "response code was 200": (res) => res.status == 200,
   });
}
