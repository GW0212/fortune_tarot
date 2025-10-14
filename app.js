
const $ = (s)=>document.querySelector(s);

function clearInvalid(...els){ els.forEach(e=> e && e.classList.remove("input-invalid")); }
function markInvalid(el){ if(!el) return; el.classList.add("input-invalid"); el.scrollIntoView({behavior:"smooth",block:"center"}); el.focus({preventScroll:true}); }
function resetAll(){
  // hide & clear outputs/boards to prevent ghost empty panels
  const ids = ["#d_out","#f_out","#t_board","#tarotBoard","#tarotDetail"];
  ids.forEach(sel=>{
    const el = $(sel);
    if(!el) return;
    if(sel==="#t_board" || sel==="#d_out" || sel==="#f_out"){ el.classList.add("hidden"); }
    if(el.id!=="t_board") el.innerHTML="";
  });
  // reset all inputs
  ["#d_name","#d_birth","#d_time","#d_gender","#d_focus","#f_name","#f_birth","#f_time","#f_domain","#f_ctx","#t_name","#t_birth","#t_q"].forEach(sel=>{
    const el=$(sel);
    if(!el) return;
    if(el.tagName==="SELECT"){ el.selectedIndex=0; } else { el.value=""; }
  });
}

function show(route){ 
  ["home","daily","full","tarot"].forEach(id=>$("#"+id)?.classList.add("hidden")); 
  $("#"+route)?.classList.remove("hidden"); 
  if(route==="home"){ resetAll(); }
  window.scrollTo({top:0,behavior:"smooth"}); 
}
document.querySelectorAll("[data-route]").forEach(b=> b.addEventListener("click", e=> show(e.currentTarget.getAttribute("data-route"))));
$("#title-home")?.addEventListener("click", ()=>show("home"));

// theme
let light=false;
$("#toggle-theme")?.addEventListener("click", ()=>{
  light=!light;
  document.body.classList.toggle('light', light);
});

// today
(function(){ try{ const t=$("#today"); const s=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date()); if(t) t.textContent=s; }catch(e){} })();

// rng + helpers
function xmur3(str){ for(var i=0,h=1779033703^str.length;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return function(){ h=Math.imul(h^(h>>>16),2246822507); h=Math.imul(h^(h>>>13),3266489909); return (h^=h>>>16)>>>0; }; }
function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}}
function seed(name){ const s=xmur3(name)(); return mulberry32(s); }

const LABEL_KR={love:"연애",wealth:"금전",work:"커리어",health:"건강",luck:"행운"};
function kpi(label,val){ return `<div class="kpi"><h4>${label} <span class="small">(${val}점)</span></h4><div class="bar"><span style="width:${val}%"></span></div></div>`; }
function zodiac(dateStr){
  if(!dateStr) return "Unknown";
  const d=new Date(dateStr+"T12:00:00");
  const m=d.getUTCMonth()+1, day=d.getUTCDate();
  const ranges=[["염소",12,22,1,19],["물병",1,20,2,18],["물고기",2,19,3,20],["양",3,21,4,19],["황소",4,20,5,20],["쌍둥이",5,21,6,21],["게",6,22,7,22],["사자",7,23,8,22],["처녀",8,23,9,22],["천칭",9,23,10,22],["전갈",10,23,11,21],["사수",11,22,12,21]];
  for(const [name,sm,sd,em,ed] of ranges){
    if((m===sm && day>=sd) || (m===em && day<=ed) || (m>sm && m<em) || (sm>em && (m>sm || m<em))){ return name; }
  }
  return "염소";
}
function zodiacKorean(dateStr){
  if(!dateStr) return "Unknown";
  const y=new Date(dateStr+"T12:00:00").getUTCFullYear();
  const animals=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  const idx=(y-4)%12; return animals[(idx+12)%12];
}
function lifePath(dateStr){
  if(!dateStr) return 0;
  const nums=dateStr.replaceAll("-","").split("").map(Number);
  const sum=(arr)=>arr.reduce((a,b)=>a+b,0);
  let n=sum(nums);
  const master=(x)=>x===11||x===22||x===33;
  while(n>9&&!master(n)){ n=sum(n.toString().split("").map(Number)); }
  return n;
}

