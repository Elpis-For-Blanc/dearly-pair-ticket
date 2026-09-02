const $=id=>document.getElementById(id);
const ids=["nameA","nameB","pairName","ticketType","date","ticketNo","from","to","message","keywords","mainColor","paperColor","orientation","deco","photoShape"];
const decoMap={ribbon:"୨୧",heart:"♡",star:"✦",moon:"☾",flower:"✿",none:""};
const filenameMeta={
 love:{label:"Love Ticket",symbol:"♡"},
 cinema:{label:"Admit Two",symbol:"·"},
 train:{label:"Rail Pass",symbol:"·"},
 flight:{label:"Boarding Pass",symbol:"✈"},
 concert:{label:"Live Pass",symbol:"✦"},
 admission:{label:"Admission Ticket",symbol:"◇"}
};
function makeTicketFilename(){
 const pair=escFile($("pairName").value||[$("nameA").value,$("nameB").value].filter(Boolean).join(" × ")||"Our Pair");
 const meta=filenameMeta[$("ticketType").value]||filenameMeta.love;
 return `DEARLY — ${pair} ${meta.symbol} ${meta.label}.png`;
}

const typeMeta={love:"LOVE PASS",cinema:"ADMIT TWO",train:"RAIL PASS",flight:"BOARDING",concert:"LIVE PASS",admission:"ENTRY PASS"};
const themes={
pink:["#d77f9e","#fff8fb"],angel:["#9da8c9","#fffefe"],vintage:["#a77a65","#fbf4e8"],night:["#686b9d","#f5f3ff"],gothic:["#655261","#f8f3f7"],kitsch:["#d75f87","#fff3d8"],
strawberry:["#d95f78","#fff2f4"],peach:["#dd8c78","#fff5ef"],cherry:["#b9425c","#fff3f5"],lavender:["#9884c3","#f8f4ff"],lilac:["#b282b7","#fff5ff"],sky:["#75a8c7","#f3fbff"],mint:["#6fae9b","#f1fcf8"],sage:["#87977a","#f7f8ef"],lemon:["#c6a63b","#fffbea"],cream:["#b58b68","#fffaf0"],mocha:["#80665b","#f7f0eb"],wine:["#8f4058","#fff4f6"],navy:["#405776","#f4f7fb"],mono:["#595959","#fafafa"],blackpink:["#d46f98","#fff4f8"]};
function escFile(s){return (s||"둘만의 티켓").replace(/[\\/:*?"<>|]/g,"").trim()}
function autoNo(){
 const d=$("date").value.replaceAll("-","").slice(2)||new Date().toISOString().slice(2,10).replaceAll("-","");
 return d+"-01";
}

function applyPhotoShape(){
 const shape=$("photoShape").value;
 const styles={
  circle:{radius:"50%",clip:"none",border:"3px double var(--main)"},
  square:{radius:"0",clip:"none",border:"3px double var(--main)"},
  rounded:{radius:"20px",clip:"none",border:"3px double var(--main)"},
  heart:{radius:"0",clip:"polygon(50% 92%,12% 57%,5% 34%,9% 18%,21% 8%,36% 8%,50% 21%,64% 8%,79% 8%,91% 18%,95% 34%,88% 57%)",border:"0"},
  diamond:{radius:"0",clip:"polygon(50% 0,100% 50%,50% 100%,0 50%)",border:"0"},
  arch:{radius:"48px 48px 8px 8px",clip:"none",border:"3px double var(--main)"},
  stamp:{radius:"2px",clip:"none",border:"5px dotted var(--main)"}
 }[shape]||{};
 ["photoPreviewA","photoPreviewB"].forEach(id=>{
   const el=$(id);el.style.borderRadius=styles.radius;el.style.clipPath=styles.clip;el.style.webkitClipPath=styles.clip;el.style.border=styles.border;
   const im=el.querySelector("img");if(im){im.style.borderRadius=styles.radius;im.style.clipPath=styles.clip;im.style.webkitClipPath=styles.clip}
 });
}


const TICKET_TYPES=["love","cinema","train","flight","concert","admission"];
function applyTicketType(){
 const ticket=$("ticket");
 const type=$("ticketType").value||"love";
 TICKET_TYPES.forEach(t=>ticket.classList.remove("type-"+t));
 ticket.classList.add("type-"+type);
 if($("stubLabel"))$("stubLabel").textContent=typeMeta[type]||"PAIR PASS";
 if($("previewTypeName"))$("previewTypeName").textContent=$("ticketType").selectedOptions[0].textContent;
}

function render(){requestAnimationFrame(fitTicketPreview);
 const a=$("nameA").value.trim()||"A",b=$("nameB").value.trim()||"B",p=$("pairName").value.trim()||`${a} × ${b}`;
 const no=$("ticketNo").value.trim()||autoNo(), deco=decoMap[$("deco").value];
 $("photoNameA").textContent=a;$("photoNameB").textContent=b;$("pairText").textContent=p;$("stubPair").textContent=p;
 $("typeText").textContent=$("ticketType").selectedOptions[0].text;$("noText").textContent="NO. "+no;$("stubNo").textContent=no;
 $("fromText").textContent=$("from").value||"—";$("toText").textContent=$("to").value||"—";
 $("messageText").textContent=$("message").value||" ";$("keywordsText").textContent=$("keywords").value||" ";
 $("dateText").textContent=$("date").value||"—";$("centerDeco").textContent=deco;$("stubDeco").textContent=deco;
 const ticket=$("ticket"),type=$("ticketType").value,shape=$("photoShape").value;
 ticket.style.setProperty("--main",$("mainColor").value);ticket.style.setProperty("--paper",$("paperColor").value);
 ticket.classList.toggle("portrait",$("orientation").value==="portrait");ticket.classList.toggle("landscape",$("orientation").value==="landscape");
 applyTicketType();
 ["circle","square","rounded","heart","diamond","arch","stamp"].forEach(x=>ticket.classList.toggle("photo-shape-"+x,x===shape));
 applyPhotoShape();

 $("dearlySign").style.display=$("signature").checked?"block":"none";saveState();
}
ids.forEach(id=>{const el=$(id);if(el){el.addEventListener("input",render);el.addEventListener("change",render)}});$("signature").addEventListener("change",render);
$("ticketType").onchange=()=>{applyTicketType();render();};
$("photoShape").onchange=()=>{applyPhotoShape();render();};

/* Canvas crop editor: opens modal first, measures only after visible, then renders from source image. */
const crop={
 modal:$("cropModal"),stage:$("cropStage"),canvas:$("cropCanvas"),ctx:$("cropCanvas").getContext("2d"),
 zoom:$("cropZoom"),status:$("cropStatus"),img:null,target:null,source:"",scale:1,minScale:1,x:0,y:0,
 dragging:false,lastX:0,lastY:0
};
function cropCanvasSize(){
 const r=crop.stage.getBoundingClientRect();
 const css=Math.max(280,Math.round(Math.min(r.width||420,r.height||420)));
 const dpr=Math.min(window.devicePixelRatio||1,2);
 crop.canvas.width=Math.round(css*dpr);crop.canvas.height=Math.round(css*dpr);
 crop.canvas.style.width=css+"px";crop.canvas.style.height=css+"px";
 return {css,dpr};
}
function clampCrop(){
 if(!crop.img)return;
 const W=crop.canvas.width,H=crop.canvas.height,iw=crop.img.naturalWidth*crop.scale,ih=crop.img.naturalHeight*crop.scale;
 const minX=Math.min(0,W-iw),minY=Math.min(0,H-ih);
 crop.x=Math.max(minX,Math.min(0,crop.x));crop.y=Math.max(minY,Math.min(0,crop.y));
}
function drawCrop(){
 if(!crop.img)return;
 const c=crop.canvas,ctx=crop.ctx;ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#f4e9ed";ctx.fillRect(0,0,c.width,c.height);
 clampCrop();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
 ctx.drawImage(crop.img,crop.x,crop.y,crop.img.naturalWidth*crop.scale,crop.img.naturalHeight*crop.scale);
 crop.status.textContent=`원본 ${crop.img.naturalWidth}×${crop.img.naturalHeight} · 크롭 ${c.width}×${c.height} · 확대 ${Number(crop.zoom.value).toFixed(2)}×`;
}
function resetCrop(){
 if(!crop.img)return;
 const W=crop.canvas.width,H=crop.canvas.height;
 crop.minScale=Math.max(W/crop.img.naturalWidth,H/crop.img.naturalHeight);
 crop.zoom.value="1";crop.scale=crop.minScale;
 crop.x=(W-crop.img.naturalWidth*crop.scale)/2;crop.y=(H-crop.img.naturalHeight*crop.scale)/2;drawCrop();
}
function openCrop(file,target){
 if(!file||!file.type.startsWith("image/"))return alert("이미지 파일을 선택해 주세요.");
 const reader=new FileReader();
 reader.onerror=()=>alert("이미지 파일을 읽지 못했어요.");
 reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>alert("선택한 이미지를 불러오지 못했어요.");
   img.onload=()=>{
     crop.img=img;crop.target=target;crop.source=reader.result;
     crop.modal.hidden=false;document.body.classList.add("crop-open");
     requestAnimationFrame(()=>requestAnimationFrame(()=>{cropCanvasSize();resetCrop()}));
   };
   img.src=reader.result;
 };
 reader.readAsDataURL(file);
}
function closeCrop(){crop.modal.hidden=true;document.body.classList.remove("crop-open");crop.dragging=false}
crop.zoom.addEventListener("input",()=>{
 if(!crop.img)return;
 const old=crop.scale,newScale=crop.minScale*Number(crop.zoom.value),cx=crop.canvas.width/2,cy=crop.canvas.height/2;
 const ix=(cx-crop.x)/old,iy=(cy-crop.y)/old;crop.scale=newScale;crop.x=cx-ix*newScale;crop.y=cy-iy*newScale;drawCrop();
});
function pointerPos(e){const r=crop.canvas.getBoundingClientRect(),sx=crop.canvas.width/r.width,sy=crop.canvas.height/r.height;return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy}}
crop.stage.addEventListener("pointerdown",e=>{if(!crop.img)return;crop.dragging=true;crop.stage.classList.add("dragging");crop.stage.setPointerCapture(e.pointerId);const p=pointerPos(e);crop.lastX=p.x;crop.lastY=p.y});
crop.stage.addEventListener("pointermove",e=>{if(!crop.dragging)return;const p=pointerPos(e);crop.x+=p.x-crop.lastX;crop.y+=p.y-crop.lastY;crop.lastX=p.x;crop.lastY=p.y;drawCrop()});
function endDrag(){crop.dragging=false;crop.stage.classList.remove("dragging")}
crop.stage.addEventListener("pointerup",endDrag);crop.stage.addEventListener("pointercancel",endDrag);
$("cropReset").onclick=resetCrop;$("cropCancel").onclick=closeCrop;$("cropClose").onclick=closeCrop;
crop.modal.addEventListener("click",e=>{if(e.target===crop.modal)closeCrop()});
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!crop.modal.hidden)closeCrop()});
$("cropApply").onclick=()=>{
 if(!crop.img||!crop.target)return;
 /* Export a bounded 900×900 JPEG to avoid localStorage quota explosions from huge originals. */
 const out=document.createElement("canvas");out.width=1400;out.height=1400;
 const ctx=out.getContext("2d");ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
 const sx=-crop.x/crop.scale,sy=-crop.y/crop.scale,sw=crop.canvas.width/crop.scale,sh=crop.canvas.height/crop.scale;
 ctx.drawImage(crop.img,sx,sy,sw,sh,0,0,1400,1400);
 const data=out.toDataURL("image/jpeg",0.96),preview=crop.target.preview,input=crop.target.input;
 preview.innerHTML="";const im=document.createElement("img");im.src=data;im.alt="";preview.appendChild(im);preview.classList.remove("photo-placeholder");
 try{localStorage.setItem("dearly_ticket_"+input.id,data)}catch(e){console.warn("photo storage failed",e)}
 closeCrop();render();applyPhotoShape();
};
function photo(input,preview){
 input.addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];input.value="";if(f)openCrop(f,{input,preview})});
}
photo($("photoA"),$("photoPreviewA"));photo($("photoB"),$("photoPreviewB"));
document.querySelectorAll("#presets button").forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll("#presets button").forEach(x=>x.classList.remove("on"));btn.classList.add("on");
 const t=btn.dataset.theme,[m,p]=themes[t];$("mainColor").value=m;$("paperColor").value=p;
 [...$("ticket").classList].filter(c=>c.startsWith("theme-")).forEach(c=>$("ticket").classList.remove(c));$("ticket").classList.add("theme-"+t);render()
});
$("randomize").onclick=()=>{
 const ks=Object.keys(themes),t=ks[Math.floor(Math.random()*ks.length)],ds=Object.keys(decoMap);
 document.querySelector(`#presets button[data-theme="${t}"]`).click();
 $("deco").value=ds[Math.floor(Math.random()*ds.length)];render();
};
$("reset").onclick=()=>{if(!confirm("티켓 내용을 초기화할까요?"))return;localStorage.removeItem("dearly_pair_ticket_v1");localStorage.removeItem("dearly_ticket_photoA");localStorage.removeItem("dearly_ticket_photoB");location.reload()};
$("save").onclick=async()=>{
 const c=await html2canvas($("capture"),{scale:4,backgroundColor:null,useCORS:true});
 const a=document.createElement("a");a.download=makeTicketFilename();a.href=c.toDataURL("image/png");a.click()
};
function saveState(){try{const d={};ids.forEach(id=>d[id]=$(id).value);d.signature=$("signature").checked;localStorage.setItem("dearly_pair_ticket_v1",JSON.stringify(d))}catch{}}
function restore(){
 try{const d=JSON.parse(localStorage.getItem("dearly_pair_ticket_v1")||"null");if(d){ids.forEach(id=>{if(d[id]!=null)$(id).value=d[id]});$("signature").checked=d.signature!==false}
 ["A","B"].forEach(x=>{const s=localStorage.getItem("dearly_ticket_photo"+x),p=$("photoPreview"+x);if(s){p.innerHTML=`<img src="${s}" alt="">`;p.classList.remove("photo-placeholder")}})
 }catch{}
}
if(!$("date").value)$("date").value=new Date().toISOString().slice(0,10);restore();
function fitTicketPreview(){
  const ticket=document.getElementById("ticket");
  const capture=document.getElementById("capture");
  if(!ticket||!capture)return;
  ticket.style.transform="";
  ticket.style.marginBottom="";
  if(window.innerWidth>850)return;
  const available=Math.max(240,capture.clientWidth-20);
  const natural=ticket.classList.contains("portrait")?430:720;
  const scale=Math.min(1,available/natural);
  const naturalHeight=ticket.offsetHeight;
  ticket.style.transform=`scale(${scale})`;
  ticket.style.marginBottom=`${naturalHeight*(scale-1)}px`;
}
window.addEventListener("resize",()=>requestAnimationFrame(fitTicketPreview));

render();applyPhotoShape();