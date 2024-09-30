import { check, group } from "k6";
import http from "k6/http";
import config from "../config.js";
import {
   randomIntBetween,
   randomString,
   randomItem,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

const BASEURL = config.baseurl;

export function ModelInit() {
   config.objectIDs.forEach((o) => {
      ModelCreate(o);
      ModelGet(o);
   });
}
export function ModelGet(objID = null, cond = null) {
   // group("Model Get", () => {
   let o = objID || randomItem(config.objectIDs);
   let url = `${BASEURL}/app_builder/model/${o}`;

   if (cond) {
      var useThese = ["string", "number", "boolean"];
      var search = Object.keys(cond)
         .map(function (key) {
            var val = cond[key];
            if (useThese.indexOf(typeof val) == -1) {
               val = JSON.stringify(val);
            }
            return key + "=" + encodeURIComponent(val);
         })
         .join("&");

      var join = "?";
      if (url.indexOf("?") > -1) {
         join = "&";
      }
      url = [url, search].join(join);
   }
   // console.log("MODELGET:url:", url);

   const res = http.get(url, {
      headers: { "user-token": config.userToken },
   });
   check(res, {
      "response code was 200": (res) => res.status == 200,
   });
   let returnData = null;
   let response = res.body;
   if (response) {
      if (typeof response == "string") {
         try {
            response = JSON.parse(response);
         } catch (e) {
            console.log("parse error:", response);
         }
      }
      if (response?.data) {
         // // config.recordIDs.push(response.data.uuid);
         // console.log("found :", response.data);
         returnData = response.data;
         if (returnData.data) returnData = returnData.data;
         try {
            config.recordIDs[o] = returnData.map((r) => r.uuid);
         } catch (e) {
            console.log(returnData);
         }
      }
   }

   return returnData;
   // });
}

export function ModelCreate(objID = null, data = null) {
   // group("Model Create", () => {
   let o = objID || randomItem(config.objectIDs);
   const url = `${BASEURL}/app_builder/model/${o}`;
   const body = JSON.stringify(
      data || {
         name: randomString(randomIntBetween(5, 10)),
         number: randomIntBetween(0, 10000),
      },
   );
   const res = http.post(url, body, {
      headers: {
         "Content-Type": "application/json",
         "user-token": config.userToken,
      },
   });
   check(res, {
      "response code was 200": (res) => res.status == 200,
   });
   // console.log(JSON.stringify(res, null, 4));
   let response = res.body;
   if (response) {
      if (typeof response == "string") {
         response = JSON.parse(response);
      }
      if (response?.data?.uuid) {
         config.recordIDs[o]?.push(response.data.uuid);
         // console.log("created :", response.data.uuid);
      }
   }
   if (response.status == "error") {
      console.log(response.message);
   }

   return response.data;
   // });
}

export function ModelUpdate(objID = null, rowID = null, data = null) {
   let o = objID;
   if (!o) {
      const i = randomIntBetween(0, config.objectIDs.length - 1);
      o = config.objectIDs[i];
   }

   let recID = rowID;
   if (!recID) {
      const r = randomIntBetween(0, config.recordIDs[o].length - 1);
      recID = config.recordIDs[o][r];
   }

   if (!recID) {
      // this can happen when tables are empty
      ModelUpdate();
      return;
   }

   const url = `${BASEURL}/app_builder/model/${o}/${recID}`;

   const body = JSON.stringify(
      data || {
         name: randomString(randomIntBetween(5, 10)),
         number: randomIntBetween(0, 10000),
      },
   );
   const res = http.put(url, body, {
      headers: {
         "Content-Type": "application/json",
         "user-token": config.userToken,
      },
   });
   check(res, {
      "response code was 200": (res) => res.status == 200,
   });

   return res.data;
}

export function ModelDelete(objID = null, rowID = null) {
   const url = `${BASEURL}/app_builder/model/${objID}/${rowID}`;

   const res = http.del(url, null, {
      headers: {
         "Content-Type": "application/json",
         "user-token": config.userToken,
      },
   });
   check(res, {
      "response code was 200": (res) => res.status == 200,
   });

   return res.data;
}
