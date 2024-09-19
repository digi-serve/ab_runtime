import { check, group } from "k6";
import http from "k6/http";
import config from "../config.js";

const BASEURL = config.baseurl;
export default function Authenticate() {
   group("Login", () => {
      const url = `${BASEURL}/auth/login`;
      const payload = JSON.stringify({
         email: config.email,
         password: config.password,
      });

      const params = {
         headers: {
            "Content-Type": "application/json",
         },
      };

      const res = http.post(url, payload, params);
      check(res, {
         "response code was 200": (res) => res.status == 200,
      });
   });
}
