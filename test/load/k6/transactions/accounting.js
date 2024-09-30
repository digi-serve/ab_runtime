import {
   ModelInit,
   ModelGet,
   ModelCreate,
   ModelUpdate,
   ModelDelete,
} from "./model.js";

import {
   randomIntBetween,
   randomString,
   randomItem,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

import { thinkTime } from "../utils/common.js";

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

const LookupKeys = [
   "BudgetIncomeCategory",
   "BudgetIncomeSource",
   "BudgetExpenseSource",
   "Ministry Team",
   "Responsibility Center",
   "QX Center",
];

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

function rndString(data, key, max = 10) {
   if (typeof data[key] != "undefined") return;

   return (data[key] = "k6-testdata-" + randomString(randomIntBetween(5, max)));
}

function lookup(sharedData, data, key, dataKey = null) {
   if (dataKey == null) dataKey = key;
   if (typeof data[dataKey] != "undefined") return;

   let list = sharedData.accountingLookups[key] || [];
   const i = randomIntBetween(0, list.length - 1);
   const row = list[i];
   let pk = "id";
   switch (key) {
      case "BudgetIncomeCategory":
         pk = "Acct Num";
         break;
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
   data[dataKey] = row[pk] || row.id || row.uuid;
   return data[dataKey];
}

function option(data, key) {
   if (typeof data[key] != "undefined") return;

   let list = Options[key] || [];
   const i = randomIntBetween(0, list.length - 1);
   data[key] = list[i].id;
   return data[key];
}

export function AccountingInit(sharedData) {
   sharedData.accountingLookups = {};
   LookupKeys.forEach((key) => {
      let oID = Accounting.Objects[key];
      let values = ModelGet(oID, { populate: "false" });
      sharedData.accountingLookups[key] = values;
   });

   // prepare for teardown data removal
   sharedData.cleanup = {};
   sharedData.cleanup[Accounting.Objects.Budget] = [];
   sharedData.cleanup[Accounting.Objects.BudgetIncome] = [];
   sharedData.cleanup[Accounting.Objects.BudgetExpense] = [];

   return sharedData;
}

export function AccountingTeardown(data) {
   // get list of all Budgets we created:
   let list = ModelGet(Accounting.Objects.Budget, {
      where: { "Project Name": { like: "k6-testdata-%" } },
   });
   let budgetIDs = list.map((l) => l.id);

   const clearObject = (objID, colName, colValue) => {
      let where = {};
      where[colName] = colValue;
      // console.log("##### where:", where);
      let modelList = ModelGet(objID, {
         where,
      });
      if (modelList) {
         modelList.forEach((l) => {
            ModelDelete(objID, l.id);
         });
      }
      return (modelList || []).map((l) => l.id);
   };

   // clear the related Income and Expenses
   clearObject(Accounting.Objects.BudgetIncome, "Project Income", budgetIDs);
   clearObject(Accounting.Objects.BudgetExpense, "Why", {
      like: "k6-testdata-%",
   });

   // clear those budgets:
   budgetIDs.forEach((id) => {
      ModelDelete(Accounting.Objects.Budget, id);
   });
}

export function BudgetCreate(sharedData, data = null) {
   data = data || {};
   rndString(data, "Project Name");
   lookup(sharedData, data, "Ministry Team");
   rndString(data, "Approver CAS");
   rndString(data, "Purpose", 25);
   lookup(sharedData, data, "QX Center", "QX"); // data["QX"] || lookup(sharedData, "QX Center");
   lookup(sharedData, data, "Responsibility Center", "RC");
   option(data, "Date");

   let objID = Accounting.Objects.Budget;
   let response = ModelCreate(objID, data);
   // console.log("BudgetCreate:response:", JSON.stringify(response));
   sharedData.cleanup[objID].push(response.uuid || response.id);
   return response;
}

export function BudgetExpenseAdd(sharedData, budgetEntry, data = null) {
   data = data || {};
   rndString(data, "Why"); // Purpose
   data["Expense Amount"] = randomIntBetween(1, 100);
   lookup(sharedData, data, "BudgetExpenseSource", "Project Expense");
   data["Project Expense873"] = budgetEntry.uuid;

   let objID = Accounting.Objects.BudgetExpense;
   let response = ModelCreate(objID, data);
   // console.log();
   // console.log("BudgetExpenseAdd:response:", JSON.stringify(response));
   sharedData.cleanup[objID].push(response.uuid || response.id);
   return response;
}

export function BudgetIncomeAdd(sharedData, budgetEntry, data = null) {
   data = data || {};
   data["Responsible for Funding"] = "admin";
   data["Income Amount"] = randomIntBetween(1, 100);
   lookup(sharedData, data, "BudgetIncomeSource", "Income Source");
   lookup(sharedData, data, "BudgetIncomeCategory", "Income Category");
   data["Project Income"] = budgetEntry.uuid;

   let objID = Accounting.Objects.BudgetIncome;
   let response = ModelCreate(objID, data);

   // console.log();
   // console.log("BudgetIncomeAdd:response:", JSON.stringify(response));
   sharedData.cleanup[objID].push(response.uuid || response.id);
   return response;
}

export function CreateBudget(sharedData) {
   let newBudget = BudgetCreate(sharedData);
   thinkTime();

   // create several Expense Categories
   let allExpenses = [];
   let numExpenses = randomIntBetween(1, 10);
   for (var i = 0; i < numExpenses; i++) {
      allExpenses.push(BudgetExpenseAdd(sharedData, newBudget));
      thinkTime();
   }
   let totalExpenses = 0;
   allExpenses.forEach((e) => {
      totalExpenses += e["Expense Amount"];
   });

   // create several Income sources
   let allIncome = [];
   let numIncome = randomIntBetween(1, 10);
   for (var ii = 0; ii < numIncome; ii++) {
      allIncome.push(BudgetIncomeAdd(sharedData, newBudget));
      thinkTime();
   }
   let totalIncome = 0;
   allIncome.forEach((e) => {
      totalIncome += e["Income Amount"];
   });

   // Income should be > Expenses
   if (totalIncome < totalExpenses) {
      // add 1 more:
      let amount = totalExpenses - totalIncome + 1;
      allIncome.push(
         BudgetIncomeAdd(sharedData, newBudget, { "Income Amount": amount }),
      );
      thinkTime();
   }

   // submit the budget?
}
