"use strict";

const $ = id => document.getElementById(id);

const labelMap = {
cash:"現金",bank:"預金",stock:"株式",nisa:"NISA",
land:"土地",building:"建物",carAsset:"自動車",

loan:"住宅ローン",credit:"カード",other:"その他",
mloan:"Mローン",mbond:"M債権",ybond:"Y債権"
};

let data = JSON.parse(localStorage.getItem("assetOS")) || {
assets:{cash:0,bank:0,stock:0,nisa:0,land:0,building:0,carAsset:0},
liabilities:{loan:0,credit:0,other:0,mloan:0,mbond:0,ybond:0},
incomeRecords:[],
expenseRecords:[],
history:{}
};

/* ===== tab ===== */
function tab(i){
document.querySelectorAll(".page").forEach((p,n)=>{
p.classList.toggle("active",n===i);
});
}

/* ===== totals ===== */
function assetsTotal(){
return Object.values(data.assets).reduce((a,b)=>a+b,0);
}
function debtTotal(){
return Object.values(data.liabilities).reduce((a,b)=>a+b,0);
}
function net(){
return assetsTotal()-debtTotal();
}

/* ===== save ===== */
function saveAll(){

Object.keys(data.assets).forEach(k=>data.assets[k]=+$(k).value||0);
Object.keys(data.liabilities).forEach(k=>data.liabilities[k]=+$(k).value||0);

push("income","salary","income_date_salary","income_salary");
push("income","extra","income_date_extra","income_extra");
push("income","invest","income_date_invest","income_invest");

push("expense","education","exp_date_education","exp_education");
push("expense","daily","exp_date_daily","exp_daily");
push("expense","car","exp_date_car","exp_car");
push("expense","furniture","exp_date_furniture","exp_furniture");

push("expense","food","exp_date_food","exp_food");
push("expense","house","exp_date_house","exp_house");
push("expense","utility","exp_date_util","exp_util");
push("expense","communication","exp_date_comm","exp_comm");

push("expense","transport","exp_date_transport","exp_transport");
push("expense","medical","exp_date_med","exp_med");
push("expense","entertainment","exp_date_ent","exp_ent");
push("expense","other","exp_date_other","exp_other");

save();
}

function push(type,cat,d,v){
if(!$(d).value || !$(v).value) return;
data[type+"Records"].push({
date:$(d).value,
cat,
amount:+$(v).value
});
}

function save(){
localStorage.setItem("assetOS",JSON.stringify(data));
snapshot();
update();
}

function snapshot(){
let m=new Date().toISOString().slice(0,7);
data.history[m]=net();
}

/* ===== update ===== */
function update(){
$("net").textContent="¥"+net().toLocaleString();
renderBS();
renderHistory();
renderAnalysis();
renderChart();
}

/* ===== BS ===== */
function renderBS(){

$("assetsBS").innerHTML =
Object.entries(data.assets).map(([k,v])=>
`<div class="row"><span>${labelMap[k]||k}</span><span>¥${v.toLocaleString()}</span></div>`
).join("");

$("liabBS").innerHTML =
Object.entries(data.liabilities).map(([k,v])=>
`<div class="row"><span>${labelMap[k]||k}</span><span style="color:#e74c3c">¥${v.toLocaleString()}</span></div>`
).join("");

let n=net();
$("netBS").textContent="¥"+n.toLocaleString();

let ratio=assetsTotal()?debtTotal()/assetsTotal()*100:0;

$("risk").textContent=
ratio<30?"🟢 健全":ratio<60?"🟡 注意":"🔴 危険";
}

/* ===== history ===== */
function renderHistory(){

let list=[
...data.incomeRecords.map(r=>({...r,t:"収入"})),
...data.expenseRecords.map(r=>({...r,t:"支出"}))
];

list.sort((a,b)=>b.date.localeCompare(a.date));

$("history").innerHTML=list.map(r=>
`<div class="row"><span>${r.date} ${r.cat}</span><span>${r.t==="収入"?"+":"-"}${r.amount}</span></div>`
).join("");
}

/* ===== analysis ===== */
function renderAnalysis(){

let m=new Date().toISOString().slice(0,7);

let inSum=data.incomeRecords.filter(r=>r.date.startsWith(m)).reduce((a,b)=>a+b.amount,0);
let exSum=data.expenseRecords.filter(r=>r.date.startsWith(m)).reduce((a,b)=>a+b.amount,0);

$("analysis").innerHTML=
`収入:${inSum}<br>支出:${exSum}<br>差額:${inSum-exSum}`;
}

/* ===== chart ===== */
let chart;

function renderChart(){
if(!window.Chart)return;
if(chart)chart.destroy();

chart=new Chart($("chart"),{
type:"line",
data:{
labels:Object.keys(data.history),
datasets:[{data:Object.values(data.history),borderColor:"#0a84ff"}]
}
});
}

/* ===== export ===== */
function exportCSV(){
let rows=[["date","type","cat","amount"]];
data.incomeRecords.forEach(r=>rows.push([r.date,"income",r.cat,r.amount]));
data.expenseRecords.forEach(r=>rows.push([r.date,"expense",r.cat,r.amount]));

let csv=rows.map(r=>r.join(",")).join("\n");

let a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([csv]));
a.download="asset.csv";
a.click();
}

function backupJSON(){
let a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([JSON.stringify(data)]));
a.download="backup.json";
a.click();
}

/* ===== init ===== */
update();