/* ===================== Tarot ===================== */
function buildDeck(){
  const majors=["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"];
  const majorUp=["새 출발·자유","의지·실행","직관·비밀","풍요·창조","질서·통제","전통·학습","선택·조화","전진·의지","용기·인내","탐구·통찰","전환·기회","균형·공정","관점 전환·수용","끝·재생","조화·절제","집착·유혹","붕괴·각성","희망·회복","무의식·불확실","성장·낙관","평가·부름","완성·통합"];
  const majorRev=["경솔·준비 부족","속임·산만","혼란·닫힌 마음","과잉·의존","경직·권위주의","고집·형식적","불일치·유혹","폭주·불균형","불안·충동","고립·독단","변동·불안정","불공정·치우침","지연·희생","저항·정체","과함·불균형","충격·혼란","비관·소진","오해·불안","지연·과신","집착·두려움","미완·회수"];
  const deck=[];
  for(let i=0;i<22;i++){ deck.push({id:`M${i}`, title:majors[i], up:majorUp[i], rev:majorRev[i], type:"major", svg:`<text x='12' y='14' text-anchor='middle' font-size='8' fill='currentColor'>${i}</text>`}); }
  const suits=[["Wands","열정·행동","불의 원소","M4 20L12 4l8 16"],["Cups","감정·관계","물의 원소","M4 6h16l-2 6a8 8 0 0 1-12 0L4 6z"],["Swords","사고·결단","공기의 원소","M12 3v18m-5-5l10-10m-10 0 10 10"],["Pentacles","물질·현실","흙의 원소","M12 4l3 8H9l3-8zm0 0l-5 12h10L12 4z"]];
  const ranks=[["Ace","시작"],["2","교류"],["3","성장"],["4","안정"],["5","갈등"],["6","회복"],["7","도전"],["8","집중"],["9","지속"],["10","완수"],["Page","탐색"],["Knight","추진"],["Queen","돌봄"],["King","통솔"]];
  suits.forEach((s,si)=>{
    ranks.forEach((r,ri)=>{
      const title=`${r[0]} of ${s[0]}`;
      deck.push({id:`m${si}_${ri}`, title, up:`${s[1]} · ${r[1]}`, rev:`지연·과함·균형 재조정`, suit:s[0], suitKR:s[1], element:s[2], rank:r[0], rankKR:r[1], type:"minor", svg:`<path d='${s[3]}' stroke='currentColor' fill='none'/>`});
    });
  });
  return deck;
}
const FULL_DECK=buildDeck();

