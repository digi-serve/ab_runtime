import { group, check } from "k6";
import http from "k6/http";
import config from "../config.js";
const BASEURL = config.baseurl;
/** Mimic loading the page */
export default function Index() {
   group("Index", () => {
      const responses = [
         http.get(`${BASEURL}/`),
         http.get(`${BASEURL}/config/preloader`),
      ];
      check(responses, {
         "response code was 200": (responses) =>
            responses.every((res) => res.status == 200),
      });
   });
}
