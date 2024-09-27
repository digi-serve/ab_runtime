import { ModelInit, ModelGet, ModelCreate, ModelUpdate } from "./model.js";

import {
   randomIntBetween,
   randomString,
   randomItem,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

import config from "../config.js";

const Accounting = {
   Objects: {
      Budget: "839ac470-8f77-420c-9a30-aeaf0a9f509c",
      BudgetIncome: "b677d7ba-5895-49b9-b2ef-29d51f9d3ba7",
      BudgetIncomeCategory: "c1a3642d-3863-4eb7-ac98-3dd18de3e683",
      BudgetIncomeSource: "721797cd-9dd9-4b1a-955d-70f1b79756b5",
      BudgetExpense: "e6c36827-d3e0-4cad-b717-07af600cf100",
      BudgetExpenseSource: "132e3669-11c8-4014-955e-58af66b89d42",

      "Ministry Team": "138ff828-4579-412b-8b5b-98542d7aa152",
      "Responsibility Center": "c3aae079-d36d-489f-ae1e-a6289536cb1a",
      "QX Center": "2a662d46-384b-4d3b-901b-b74c0cd39b15",
   },
};

const LookupKeys = ["Ministry Team", "Responsibility Center", "QX Center"];

const Options = {
   /* key : [ <option1>, <option2>, ... <optionN> ] */
   Date: [
      {
         id: "第一季度",
      },
      {
         id: "第二季度",
      },
      {
         id: "第三季度",
      },
      {
         id: "第四季度",
      },
      {
         id: "全年",
      },
      {
         id: "不详",
      },
   ],
};

function rndString(max = 10) {
   return randomString(randomIntBetween(5, max));
}

function lookup(sharedData, key) {
   let list = sharedData.accountingLookups[key] || [];
   const i = randomIntBetween(0, list.length - 1);
   const row = list[i];
   let pk = "id";
   switch (key) {
      case "Ministry Team":
         pk = "Name";
         break;
      case "Responsibility Center":
         pk = "RC Name";
         break;
      case "QX Center":
         pk = "QX Code";
         break;
   }
   return row[pk] || row.id || row.uuid;
}

function option(key) {
   let list = Options[key] || [];
   const i = randomIntBetween(0, list.length - 1);
   return list[i].id;
}

export function AccountingInit(sharedData) {
   sharedData.accountingLookups = {};
   LookupKeys.forEach((key) => {
      let oID = Accounting.Objects[key];
      let values = ModelGet(oID, { populate: "false", limit: 10 });
      sharedData.accountingLookups[key] = values;
   });
   return sharedData;
}

export function BudgetCreate(sharedData, data = null) {
   data = data || {};
   data["Project Name"] = data["Project Name"] || rndString();
   data["Ministry Team"] =
      data["Ministry Team"] || lookup(sharedData, "Ministry Team"); // Optional: Team Name
   data["Approver CAS"] = data["Approver CAS"] || rndString();
   data["Purpose"] = data["Purpose"] || rndString(25);
   data["QX"] = data["QX"] || lookup(sharedData, "QX Center");
   data["RC"] = data["RC"] || lookup(sharedData, "Responsibility Center");
   data["Date"] = data["Date"] || option("Date");

   let response = ModelCreate(Accounting.Objects.Budget, data);

   console.log("BudgetCreate:response:", JSON.stringify(response));
   return response;
}