// Detail text generator
const MAJOR_DETAIL={
  "The Fool": {good:"모험을 두려워하지 않는 용기, 기존 틀에서 벗어난 창의력.", bad:"충동적인 선택, 준비 부족으로 인한 실수.", tip:"새 일은 작게 테스트하고 배우면서 범위를 넓히세요. 서류·예산·스케줄 같은 기본 체크리스트를 먼저 채우면 모험이 안정됩니다."},
  "The Magician": {good:"의지와 실행력이 강하고, 자원을 연결해 결과를 내는 힘.", bad:"말뿐이 되거나, 산만함으로 목표가 흐려질 수 있음.", tip:"오늘은 한 목표를 문장 하나로 정의하고(예: ‘제안서 1페이지 완성’) 그 일에 필요한 도구만 탁자에 남겨 집중하세요."},
  "The High Priestess": {good:"뛰어난 직관, 숨은 정보에 대한 감각.", bad:"감정에 치우쳐 확인 없이 판단할 위험.", tip:"결정 전에 ‘증거 2개’를 반드시 수집하세요. 메모로 감정과 사실을 분리하면 오판을 줄일 수 있습니다."},
  "The Empress": {good:"풍요·보살핌·창조적 생산성.", bad:"과잉 돌봄·과소비·느슨함.", tip:"결과물을 ‘보이는 형태’로 남기세요(초안·시안·샘플). 완성도보다 지속성이 오늘의 승부처입니다."},
  "The Emperor": {good:"질서·규칙·책임감·리더십.", bad:"경직·권위주의·융통성 부족.", tip:"규칙은 ‘3개’만. 오늘 꼭 지킬 기준을 간결하게 정하고 나머지는 유연하게 조정하세요."},
  "The Hierophant": {good:"전통·멘토링·학습과 규범.", bad:"형식주의·고집.", tip:"‘검증된 방식 1개’를 빌려 쓰세요. 문서 양식·체크리스트·사례 연구가 시행착오를 줄입니다."},
  "The Lovers": {good:"선택의 조화, 관계의 협력.", bad:"우유부단, 외부 기대에 휘둘림.", tip:"가치 기준 2가지를 정렬하세요(예: 시간/신뢰). 그 기준으로 선택하면 후회가 줄어듭니다."},
  "The Chariot": {good:"전진·집중·의지의 승리.", bad:"무리한 돌파, 주변을 놓침.", tip:"목표를 구간으로 자르고 각 구간마다 ‘도착 신호’를 만드세요. 신호마다 짧게 숨 고르면 과열을 예방합니다."},
  "Strength": {good:"침착한 용기와 인내, 감정 조절.", bad:"억누른 감정이 폭발할 위험.", tip:"호흡·걷기·짧은 스트레칭으로 신체 리듬을 먼저 안정시키고 대화를 시작하세요."},
  "The Hermit": {good:"통찰·집중·깊은 분석.", bad:"고립·독단.", tip:"혼자 파고들되, 마지막 10분은 믿을 만한 1인에게 검토를 받으세요."},
  "Wheel of Fortune": {good:"흐름 전환, 기회의 바람.", bad:"예측 불가, 운에만 기대는 태도.", tip:"오른 흐름을 ‘작은 실험’으로 붙잡으세요. 실패해도 손실이 작도록 가설을 작게 쪼개세요."},
  "Justice": {good:"균형·공정·명확한 원칙.", bad:"과도한 흑백논리, 융통성 부족.", tip:"사실/해석/감정을 3열 표로 나눠 기록하세요. 논점이 깨끗해집니다."},
  "The Hanged Man": {good:"관점 전환, 멈춤 속 통찰.", bad:"지연·희생의 피로.", tip:"중요하지 않은 일을 과감히 ‘보류’로 넘기세요. 여백이 새로운 해결책을 부릅니다."},
  "Death": {good:"불필요한 것의 종료, 재시작.", bad:"변화에 대한 저항.", tip:"끝낼 목록을 3개만 적고 오늘 한 가지를 실제로 닫으세요. 공간이 열리면 새 기회가 들어옵니다."},
  "Temperance": {good:"절제·조화·리듬 감각.", bad:"애매한 타협, 흐릿한 목표.", tip:"작업 리듬을 25–40분 집중/5–10분 회복으로 분할하세요. 에너지 파동이 안정됩니다."},
  "The Devil": {good:"강한 몰입·물질적 성취 욕구.", bad:"집착·중독·관계의 거래화.", tip:"오늘 하루만 ‘없어도 되는 자극(과자·SNS·과음)’을 1개 끊고 그 시간으로 핵심 행동을 채우세요."},
  "The Tower": {good:"숨은 문제의 드러남, 각성.", bad:"예상 밖의 충격, 체계 붕괴.", tip:"문제가 보이면 즉시 ‘피해 최소화 3단계(알림→격리→대안)’로 대응하세요."},
  "The Star": {good:"회복·희망·장기 비전.", bad:"막연한 낙관, 현재 회피.", tip:"미래 그림을 1문단으로 적고, 오늘 그중 ‘가장 작은 한 걸음’을 실행하세요."},
  "The Moon": {good:"상상력·무의식의 신호.", bad:"오해·불안·가짜 정보.", tip:"소문은 보류. 원자료·원출처만 확인하고, 감정은 10분 뒤 기록해 판단하세요."},
  "The Sun": {good:"성장·낙관·성과의 표출.", bad:"과신·무모함.", tip:"성과를 공개하되 수치/사실로 말하세요. 칭찬은 팀과 나눌수록 효과가 커집니다."},
  "Judgement": {good:"평가·부름·갱신의 기회.", bad:"완벽주의·자책.", tip:"과거 결정에서 배운 1가지를 기록하고, 오늘의 기준을 1문장으로 새로 세우세요."},
  "The World": {good:"완성·통합·순환의 마침표.", bad:"끝맺음 미루기.", tip:"마무리 체크리스트로 ‘완료’를 선언하세요. 배포·정리·감사까지 포함해 진짜 끝을 냅니다."}
};

