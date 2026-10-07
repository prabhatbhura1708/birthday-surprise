const screens=[...document.querySelectorAll(".screen")];
const back=document.getElementById("back"), nextNav=document.getElementById("nextNav");
const progress=document.getElementById("progress"), musicBtn=document.getElementById("musicBtn");
let step=0, player=null, playerReady=false, started=false, playing=false;

function render(dir=1){
  screens.forEach((s,i)=>{
    s.classList.toggle("active",i===step);
  });
  back.disabled=step===0;
  nextNav.disabled=step===screens.length-1;
  progress.style.width=((step)/(screens.length-1)*100)+"%";
  document.title=step===screens.length-1?"Happy Birthday, Akanksha ✨":"For Akanksha — A Birthday Memory";
}
function go(delta){
  const target=Math.max(0,Math.min(screens.length-1,step+delta));
  if(target===step)return;
  step=target;render(delta);
}
document.querySelectorAll(".next").forEach(b=>b.addEventListener("click",()=>{startMusic();go(1)}));
nextNav.addEventListener("click",()=>{startMusic();go(1)});
back.addEventListener("click",()=>go(-1));
document.querySelector(".replay").addEventListener("click",()=>{step=0;render(-1);window.scrollTo(0,0)});

function loadYouTube(){
  if(document.getElementById("youtube-api"))return;
  const s=document.createElement("script");s.id="youtube-api";s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);
}
window.onYouTubeIframeAPIReady=function(){
  player=new YT.Player("player",{
    height:"1",width:"1",videoId:"n0VNjUNjB-g",
    playerVars:{autoplay:0,controls:0,loop:1,playlist:"n0VNjUNjB-g",playsinline:1},
    events:{onReady:e=>{playerReady=true;if(started)playMusic()}}
  });
};
function startMusic(){started=true;loadYouTube();if(playerReady)playMusic()}
function playMusic(){try{player.setVolume(45);player.playVideo();playing=true;musicBtn.textContent="♫";}catch(e){}}
musicBtn.addEventListener("click",()=>{
  if(!playerReady){startMusic();return}
  if(playing){player.pauseVideo();playing=false;musicBtn.textContent="Ⅱ"}else{playMusic()}
});
document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")go(1);if(e.key==="ArrowLeft")go(-1)});
render();
