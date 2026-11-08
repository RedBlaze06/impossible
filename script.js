const $ = id => document.getElementById(id);
const arena = $("arena");
const target = $("target");
let level = 1, score = 0, record = Number(localStorage.getItem("boutonRecord") || 1);
let required = 5, fakeButtons = [], chaosTimer = null;

const messages = [
  "Bien. Maintenant recommence. Plus longtemps.",
  "Tu pensais que ça allait être facile ? Adorable.",
  "Le bouton a demandé un avocat.",
  "Erreur : tu progresses. Nous allons corriger ça.",
  "Félicitations. C'était inutile, mais félicitations.",
  "Le développeur nie toute responsabilité.",
  "Tu es encore là ? Le bouton aussi.",
  "Nouveau niveau, mêmes problèmes."
];
const rules = [
  "Règle : clique sur le bouton vert.",
  "Règle : le bouton bouge. Évidemment.",
  "Règle : méfie-toi des imposteurs rouges.",
  "Règle : le bouton peut changer d'avis.",
  "Règle : certains clics ne comptent pas. Surprise."
];

function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function place(el){
  const maxX = Math.max(0, arena.clientWidth - el.offsetWidth - 8);
  const maxY = Math.max(0, arena.clientHeight - el.offsetHeight - 8);
  el.style.left = rand(8,maxX) + "px";
  el.style.top = rand(8,maxY) + "px";
}
function update(){
  $("level").textContent = level.toLocaleString("fr-FR");
  $("score").textContent = `${score} / ${required}`;
  $("record").textContent = record.toLocaleString("fr-FR");
  const pct = Math.min(100, score / required * 100);
  $("progressBar").style.width = pct + "%";
  $("progressText").textContent = Math.floor(pct) + "%";
  $("annoyance").textContent = `Mauvaise foi : ${level}/∞`;
}
function clearFakes(){fakeButtons.forEach(b=>b.remove());fakeButtons=[]}
function spawnFake(){
  if(level < 3 || fakeButtons.length >= Math.min(5, 1 + Math.floor(level/4))) return;
  const b=document.createElement("button");
  b.className="fake"; b.textContent=["PAS MOI","VRAI BOUTON","CLIQUE ICI","PROMIS"][rand(0,3)];
  b.addEventListener("click",()=>{
    score=Math.max(0,score-rand(1,Math.max(1,Math.ceil(level/3))));
    $("message").textContent="HAHA. C'ÉTAIT UN FAUX. Tu perds des points.";
    arena.classList.remove("shake"); void arena.offsetWidth; arena.classList.add("shake");
    b.remove(); fakeButtons=fakeButtons.filter(x=>x!==b); update();
  });
  arena.appendChild(b); fakeButtons.push(b); place(b);
}
function moveTarget(){
  place(target);
  if(Math.random()<Math.min(.65,.12+level*.012)) spawnFake();
}
function nextLevel(){
  level++; score=0;
  required = 5 + level*2 + Math.floor(Math.pow(level,1.35));
  record=Math.max(record,level);
  localStorage.setItem("boutonRecord",record);
  clearFakes();
  $("message").textContent=messages[rand(0,messages.length-1)];
  $("rule").textContent=rules[rand(0,rules.length-1)];
  target.textContent=["CLIQUE-MOI","ATTRAPE-MOI","TU PEUX PAS","ESSAIE ENCORE","PRESQUE"][rand(0,4)];
  update(); moveTarget();
  // À partir de certains niveaux, le jeu se permet de tricher davantage.
  if(level%5===0) setTimeout(()=>{score=Math.max(0,score-1);$("message").textContent="Le jeu vient de te voler un point. Bonne continuation.";update()},900);
}
target.addEventListener("click",()=>{
  score++;
  $("message").textContent=["Touché.","Un clic. Quelle performance.","Le bouton est vexé.","Continue, malheureusement."][rand(0,3)];
  if(Math.random()<Math.min(.5,level*.008)) score=Math.max(0,score-1);
  if(score>=required){nextLevel();return}
  update(); moveTarget();
});
target.addEventListener("pointerenter",()=>{
  if(level>=2 && Math.random()<Math.min(.75,.18+level*.015)) moveTarget();
});
$("reset").addEventListener("click",()=>{
  if(!confirm("Effacer ton niveau et ton record local ?")) return;
  level=1;score=0;required=5;record=1;
  localStorage.removeItem("boutonRecord");clearFakes();
  $("message").textContent="Retour au début. Tu as vraiment cliqué pour ça ?";
  $("rule").textContent=rules[0];target.textContent="CLIQUE-MOI";update();moveTarget();
});
window.addEventListener("resize",moveTarget);
update();moveTarget();