function minorDetail(card){
  const suitGood={Wands:"추진력과 실행 속도가 붙습니다.", Cups:"관계의 따뜻함과 공감 교류가 활발해집니다.", Swords:"분석력·결단력이 선명해집니다.", Pentacles:"재정·현실 관리가 안정됩니다."};
  const suitBad={Wands:"성급함과 과로, 충동적 언행에 주의.", Cups:"정서적 의존·감정 기복이 커질 수 있음.", Swords:"말의 날카로움·과도한 비판 경계.", Pentacles:"과소비·집착·변화 저항이 늘 수 있음."};
  const rankHints={
    "Ace":"새 시작의 불꽃을 살리되, 범위를 작게 잡으세요.",
    "2":"협력과 균형, 선택의 고민을 데이터로 정리하세요.",
    "3":"초기 성과가 보이니 꾸준히 키우세요.",
    "4":"기본기·안정화가 핵심. 구조를 정비하세요.",
    "5":"잡음·경쟁을 룰로 관리하세요.",
    "6":"회복/호응의 흐름. 감사 표현이 약을 씁니다.",
    "7":"도전의식 OK, 근거와 체력 분배를 챙기세요.",
    "8":"집중 구간이 열림. 방해요소를 차단하세요.",
    "9":"지속·버팀. 마무리 전까지 페이스 유지.",
    "10":"완수의 시점. 정리·이관까지 책임지세요.",
    "Page":"탐색·학습이 해답. 질문을 많이 하세요.",
    "Knight":"속도와 추진, 안전장치 병행.",
    "Queen":"돌봄·조율·내적 안정이 해결책입니다.",
    "King":"판단과 책임. 기준을 분명히 제시하세요."
  };
  const g=suitGood[card.suit]||""; const b=suitBad[card.suit]||""; const r=rankHints[card.rank]||"";
  return {good:`${g}`, bad:`${b}`, tip:`${r}`};
}

function adviceByPosition(pos,reversed){
  const base = [
    ["과거(원인)","이 카드가 보여준 배경을 인정하고, 오늘은 같은 패턴을 반복하지 않도록 한 가지 규칙을 세우세요."],
    ["현재(상황)","지금의 흐름을 활용할 현실적인 한 걸음을 정하고 바로 실행하세요."],
    ["조언(다음 행동)","실행 후 기록을 남겨 내일의 선택 기준을 더 명확히 하세요."]
  ];
  const msg = base[pos][1];
  return reversed ? (msg+" 다만 역방향 신호가 있으니 무리하지 말고 안전장치를 먼저 준비하세요.") : msg;
}

