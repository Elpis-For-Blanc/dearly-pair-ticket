const $=id=>document.getElementById(id);
const ids=["nameA","nameB","pairName","ticketType","date","ticketNo","from","to","message","keywords","mainColor","paperColor","orientation","deco"];
const decoMap={ribbon:"୨୧",heart:"♡",star:"✦",moon:"☾",flower:"✿",none:""};
const themes={pink:["#d77f9e","#fff8fb"],angel:["#a9a6c9","#fffefe"],vintage:["#a77a65","#fbf4e8"],night:["#7778a9","#f5f3ff"],gothic:["#6d5869","#f8f3f7"],kitsch:["#d75f87","#fff3d8"]};
function escFile(s){return (s||"둘만의 티켓").replace(/[\\/:*?"<>|]/g,"").trim()}
function autoNo(){
 const d=$("date").value.replaceAll("-","").slice(2)||new Date().toISOString().slice(2,10).replaceAll("-","");
 return d+"-01";
}
function render(){
 const a=$("nameA").value.trim()||"A",b=$("nameB").value.trim()||"B",p=$("pairName").value.trim()||`${a} × ${b}`;
 const no=$("ticketNo").value.trim()||autoNo(), deco=decoMap[$("deco").value];
 $("photoNameA").textContent=a;$("photoNameB").textContent=b;$("pairText").textContent=p;$("stubPair").textContent=p;
 $("typeText").textContent=$("ticketType").selectedOptions[0].text;$("noText").textContent="NO. "+no;$("stubNo").textContent=no;
 $("fromText").textContent=$("from").value||"—";$("toText").textContent=$("to").value||"—";
 $("messageText").textContent=$("message").value||" ";$("keywordsText").textContent=$("keywords").value||" ";
 $("dateText").textContent=$("date").value||"—";$("centerDeco").textContent=deco;$("stubDeco").textContent=deco;
 $("ticket").style.setProperty("--main",$("mainColor").value);$("ticket").style.setProperty("--paper",$("paperColor").value);
 $("ticket").classList.toggle("portrait",$("orientation").value==="portrait");$("ticket").classList.toggle("landscape",$("orientation").value==="landscape");
 $("dearlySign").style.display=$("signature").checked?"block":"none";saveState();
}
ids.forEach(id=>$(id).addEventListener("input",render));$("signature").addEventListener("change",render);
function photo(input,preview){
 input.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{preview.innerHTML=`<img src="${r.result}" alt="">`;preview.classList.remove("photo-placeholder");try{localStorage.setItem("dearly_ticket_"+input.id,r.result)}catch{} };r.readAsDataURL(f)}
}
photo($("photoA"),$("photoPreviewA"));photo($("photoB"),$("photoPreviewB"));
document.querySelectorAll("#presets button").forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll("#presets button").forEach(x=>x.classList.remove("on"));btn.classList.add("on");
 const t=btn.dataset.theme,[m,p]=themes[t];$("mainColor").value=m;$("paperColor").value=p;
 $("ticket").className=`ticket ${$("orientation").value} theme-${t}`;render()
});
$("randomize").onclick=()=>{
 const ks=Object.keys(themes),t=ks[Math.floor(Math.random()*ks.length)],ds=Object.keys(decoMap);
 document.querySelector(`#presets button[data-theme="${t}"]`).click();
 $("deco").value=ds[Math.floor(Math.random()*ds.length)];render();
};
$("reset").onclick=()=>{if(!confirm("티켓 내용을 초기화할까요?"))return;localStorage.removeItem("dearly_pair_ticket_v1");localStorage.removeItem("dearly_ticket_photoA");localStorage.removeItem("dearly_ticket_photoB");location.reload()};
$("save").onclick=async()=>{
 const c=await html2canvas($("capture"),{scale:2,backgroundColor:null,useCORS:true});
 const a=document.createElement("a");a.download=`Dearly — ${escFile($("pairName").value||[$("nameA").value,$("nameB").value].filter(Boolean).join(" × "))}.png`;a.href=c.toDataURL("image/png");a.click()
};
function saveState(){try{const d={};ids.forEach(id=>d[id]=$(id).value);d.signature=$("signature").checked;localStorage.setItem("dearly_pair_ticket_v1",JSON.stringify(d))}catch{}}
function restore(){
 try{const d=JSON.parse(localStorage.getItem("dearly_pair_ticket_v1")||"null");if(d){ids.forEach(id=>{if(d[id]!=null)$(id).value=d[id]});$("signature").checked=d.signature!==false}
 ["A","B"].forEach(x=>{const s=localStorage.getItem("dearly_ticket_photo"+x),p=$("photoPreview"+x);if(s){p.innerHTML=`<img src="${s}" alt="">`;p.classList.remove("photo-placeholder")}})
 }catch{}
}
if(!$("date").value)$("date").value=new Date().toISOString().slice(0,10);restore();render();