function buildDetailHTML(card, reversed, posIdx){
  let good="", bad="", tip="";
  if(card.type==="major"){
    const d=MAJOR_DETAIL[card.title]||{good:card.up,bad:card.rev,tip:"핵심만 좁혀 오늘 한 걸음을 실행하세요."};
    good=d.good; bad=d.bad; tip=d.tip;
  }else{
    const d=minorDetail(card); good=d.good; bad=d.bad; tip=d.tip;
  }
  const posNames=["과거(원인)","현재(상황)","조언(다음 행동)"];
  const header=`<div class="row"><span class="badge">${posNames[posIdx]}</span><span class="badge">${reversed?"역방향":"정방향"}</span></div><h3 style="margin:6px 0">${card.title}</h3>`;
  const advice = adviceByPosition(posIdx,reversed);
  const polarity = reversed ? "<em class='small'>※ 역방향: 에너지가 왜곡되기 쉬운 날입니다. 좋은 면은 약해지고, 나쁜 면은 과장될 수 있어요.</em>" : "<em class='small'>※ 정방향: 카드의 장점이 비교적 깨끗하게 드러납니다.</em>";
  return `${header}
  <div class="tarot-detail">
    <p>${polarity}</p>
    <p><strong>좋은 점</strong>: ${good}</p>
    <p><strong>주의할 점</strong>: ${bad}</p>
    <p><strong>오늘의 조언</strong>: ${tip}</p>
    <div class="divider"></div>
    <p class="small">${advice}</p>
  </div>`;
}

// deck + deterministic draw
function drawThreeDeterministic(name,birth,question){
  const r=seed([name,birth,question,'full-78'].join('|'));
  const idxs=[...Array(FULL_DECK.length).keys()];
  for(let i=idxs.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const tmp=idxs[i]; idxs[i]=idxs[j]; idxs[j]=tmp; }
  return [FULL_DECK[idxs[0]], FULL_DECK[idxs[1]], FULL_DECK[idxs[2]]];
}

$("#t_run")?.addEventListener("click", ()=>{
  const name=$("#t_name").value.trim(), birth=$("#t_birth").value, question=$("#t_q").value.trim();
  const board=$("#t_board"); const container=$("#tarotBoard"); const detail=$("#tarotDetail");
  if(!name || !birth || !question){
    board.classList.remove("hidden");
    container.innerHTML='<div class="small" style="color:#ff8a8a">필수 선택 사항을 선택 해주세요.</div>'; detail.innerHTML=''; return;
  }
  const cards=drawThreeDeterministic(name,birth,question);
  container.innerHTML=""; detail.innerHTML=""; board.classList.remove("hidden");
  const positions=["과거(원인)","현재(상황)","조언(다음 행동)"];
  cards.forEach((c,idx)=>{
    const reversed = seed([c.id,idx,name,birth,question].join('|'))()>0.5;
    const el=document.createElement("div"); el.className="tarot"; el.dataset.locked="0";
    el.innerHTML=`<div class="inner">
      <div class="face back"><svg width="90" height="90" viewBox="0 0 24 24" fill="none">${c.svg}</svg></div>
      <div class="face front"><div class="row"><span class="badge">${positions[idx]}</span><span class="badge">${reversed?"역방향":"정방향"}</span></div><h4>${c.title}</h4><div class="small">클릭하면 상세 해설이 아래에 표시됩니다.</div></div>
    </div>`;
    el.addEventListener("click", ()=>{
      if(el.dataset.locked!=="1"){ el.classList.add("flipped"); el.dataset.locked="1"; el.style.cursor="default"; }
      const html=buildDetailHTML(c, reversed, idx);
      detail.innerHTML=`<div class="panel">${html}</div>`;
      detail.scrollIntoView({behavior:"smooth",block:"center"});
    });
    container.appendChild(el);
  });
});

// ===== Daily & Full (kept minimal from v12k) =====


// ===== Life Path helper =====
function lifePathMeaning(n){
  const M = {
    1: ["독립, 개척", "당신의 결단과 추진이 주변에 용기를 나눠줘요. 작은 시작에도 의미가 큽니다."],
    2: ["협력, 조율", "갈등을 부드럽게 풀어내는 재능. 오늘의 키워드는 '함께'입니다."],
    3: ["표현, 창의", "아이디어와 유머가 분위기를 밝힙니다. 결과보다 과정의 즐거움을 챙기세요."],
    4: ["기반, 성실", "탄탄한 구조가 축복입니다. 체크리스트와 루틴이 힘이 돼요."],
    5: ["변화, 자유", "새 바람이 좋은 자극이 됩니다. 작은 모험을 일상에 한 스푼!"],
    6: ["돌봄, 책임", "배려가 돌아오는 날. 나와 타인을 동시에 돌보는 균형이 포인트."],
    7: ["탐구, 통찰", "깊이 파고드는 힘. 조용한 시간 속에서 해답을 만나요."],
    8: ["성과, 실현", "리소스를 잘 묶어 결과를 내는 날. 숫자와 계획이 든든한 아군입니다."],
    9: ["완성, 나눔", "마무리와 정리가 술술. 덕분에 새로운 공간이 생겨요."],
    11: ["영감, 직관(마스터 넘버)", "섬세한 감각이 번뜩입니다. 영감을 기록해두면 곧 길이 됩니다."],
    22: ["거대 실현(마스터 넘버)", "큰 그림을 현실로 끌어오는 설계자. 작게 쪼개면 산도 옮깁니다."],
    33: ["무조건적 사랑(마스터 넘버)", "따뜻한 영향력이 주변을 감쌉니다. 스스로에게도 같은 친절을!"]
  };
  return M[n] || ["라이프패스","탄생일 숫자를 더해 얻는 성향 번호입니다. 핵심 강점을 의식하면 하루가 편안해집니다."];
}
function bindLifePathExplain(scope){
  const host = scope || document;
  host.querySelectorAll('[data-lp-help]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const n = Number(e.currentTarget.getAttribute('data-lp-help'));
      const box = host.querySelector('.lp-explain');
      if(!box) return;
      const [title, body] = lifePathMeaning(n);
      box.innerHTML = `<div class="row"><span class="badge">라이프패스 ${n}</span><span class="badge">${title}</span></div><div style="margin-top:6px">${body}</div>`;
      box.scrollIntoView({behavior:"smooth", block:"nearest"});
    }, {once:false});
  });
}

// ===== Narrative generators (warm & detailed) =====
function generateDailyNarrative(name,birth,focus,res){
  const lp = lifePath(birth);
  const [lpTitle, lpBody] = lifePathMeaning(lp);
  const scores = res.scores || {};
  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const best = entries[0] ? entries[0][0] : "핵심";
  const bestV = entries[0] ? entries[0][1] : 0;
  const worst = entries[entries.length-1] ? entries[entries.length-1][0] : null;
  const worstV = entries[entries.length-1] ? entries[entries.length-1][1] : null;
  const label = (k)=>LABEL_KR[k]||k;
  const focusText = focus ? `요즘 마음에 둔 주제는 ‘${focus}’네요. ` : "";
  const care = worst ? `반대로 <b>${label(worst)}</b>는 에너지가 예민할 수 있어요(<b>${worstV}점</b>). 속도를 한 칸만 낮추고, 오늘은 ‘경계선 지키기’를 최우선으로—내가 지킬 1가지를 종이에 적어 두세요.` : "";

  return [
    `<p><b>${name}님</b>, 오늘은 라이프패스 <b>${lp}</b> (<b>${lpTitle}</b>)의 온기가 조용히 받쳐줍니다. ${lpBody}</p>`,
    `<p>${focusText}특히 <b>${label(best)}</b>의 흐름이 좋네요(<b>${bestV}점</b>). 거창할 필요 없어요. 15분 타이머를 켜고 ‘끝이 보이는 과제’ 하나를 완수해 보세요. 작은 완수감이 오늘의 자신감을 크게 키워줍니다.</p>`,
    care ? `<p>${care}</p>` : ``,
    `<p style="margin-top:8px"><b>오늘의 루틴 제안</b></p>`,
    `<ul>
      <li><b>1분 호흡</b>: 들숨·날숨 5회. 마음의 볼륨을 2칸 낮춥니다.</li>
      <li><b>15분 집중</b>: ${label(best)}에 15분만. 끝나면 자신에게 짧은 칭찬 한 마디.</li>
      <li><b>정리 3줄</b>: 잠들기 전 오늘 잘한 1가지, 배운 1가지, 내일 첫걸음 1가지.</li>
    </ul>`,
    `<p class="small">※ 흔들리면 “괜찮아, 천천히 가도 좋아.”라고 속삭여 주세요. 오늘의 당신은 충분히 잘하고 있습니다.</p>`
  ].join("");
}


function generateFullNarrative(name,birth,domain,ctx,S,ordered){
  const lp = lifePath(birth);
  const [lpTitle, lpBody] = lifePathMeaning(lp);
  const domText = domain ? `요즘 ${domain} 쪽의 기운이 강하게 느껴집니다. ` : "";
  const ctxText = ctx ? `현재 상황은 “${ctx}”로 보이네요. ` : "";
  const top1 = ordered[0] || ["핵심", 0];
  const top2 = ordered[1] || ["보조", 0];
  const low  = ordered[ordered.length-1] || ["정비", 0];

  return [
    `<p><b>${name}님</b>, 이번 시기는 라이프패스 <b>${lp}</b> (<b>${lpTitle}</b>)의 결이 은은하게 흐르는 때예요. ${lpBody}</p>`,
    `<p>${domText}${ctxText}지금은 <b>${top1[0]}</b>(<b>${top1[1]}점</b>)의 기운이 가장 강하고, 그다음으로 <b>${top2[0]}</b>(<b>${top2[1]}점</b>)이 흐름을 도와줍니다. <b>작은 성취를 자주 쌓는 것</b>이 이 시기의 비결이에요.</p>`,
    `<p style="margin-top:8px"><b>오늘·이번 주에 도움이 되는 가이드</b></p>`,
    `<ul>
      <li><b>${top1[0]}</b>: 오늘 하루 ‘눈으로 보이는 결과’ 하나만 만들어 보세요. (예: 문서 3줄, 제출 1건, 연락 1회 등)</li>
      <li><b>${top2[0]}</b>: 기존 루틴을 꾸준히 유지하는 것만으로도 충분히 좋아요. (예: 10분 점검, 간단한 정리)</li>
      <li><b>${low[0]}</b>: 무리해서 끌어올리기보다, <b>리스크 줄이기</b>에 집중해요. (예: 마감 재확인, 예산 상한 설정)</li>
    </ul>`,
    `<p><b>셀프 케어</b>: 피곤함이 몰려오기 전에 스스로에게 ‘작은 보상’을 선물하세요. 따뜻한 차 한 잔, 짧은 산책, 좋아하는 음악 한 곡이면 충분해요. 이런 작은 여유가 근우님을 오래 버티게 해줍니다.</p>`,
    `<p class="small">💭 방향이 흐려질 때는 ‘오늘 내가 꼭 지키고 싶은 한 가지’를 메모해보세요.  
    적는 순간 마음이 맑아지고, 해야 할 일의 중심이 또렷해질 거예요.</p>`
  ].join("");
}

function computeDaily(name,birth,focus=""){
  const today=new Date().toISOString().slice(0,10);
  const r=seed([name,birth,focus,today,'daily-v10'].join('|'));
  const base=(m=40,M=95)=>Math.round(m+(M-m)*r());
  let scores={love:base(),wealth:base(),work:base(),health:base(),luck:base()};
  const entries=Object.entries(scores).sort((a,b)=>b[1]-a[1]); const top=entries[0];
  return {scores,highlight:top[0],zodiac:zodiac(birth),zodiacKor:zodiacKorean(birth),lifePath:lifePath(birth)};
}
$("#d_run")?.addEventListener("click", ()=>{
  const name=$("#d_name").value.trim(), birth=$("#d_birth").value, focus=$("#d_focus").value.trim();
  const out=$("#d_out"); clearInvalid($("#d_name"), $("#d_birth"));
  if(!name || !birth){ out.innerHTML='<div class="small" style="color:#ff8a8a">필수 선택 사항을 선택 해주세요.</div>'; out.classList.remove("hidden"); if(!name) markInvalid($("#d_name")); else markInvalid($("#d_birth")); return; }
  const res=computeDaily(name,birth,focus);
  const grid = Object.entries(res.scores).map(([k,v])=>kpi(LABEL_KR[k],v)).join("");
  out.innerHTML = `<div class="row"><span class="badge">별자리: ${res.zodiac}</span><span class="badge">띠: ${res.zodiacKor}</span><span class="badge">라이프패스: ${lifePath(birth)}</span></div>
  <div class="result" style="margin-top:10px">${grid}</div><div class="lp-explain small">${(()=>{const _lp=lifePath(birth);const _m=lifePathMeaning(_lp);return `<div class=\"row\"><span class=\"badge\">라이프패스 ${_lp}</span><span class=\"badge\">${_m[0]}</span></div><div style=\"margin-top:6px\">${_m[1]}</div>`})()}</div>
  <div class="divider"></div>
  <div class="panel"><strong>하이라이트</strong>: ${LABEL_KR[res.highlight]}</div>
  <div class="divider"></div>
  <div class="panel"><strong>상세 설명</strong><div class="small" style="margin-top:6px">${generateDailyNarrative(name,birth,focus,res)}</div></div>`;
  out.classList.remove("hidden");
  bindLifePathExplain(out);
});

$("#f_run")?.addEventListener("click", ()=>{
  const name=$("#f_name").value.trim(), birth=$("#f_birth").value, domain=$("#f_domain").value, ctx=$("#f_ctx").value.trim();
  const out=$("#f_out"); clearInvalid($("#f_name"), $("#f_birth"));
  if(!name || !birth){ out.innerHTML='<div class="small" style="color:#ff8a8a">필수 선택 사항을 선택 해주세요.</div>'; out.classList.remove("hidden"); if(!name) markInvalid($("#f_name")); else markInvalid($("#f_birth")); return; }
  const r=seed([name,birth,domain,ctx,new Date().toISOString().slice(0,10),'full-v3'].join('|'));
  const base=(m=45,M=92)=>Math.round(m+(M-m)*r());
  const S={연애:base(),금전:base(),커리어:base(),건강:base(),대인:base(),행운:base()};
  const ordered=Object.entries(S).sort((a,b)=>b[1]-a[1]);
  const grid=ordered.map(([k,v])=>kpi(k,v)).join("");
  out.innerHTML = `<div class="row"><span class="badge">별자리: ${zodiac(birth)}</span><span class="badge">띠: ${zodiacKorean(birth)}</span><span class="badge">라이프패스: ${lifePath(birth)}</span><span class="badge">관심: ${domain}</span></div>
  <div class="result" style="margin-top:10px">${grid}</div><div class="lp-explain small">${(()=>{const _lp=lifePath(birth);const _m=lifePathMeaning(_lp);return `<div class=\"row\"><span class=\"badge\">라이프패스 ${_lp}</span><span class=\"badge\">${_m[0]}</span></div><div style=\"margin-top:6px\">${_m[1]}</div>`})()}</div>
  <div class="divider"></div>
  <div class="panel"><strong>하이라이트</strong>: ${ordered[0][0]} (${ordered[0][1]}점)</div>
  <div class="divider"></div>
  <div class="panel"><strong>상세 설명</strong><div class="small" style="margin-top:6px">${generateFullNarrative(name,birth,domain,ctx,S,ordered)}</div></div>`;
  out.classList.remove("hidden");
  bindLifePathExplain(out);
});

show("home");
