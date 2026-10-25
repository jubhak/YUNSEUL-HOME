(()=>{
/* ===== 내용 편집 영역 ===== */
const SITE='지누기 홈페이지';
const BG_VIDEO=''; // 내 파도 영상(mp4) 주소를 넣으면 배경이 영상으로 바뀝니다
const NOTICES=[
 {t:'🎉 홈페이지 오픈!',d:'2026.10.23',b:'작은 지구에 놀러 오신 것을 환영해요. 천천히 둘러보세요.'},
 {t:'🛍️ 쇼핑센터 오픈 이벤트',d:'2026.10.25',b:'오픈 기념으로 전 상품 10% 할인 쿠폰을 드려요.'},
 {t:'🔧 정기 점검 안내',d:'2026.11.01',b:'새벽 2시~4시 사이 짧은 점검이 있을 수 있어요.'}];
const NECK='<svg viewBox="0 0 48 48"><path d="M7 15c6-7 28-7 34 0" fill="none" stroke="#d7a441" stroke-width="2.8" stroke-linecap="round"/><circle cx="24" cy="16.5" r="2.5" fill="#e8c36a"/><path d="M9 24c.4 11 6.4 17 15 17s14.6-6 15-17c-3.2 3.4-8.4 5.2-15 5.2S12.2 27.4 9 24z" fill="#ffd0c2" stroke="#e07a62" stroke-width="1.7"/><path d="M24 23.2v16.2M17.2 24.2c1.4 5.2 3.6 11 6.8 15.2M30.8 24.2c-1.4 5.2-3.6 11-6.8 15.2M13 26.5c2 4.6 5.6 10 11 12.8M35 26.5c-2 4.6-5.6 10-11 12.8" fill="none" stroke="#ef7d68" stroke-width="1.25" stroke-linecap="round"/></svg>';
const FLUFF='<svg viewBox="0 0 48 48"><rect x="22" y="26" width="4" height="20" rx="2" fill="#c8935a"/><circle cx="16" cy="22" r="9" fill="#ffb3d1"/><circle cx="32" cy="22" r="9" fill="#ffc8e0"/><circle cx="24" cy="25" r="10" fill="#ffb3d1"/><circle cx="24" cy="14" r="10" fill="#ffd6e8"/><circle cx="20" cy="12" r="4" fill="#fff" opacity=".6"/></svg>';
const PRODUCTS=[
 {key:'shell',n:'조개 목걸이',p:12000,e:NECK,kind:'wear'},
 {key:'candle',n:'파도 캔들',p:18000,e:'🕯️',kind:'place'},
 {key:'towel',n:'비치 타월',p:25000,e:'🏖️',kind:'place'},
 {key:'hat',n:'밀짚 모자',p:21000,e:'👒',kind:'wear'},
 {key:'pop',n:'롤리팝',p:2000,e:'🍭',kind:'wear',hand:1},
 {key:'fluff',n:'솜사탕',p:3500,e:FLUFF,kind:'wear',hand:1}];
const WHO=[['boy','지누기'],['girl','여자아이']];
const LOOK='jng_look_v1';
let wearOn={shell:'',hat:'',pop:'',fluff:''},placeN={towel:null,candle:null};
try{const o=JSON.parse(localStorage.getItem(LOOK)||'null');if(o&&o.wear)for(const k of Object.keys(wearOn)){const w=o.wear[k];if(w==='boy'||w==='girl')wearOn[k]=w}if(o&&o.place)placeN=Object.assign(placeN,o.place)}catch(e){}
function saveLook(){const pack=o=>o&&Number.isFinite(o.x)?{x:o.x,y:o.y,z:o.z}:null;try{localStorage.setItem(LOOK,JSON.stringify({wear:wearOn,place:{towel:pack(placeN.towel),candle:pack(placeN.candle)}}))}catch(e){}}
const CONTACT={mail:'jubhak@gmail.com'};
/* ========================== */
const $=s=>document.querySelector(s);
const LS='jng_wallet_v1';let store={id:'',wallet:1e8,buys:[]};
try{const o=JSON.parse(localStorage.getItem(LS)||'null');if(o&&o.id)store=o}catch(e){}
if(!store.id)store.id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,12);
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(store))}catch(e){}};save();
const SPOTS={
 board:{icon:'📌',name:'게시판',reach:.34,html:()=>NOTICES.map(n=>`<details><summary><span>${n.t}</span><small>${n.d}</small></summary><p>${n.b}</p></details>`).join('')},
 shop:{icon:'🛍️',name:'상점',reach:.48,html:shopHtml},
 mail:{icon:'📮',name:'문의하기',reach:.26,html:()=>`<p>궁금한 점이 있으면 편하게 편지를 보내주세요.</p><p>✉️ ${CONTACT.mail.toUpperCase()}</p><div class="row"><a class="btn" href="mailto:${CONTACT.mail}">메일 보내기</a></div>`}
};
$('#site').textContent=SITE;
let modalOpen=false,toastT,auto=null;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2200)};
function shopHtml(){return shopPage()}
function cartBar(){}
function openSpot(k){if(k==='board'||k==='shop')return openDock(k);const s=SPOTS[k];$('#mt').textContent=s.icon+' '+s.name;$('#mb').innerHTML=s.html();$('#mb').scrollTop=0;cartBar();modalOpen=true;$('#modal').classList.add('on');$('#act').hidden=true;auto=null}
function closeModal(){if(walletOpen){walletOpen=false;modalOpen=dockOn;$('#modal').classList.remove('on');return}if(dockOn){requestCloseDock();return}modalOpen=false;$('#modal').classList.remove('on')}
$('#mc').onclick=closeModal;$('#modal').addEventListener('pointerdown',e=>{if(e.target.id==='modal')closeModal()});

/* ===== 도킹 패널 (게시판 · 질문과 답변 · 방명록 · 포트폴리오 · 지누기) ===== */
let dockOn=false,dkT=0,dkv=0,wanderT=0,isAdmin=false,tabNow='me',pfOpen=0,boardOpen=0,editKind='',editId=0,editorDirty=false,adminToken=sessionStorage.getItem('jng_admin')||'',wysSeq=0;
let BOARD=[],QNA=[],GB=[],PF=[],SALE=[],consults=[],wysSeed={},delPending=null,shopOpen=0,consultNew=0,goodsEdit=0,goodsPics=[];
const delBtn=(kind,id)=>isAdmin?`<button type="button" class="del" data-del="${kind}" data-i="${id}" aria-label="삭제" title="삭제"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5h6l1 2h4.5v2h-17v-2H8l1-2zM7 9h2v9H7zm4 0h2v9h-2zm4 0h2v9h-2zM6.5 20.5h11l.8-11.5h-12.6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button>`:'';
const editBtn=(kind,id)=>`<button type="button" class="btn gh" data-edit="${kind}" data-i="${id}">수정하기</button>`;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TABS=[['me','👤','지누기'],['pf','💼','포트폴리오'],['board','📌','게시판'],['shop','🛍️','상점'],['qa','❓','질문과 답변'],['gb','📖','방명록']];
const wys=id=>`<iframe class="wys" data-wys="${esc(id)}" src="/editor/core.html?embed=1" title="내용 편집"></iframe>`;
function wysHtml(id){return new Promise(resolve=>{const frame=document.querySelector(`[data-wys="${id}"]`);if(!frame||!frame.contentWindow)return resolve('');const req=++wysSeq;const on=e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='yunseul-html'||e.data.id!==req)return;removeEventListener('message',on);resolve(e.data.html||'')};addEventListener('message',on);frame.contentWindow.postMessage({type:'yunseul-get',id:req},location.origin);setTimeout(()=>{removeEventListener('message',on);resolve('')},2000)})}
async function api(path,opt={}){const headers=Object.assign({},opt.headers||{});if(opt.body)headers['Content-Type']='application/json';if(adminToken)headers.Authorization='Bearer '+adminToken;const r=await fetch(path,Object.assign({},opt,{headers}));const j=await r.json().catch(()=>({}));if(r.status===401&&path!=='/api/admin/login'){adminToken='';sessionStorage.removeItem('jng_admin');isAdmin=false;syncAdmin()}if(!r.ok)throw new Error(j.error||'요청에 실패했어요');return j}
async function loadHome(){try{const [b,q,g,p,goods]=await Promise.all([api('/api/board'),api('/api/qna'),api('/api/guestbook'),api('/api/portfolio'),api('/api/goods')]);BOARD=b.items;QNA=q.items;GB=g.items;PF=p.items;SALE=goods.items;if(adminToken){try{const cs=await api('/api/consult');consults=cs.items;consultNew=cs.unread}catch(e){consults=[];consultNew=0}}else{consults=[];consultNew=0}if(dockOn)dockRender(true)}catch(e){toast('목록을 불러오지 못했어요')}}
const qaItem=x=>{
 const editing=isAdmin&&editKind==='qa'&&editId===x.id;
 const editor=editing?`<div class="fm ans"><div>${wys('ans'+x.id)}</div><div class="row"><button type="button" class="btn gh" data-edit-cancel>취소</button><button class="btn" data-act="ans" data-i="${x.id}">${x.answer?'수정 완료':'답변 등록'}</button></div></div>`:'';
 const answered=x.answer&&!editing?`<div class="ans"><div class="gb-top"><b>👑 관리자 답변</b>${isAdmin?editBtn('qa',x.id)+delBtn('qa-ans',x.id):''}</div><div class="prose">${x.answer}</div></div>`:'';
 const wait=!editing&&!x.answer&&isAdmin?`<button type="button" class="btn" data-edit="qa" data-i="${x.id}">답변하기</button>`:'';
 return `<div class="card"><div class="qa-top"><div class="qa-title"><span class="badge ${x.answer?'ok':'wait'}">${x.answer?'✅ 답변완료':'⏳ 답변대기'}</span><b>${esc(x.title)}</b></div>${delBtn('qna',x.id)}</div><small>${esc(x.name)} · ${esc(x.date)}</small><div class="prose">${x.body||''}</div>${editor||answered||wait}</div>`};
const SK=[
 {e:'🎓',t:'AI 코딩 강의',p:'코딩을 몰라도 괜찮아요. AI와 함께 아이디어를 실제로 돌아가는 프로그램으로 만드는 법을 실습 위주로 알려드려요.',g:['입문','프롬프트','실습 중심','자동화'],c:'#ffe1c9,#ffc2d9',n:1,w:1},
 {e:'🤖',t:'자동화 솔루션 판매',p:'손으로 반복하던 일을 프로그램이 대신하도록 만든 자동화 솔루션을 판매해요.',g:['유튜브','전자책','인스타·스레드','노래 생성','무료 광고'],c:'#ffe1c9,#ffd0ea',w:1,sols:[
  {e:'🎬',t:'유튜브 영상 자동 생성·등록',p:'대본을 쓰고 영상을 만든 다음, 채널에 올리는 과정까지 이어 주는 솔루션이에요. 영상으로 만들 내용만 정하면 제작과 등록을 자동으로 처리해요.'},
  {e:'📚',t:'전자책 300페이지 자동 출판',p:'300페이지 분량의 전자책을 목차 기획부터 본문 작성, 출판 파일까지 자동으로 만드는 솔루션이에요.'},
  {e:'📸',t:'인스타·스레드 자동 등록',p:'글과 이미지를 만들어 원하는 시간에 인스타그램과 스레드에 올려 주는 솔루션이에요. 이 자동 등록을 이용한 무료 광고 서비스도 가능해요.'},
  {e:'🎵',t:'오프라인 노래 생성 프로그램',p:'인터넷 없이 컴퓨터에서 트로트, 발라드 같은 노래를 만들어 주는 프로그램이에요. 이 프로그램도 판매해요.'}]},
 {e:'🏢',t:'맞춤형 프로그램 개발·납품',p:'그룹웨어, LIMS, 보안 솔루션 등 지구에 존재하는 모든 프로그램을 요구에 맞춰 개발하고 납품해요.',g:['그룹웨어','LIMS','보안','기획부터 납품까지'],c:'#cdf3e6,#d4e8ff',w:1}];
function pfDetail(id){const x=PF.find(p=>p.id===id);if(!x)return '<p>작품을 찾을 수 없어요.</p>';const sub=encodeURIComponent('[포트폴리오 문의] '+x.title);
 const editing=isAdmin&&editKind==='pf'&&editId===id;
 const back=`<button class="btn back" data-back>← 목록으로</button>`;
 if(editing)return `${back}<div class="card fm"><b>✏️ 포트폴리오 수정</b><input id="pt2" value="${esc(x.title)}"><input id="ps2" value="${esc(x.subtitle)}"><div>${wys('pedit')}</div><div class="row"><button type="button" class="btn gh" data-edit-cancel>취소</button><button class="btn" data-act="pf-save" data-i="${id}">저장</button></div></div>`;
 const tools=isAdmin?`<div class="row">${editBtn('pf',id)}${delBtn('pf',id)}</div>`:'';
 return `${back}<div class="pdh" style="background:linear-gradient(135deg,${esc(x.tone)})"><div class="pde">${x.emoji}</div><div><h3>${esc(x.title)}</h3><p>${esc(x.subtitle)}</p><small>${esc(x.date)}</small></div></div><div class="card prose">${x.body||''}</div>${tools}<div class="row"><a class="btn" href="mailto:${CONTACT.mail}?subject=${sub}">✉️ 비슷한 프로젝트 문의하기</a></div>`}
function boardDetail(id){const n=BOARD.find(x=>x.id===id);if(!n)return '<p>글을 찾을 수 없어요.</p>';
 const editing=isAdmin&&editKind==='board'&&editId===id;
 const back=`<button class="btn back" data-board-back>← 목록으로</button>`;
 if(editing)return `${back}<div class="card fm"><b>✏️ 글 수정</b><input id="bt2" value="${esc(n.title)}"><input id="bs2" value="${esc(n.subtitle)}"><div>${wys('bedit')}</div><div class="row"><button type="button" class="btn gh" data-edit-cancel>취소</button><button class="btn" data-act="board-save" data-i="${id}">저장</button></div></div>`;
 const tools=isAdmin?`<div class="row">${editBtn('board',id)}${delBtn('board',id)}</div>`:'';
 return `${back}<div class="card"><div class="nt">${n.emoji} ${esc(n.title)}</div><p>${esc(n.subtitle)}</p><small>${esc(n.date)}</small><div class="prose">${n.body||''}</div>${tools}</div>`}
function gbCard(x){
 const editing=isAdmin&&editKind==='gb'&&editId===x.id,fresh=isAdmin&&!x.answer&&!editing;
 const ans=x.answer&&!editing?`<div class="ans"><div class="gb-top"><b>👑 관리자 답변</b>${isAdmin?editBtn('gb',x.id)+delBtn('gb-ans',x.id):''}</div><div class="prose">${x.answer}</div></div>`:'';
 const editor=editing?`<div class="fm"><div>${wys('gans'+x.id)}</div><div class="row"><button type="button" class="btn gh" data-edit-cancel>취소</button><button class="btn" data-act="gb-ans" data-i="${x.id}">${x.answer?'수정 완료':'답변 등록'}</button></div></div>`:'';
 return `<div class="card gb${fresh?' gb-click':''}" ${fresh?`data-gb="${x.id}" role="button" tabindex="0"`:''}><div class="e">${x.emoji}</div><div><div class="gb-top"><b>${esc(x.name)}</b> <small>${esc(x.date)}</small>${delBtn('gb',x.id)}</div><div class="prose">${x.body||''}</div>${fresh?'<p class="hint2">눌러서 답변하기</p>':''}${ans}${editor}</div></div>`}
const won=n=>Number(n).toLocaleString('ko-KR')+'원';
function goodsPrice(g){return g.onSale?`<div class="gpr"><b>${won(g.salePrice)}</b> <s>${won(g.price)}</s></div>`:`<div class="gpr"><b>${won(g.price)}</b></div>`}
function goodsDetail(id){const g=SALE.find(x=>x.id===id);if(!g)return '<p>상품을 찾을 수 없어요.</p>';
 const imgs=g.images||[];
 const gal=imgs.length?`<div class="gal"><img class="main" id="gmain" src="${esc(imgs[0])}" alt="${esc(g.name)}"><div class="gth">${imgs.map((u,i)=>`<button type="button" class="${i?'':'on'}" data-gimg="${esc(u)}"><img src="${esc(u)}" alt=""></button>`).join('')}</div></div>`:'<div class="galph">🛍️</div>';
 const period=g.saleLabel?`<p class="hint2" style="text-align:left">${g.saleState==='wait'?'할인 예정':g.saleState==='end'?'할인 종료':'할인 기간'} ${esc(g.saleLabel)}${!g.onSale&&g.salePrice!=null?' · 할인가 '+won(g.salePrice):''}</p>`:'';
 const buy=g.link?`<div class="row"><a class="btn" href="${esc(g.link)}" target="_blank" rel="noopener noreferrer">구매하기</a></div>`:`<div class="row"><button type="button" class="btn" data-consult-open>구매 상담</button></div><div class="fm" id="csbox" hidden><label class="flb">연락처 또는 이메일<input id="cc" placeholder="전화번호 또는 이메일"></label><label class="flb">이름<input id="cn" placeholder="이름"></label><label class="flb">직책/직위<input id="cj" placeholder="직책 또는 직위"></label><button class="btn" data-act="consult" data-i="${g.id}">접수</button></div>`;
 const tools=isAdmin?`<div class="row"><button type="button" class="btn gh" data-goods-edit="${g.id}">수정하기</button>${delBtn('goods',g.id)}</div>`:'';
 return `<button class="btn back" data-shop-back>← 목록으로</button><div class="card">${gal}<h3>${esc(g.name)}</h3>${goodsPrice(g)}${g.onSale?'<span class="badge ok">할인 중</span>':''}${period}${buy}${tools}</div>`}
function goodsForm(){const g=goodsEdit?SALE.find(x=>x.id===goodsEdit):null;
 const pics=goodsPics.map((u,i)=>`<span class="gp"><img src="${esc(u)}" alt="상품 이미지"><button type="button" data-gimg-x="${i}" aria-label="이미지 빼기">✕</button></span>`).join('');
 return `<div class="card fm"><b>✏️ ${g?'상품 수정':'상품 등록'} (관리자)</b><label class="flb">상품명<input id="gn" value="${esc(g?g.name:'')}" placeholder="상품명"></label><label class="flb">정상 가격<input id="gp" inputmode="numeric" value="${g?g.price:''}" placeholder="10000"></label><label class="flb">할인가<input id="gs" inputmode="numeric" value="${g&&g.salePrice!=null?g.salePrice:''}" placeholder="비워 두면 할인 없음"></label><div class="row" style="margin-top:0"><label class="flb" style="flex:1">할인 시작<input id="gf" type="date" value="${esc(g?g.saleFrom:'')}"></label><label class="flb" style="flex:1">할인 종료<input id="gt" type="date" value="${esc(g?g.saleTo:'')}"></label></div><label class="flb">상품 이미지<input id="gimg" type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple></label><div id="gpics" class="gpics">${pics}</div><label class="flb">외부 링크<input id="gl" value="${esc(g?g.link:'')}" placeholder="https://"></label><div class="row">${g?'<button type="button" class="btn gh" data-goods-cancel>취소</button>':''}<button class="btn" data-act="goods-save"${g?` data-i="${g.id}"`:''}>${g?'수정 저장':'상품 등록'}</button></div></div>`}
function shopPage(){if(shopOpen)return goodsDetail(shopOpen);
 const cards=SALE.map(g=>`<div class="card pf gd" data-goods="${g.id}" role="button" tabindex="0"><div class="gi">${g.images&&g.images[0]?`<img src="${esc(g.images[0])}" alt="">`:'<span>🛍️</span>'}</div><div class="pb"><b>${esc(g.name)}</b>${g.onSale?' <span class="badge ok">할인</span>':''}${goodsPrice(g)}<span class="more">자세히 보기 →</span>${isAdmin?`<div class="row"><button type="button" class="btn gh" data-goods-edit="${g.id}">수정하기</button>${delBtn('goods',g.id)}</div>`:''}</div></div>`).join('');
 return `${isAdmin?goodsForm():''}<p class="hint2">카드를 누르면 상품을 볼 수 있어요</p><div class="pg">${cards||'<p class="hint2">등록된 상품이 아직 없어요</p>'}</div>`}
function consultCard(x){return `<div class="card cs"><div class="gb-top"><b>${esc(x.goodsName)}</b>${x.fresh?'<span class="badge wait">새 접수</span>':''}<small style="margin-left:auto">${esc(x.date)}</small></div><p>접수일시 ${esc(x.date)}</p><p>상품명 ${esc(x.goodsName)}</p><p>이름 ${esc(x.name)}</p><p>직책/직위 ${esc(x.job)}</p><p>연락처 ${esc(x.contact)}</p></div>`}
const PAGES={
 me:()=>`<div class="hero"><div class="av">🧑‍💻</div><h3>지누기</h3><p class="job">맞춤형 프로그램 기획 · 개발<small>소속 없이 자유롭게 일하는 디지털 노마드</small></p><div>${['#자동화','#AI','#맞춤개발','#납품까지'].map(t=>`<span class="chp">${t}</span>`).join('')}</div><a class="btn" href="mailto:${CONTACT.mail}">✉️ ${CONTACT.mail.toUpperCase()}</a></div>
  <div class="stats"><div><b>1인</b><small>기획부터 납품까지</small></div><div><b>3개월</b><small>무상 유지보수</small></div><div><b>2일</b><small>견적 회신</small></div></div>
  <h4 class="sec">✨ 할 수 있는 일</h4>
  <div class="bento">${SK.map(x=>`<div class="bk${x.w?' wide':''}" style="--c:${x.c}">${x.n?'<span class="new">NEW</span>':''}<div class="bi">${x.e}</div><b>${x.t}</b><p>${x.p}</p>${x.sols?`<div class="sols">${x.sols.map(s=>`<div class="sol"><b>${s.e} ${s.t}</b><p>${s.p}</p></div>`).join('')}</div>`:''}<div>${x.g.map(g=>`<span class="tg">#${g}</span>`).join('')}</div></div>`).join('')}</div>`,
 pf:()=>pfOpen?pfDetail(pfOpen):`${isAdmin?`<div class="card fm"><b>✏️ 포트폴리오 등록 (관리자)</b><input id="pt" placeholder="제목"><input id="ps" placeholder="부제"><div>${wys('pf')}</div><button class="btn" data-act="pf">등록</button></div>`:''}<p class="hint2">카드를 누르면 상세 내용을 볼 수 있어요</p><div class="pg">${PF.map(x=>`<div class="card pf pfc" data-pf="${x.id}" role="button"><div class="pt" style="background:linear-gradient(135deg,${esc(x.tone)})">${x.emoji}</div><div class="pb"><b>${esc(x.title)}</b><p>${esc(x.subtitle)}</p><span class="more">자세히 보기 →</span></div></div>`).join('')||'<p class="hint2">아직 작품이 없어요</p>'}</div>`,
 board:()=>boardOpen?boardDetail(boardOpen):`${isAdmin?`<div class="card fm"><b>✏️ 새 글 쓰기 (관리자)</b><input id="bt" placeholder="제목"><input id="bs" placeholder="부제"><div>${wys('board')}</div><button class="btn" data-act="post">등록</button></div>`:'<p class="hint2">✏️ 글쓰기는 관리자만 할 수 있어요</p>'}<div class="cork">${BOARD.map(n=>`<button type="button" class="note" data-board="${n.id}" style="background:${esc(n.color)};--r:${[-1.2,1,-.6,1.4][n.id%4]}deg"><div class="nt">${n.emoji} ${esc(n.title)}</div><small>${esc(n.date)}</small><p class="sub">${esc(n.subtitle)}</p></button>`).join('')||'<p class="hint2">아직 글이 없어요</p>'}</div>`,
 shop:()=>shopPage(),
 qa:()=>`<div class="card fm"><b>❓ 궁금한 점을 남겨 주세요</b><input id="qn" placeholder="이름"><input id="qt" placeholder="제목"><div>${wys('ask')}</div><button class="btn" data-act="ask">질문 등록</button></div><p class="hint2">답변은 관리자만 달 수 있어요</p>${QNA.map(qaItem).join('')}`,
 gb:()=>`<div class="card fm"><b>📖 방명록 남기기</b><input id="gn" placeholder="이름"><div>${wys('guest')}</div><button class="btn" data-act="guest">남기기</button></div>${isAdmin?'<p class="hint2">글을 누르면 답변을 쓸 수 있어요</p>':''}${GB.map(gbCard).join('')}`,
 cs:()=>`<p class="hint2">구매 상담으로 접수된 내용이에요</p>${consults.map(consultCard).join('')||'<p class="hint2">접수된 상담이 없어요</p>'}`};
function syncAdmin(){const b=$('#adm');b.classList.toggle('on',isAdmin);b.title=isAdmin?'로그아웃':'관리자';b.setAttribute('aria-label',isAdmin?'관리자 로그아웃':'관리자')}
function tabButtons(){const list=TABS.slice();if(isAdmin)list.push(['cs','📩','상담접수']);if(!isAdmin&&tabNow==='cs')tabNow='gb';return list.map(([k,i,n])=>`<button data-tab="${k}" class="${k===tabNow?'on':''}"><span>${i}</span>${n}${k==='cs'&&consultNew>0?`<i class="tbad">${consultNew>99?'99+':consultNew}</i>`:''}</button>`).join('')}
function dockRender(keep){editorDirty=false;if(!isAdmin&&tabNow==='cs')tabNow='gb';const db=$('#db'),st=db.scrollTop;$('#tabs').innerHTML=tabButtons();syncAdmin();db.innerHTML=PAGES[tabNow]();db.scrollTop=keep?st:0;if(tabNow==='shop')cartBar()}
const MI_OPEN=`<svg class="mi" viewBox="0 0 28 28" aria-hidden="true"><defs><linearGradient id="mg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb26b"/><stop offset="1" stop-color="#ff6a8e"/></linearGradient></defs><circle cx="14" cy="14" r="13" fill="url(#mg1)"/><rect x="7" y="8.2" width="14" height="2.6" rx="1.3" fill="#fff"/><rect x="7" y="12.7" width="14" height="2.6" rx="1.3" fill="#fff"/><rect x="7" y="17.2" width="9" height="2.6" rx="1.3" fill="#fff"/><path d="M21 16.2l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z" fill="#fff4b8"/></svg>`,MI_CLOSE=`<svg class="mi" viewBox="0 0 28 28" aria-hidden="true"><defs><linearGradient id="mg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a76"/><stop offset="1" stop-color="#ff5d8f"/></linearGradient></defs><circle cx="14" cy="14" r="13" fill="url(#mg2)"/><path d="M9.5 9.5l9 9M18.5 9.5l-9 9" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`;
function syncMenu(){const b=$('#menub');b.innerHTML=(dockOn?MI_CLOSE:MI_OPEN)+'<span>'+(dockOn?'메뉴닫기':'메뉴보기')+'</span>';b.setAttribute('aria-label',dockOn?'메뉴닫기':'메뉴보기')}
function openDock(t){if(snack)endSnack();tabNow=t;pfOpen=0;boardOpen=0;shopOpen=0;editKind='';editId=0;dockOn=true;modalOpen=true;dkT=1;auto=null;wanderT=1;dockRender();$('#dock').classList.add('on');$('#act').hidden=true;syncMenu()}
function closeDock(){dockOn=false;modalOpen=false;dkT=0;auto=null;$('#dock').classList.remove('on');syncMenu()}
const hasDraft=()=>editorDirty||[...document.querySelectorAll('#db input:not([type=range]),#db textarea')].some(e=>(e.value||'').trim());
function askClose(){const w=$('#warn');w.classList.add('on');$('#wkeep').focus()}
function requestCloseDock(){if(!dockOn)return;if(hasDraft())askClose();else closeDock()}
$('#wkeep').onclick=()=>$('#warn').classList.remove('on');
$('#wclose').onclick=()=>{$('#warn').classList.remove('on');closeDock()};
$('#delno').onclick=()=>{$('#delask').classList.remove('on');delPending=null};
const hidePath={qna:id=>'/api/qna/'+id+'/hide',gb:id=>'/api/guestbook/'+id+'/hide',board:id=>'/api/board/'+id+'/hide',pf:id=>'/api/portfolio/'+id+'/hide',goods:id=>'/api/goods/'+id+'/hide','qa-ans':id=>'/api/qna/'+id+'/answer/clear','gb-ans':id=>'/api/guestbook/'+id+'/answer/clear'};
function askDel(kind,id){delPending={kind,id};const ans=kind==='qa-ans'||kind==='gb-ans',goods=kind==='goods';$('#delt').textContent=ans?'이 답변을 지울까요?':goods?'이 상품을 지울까요?':'정말 지울까요?';$('#delp').textContent=ans?'답변만 지워지고 글은 남아요.':goods?'삭제하면 상점에서 보이지 않아요.':'삭제하면 이 글은 화면에서 보이지 않아요.';$('#delask').classList.add('on');$('#delok').focus()}
$('#delok').onclick=async()=>{const p=delPending;$('#delask').classList.remove('on');delPending=null;if(!p)return;try{await api(hidePath[p.kind](p.id),{method:'POST',body:'{}'});if(p.kind==='board'&&boardOpen===p.id)boardOpen=0;if(p.kind==='pf'&&pfOpen===p.id)pfOpen=0;if(p.kind==='goods'&&shopOpen===p.id)shopOpen=0;if(p.kind==='goods'&&goodsEdit===p.id){goodsEdit=0;goodsPics=[]}if(editKind&&editId===p.id){editKind='';editId=0}toast(p.kind.endsWith('ans')?'답변을 지웠어요':p.kind==='goods'?'상품을 지웠어요':'글을 지웠어요');await loadHome()}catch(err){toast(err.message)}};
$('#dc').onclick=requestCloseDock;
addEventListener('message',e=>{if(e.origin!==location.origin||!e.data)return;if(e.data.type==='yunseul-dirty')editorDirty=true;if(e.data.type==='yunseul-ready'){const frame=[...document.querySelectorAll('iframe.wys')].find(f=>f.contentWindow===e.source);if(frame&&wysSeed[frame.dataset.wys]!=null)frame.contentWindow.postMessage({type:'yunseul-set',html:wysSeed[frame.dataset.wys]},location.origin)}});
async function tryAdmin(){const password=$('#admp').value;try{const j=await api('/api/admin/login',{method:'POST',body:JSON.stringify({password})});adminToken=j.token;sessionStorage.setItem('jng_admin',adminToken);isAdmin=true;$('#admp').value='';$('#admlock').classList.remove('on');syncAdmin();toast('관리자 모드예요');await loadHome()}catch(e){toast(e.message)}}
$('#admok').onclick=tryAdmin;$('#admno').onclick=()=>{$('#admp').value='';$('#admlock').classList.remove('on')};
$('#admp').addEventListener('keydown',e=>{if(e.key==='Enter')tryAdmin()});
$('#adm').onclick=()=>{if(isAdmin){adminToken='';sessionStorage.removeItem('jng_admin');isAdmin=false;editKind='';editId=0;consultNew=0;consults=[];if(tabNow==='cs')tabNow='gb';syncAdmin();toast('로그아웃했어요');if(dockOn)dockRender(true);return}$('#admp').value='';$('#admlock').classList.add('on');$('#admp').focus()};
async function showConsults(){tabNow='cs';pfOpen=0;boardOpen=0;shopOpen=0;editKind='';editId=0;try{const j=await api('/api/consult');consults=j.items.map(x=>Object.assign({},x,{fresh:x.seen==='N'}));consultNew=j.unread;dockRender();if(j.unread){await api('/api/consult/seen',{method:'POST',body:'{}'});consultNew=0;const b=document.querySelector('[data-tab="cs"] .tbad');if(b)b.remove()}}catch(e){toast(e.message)}}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;if(b.dataset.tab==='cs'){showConsults();return}tabNow=b.dataset.tab;pfOpen=0;boardOpen=0;shopOpen=0;editKind='';editId=0;dockRender()});
$('#db').addEventListener('click',async e=>{const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act,v=id=>((document.getElementById(id)||{}).value||'').trim();
 try{
  if(a==='post'){const body=await wysHtml('board');await api('/api/board',{method:'POST',body:JSON.stringify({title:v('bt'),subtitle:v('bs'),body})});toast('등록했어요');await loadHome()}
  else if(a==='pf'){const body=await wysHtml('pf');await api('/api/portfolio',{method:'POST',body:JSON.stringify({title:v('pt'),subtitle:v('ps'),body})});toast('포트폴리오를 등록했어요');await loadHome()}
  else if(a==='ask'){const body=await wysHtml('ask');await api('/api/qna',{method:'POST',body:JSON.stringify({name:v('qn'),title:v('qt'),body})});toast('질문이 등록됐어요');await loadHome()}
  else if(a==='ans'){const body=await wysHtml('ans'+t.dataset.i);await api('/api/qna/'+t.dataset.i+'/answer',{method:'POST',body:JSON.stringify({answer:body})});editKind='';editId=0;toast('답변을 저장했어요');await loadHome()}
  else if(a==='gb-ans'){const body=await wysHtml('gans'+t.dataset.i);await api('/api/guestbook/'+t.dataset.i+'/answer',{method:'POST',body:JSON.stringify({answer:body})});editKind='';editId=0;toast('답변을 저장했어요');await loadHome()}
  else if(a==='board-save'){const body=await wysHtml('bedit');await api('/api/board/'+t.dataset.i,{method:'POST',body:JSON.stringify({title:v('bt2'),subtitle:v('bs2'),body})});editKind='';editId=0;toast('글을 수정했어요');await loadHome()}
  else if(a==='pf-save'){const body=await wysHtml('pedit');await api('/api/portfolio/'+t.dataset.i,{method:'POST',body:JSON.stringify({title:v('pt2'),subtitle:v('ps2'),body})});editKind='';editId=0;toast('포트폴리오를 수정했어요');await loadHome()}
  else if(a==='guest'){const body=await wysHtml('guest');await api('/api/guestbook',{method:'POST',body:JSON.stringify({name:v('gn'),body})});toast('방명록을 남겼어요');await loadHome()}
  else if(a==='goods-save'){const body={name:v('gn'),price:v('gp'),salePrice:v('gs'),saleFrom:v('gf'),saleTo:v('gt'),link:v('gl'),images:goodsPics.slice()};await api(t.dataset.i?'/api/goods/'+t.dataset.i:'/api/goods',{method:'POST',body:JSON.stringify(body)});const edited=!!t.dataset.i;goodsEdit=0;goodsPics=[];toast(edited?'상품을 수정했어요':'상품을 등록했어요');await loadHome()}
  else if(a==='consult'){await api('/api/consult',{method:'POST',body:JSON.stringify({goodsId:+t.dataset.i,contact:v('cc'),name:v('cn'),job:v('cj')})});toast('구매 상담을 접수했어요');['cc','cn','cj'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});const box=document.getElementById('csbox');if(box)box.hidden=true}
 }catch(err){toast(err.message)}
});

/* ===== 지갑 · 포트폴리오 클릭 ===== */
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())};
let walletOpen=false;
function walBadge(){const b=$('#walb');if(b)b.hidden=true}
function whoName(id){const f=WHO.find(x=>x[0]===id);return f?f[1]:''}
function refreshWallet(){if(!walletOpen)return;const mb=$('#mb'),st=mb.scrollTop;mb.innerHTML=walletPage();mb.scrollTop=st}
function walletPage(){
 return `<p class="hint2">지누기랑 여자아이에게 입히거나 손에 들려 줄 수 있어요. 비치 타월은 땅에 펼면 파라솔이 같이 펴지고, 누르면 그늘에 들어가 누워요.</p><div class="wl">${PRODUCTS.map(p=>{
  let act='';
  if(p.kind==='wear'){const w=wearOn[p.key];
   act=`<small>${w?whoName(w)+' 착용 중':(p.hand?'착용하면 손에 들고 다녀요':'착용 안 함')}</small><div class="row">${w?`<button type="button" class="btn gh" data-off="${p.key}">해지</button>`:''}<button type="button" class="btn" data-wear="${p.key}">${w?'바꿔 입히기':'착용하기'}</button></div><div class="who" hidden>${WHO.map(([id,name])=>`<button type="button" class="btn gh" data-who="${id}" data-item="${p.key}">${name}</button>`).join('')}</div>`;
  }else{
   const on=!!(placeN[p.key]&&Number.isFinite(placeN[p.key].x)),towel=p.key==='towel';
   act=`<small>${on?(towel?'파라솔 그늘이 져 있어요. 타월을 누르면 들어가 누워요':'근처에 놓여 있어요'):(towel?'빈 땅에 펼면 파라솔도 같이 펴져요':'빈 땅에 놓을 수 있어요')}</small><button type="button" class="btn" data-place="${p.key}">${on?'치우기':(towel?'펼치기':'놓기')}</button>`;
  }
  return `<div class="wi"><span class="we">${p.e}</span><div class="wn"><b>${esc(p.n)}</b>${act}</div></div>`;
 }).join('')}</div>`}
function openWallet(){if(snack)endSnack();if(walletOpen){closeModal();return}walletOpen=true;$('#mt').textContent='👛 내 지갑';$('#mb').innerHTML=walletPage();$('#mb').scrollTop=0;modalOpen=true;$('#modal').classList.add('on');$('#act').hidden=true;auto=null}
$('#wal').onclick=openWallet;$('#menub').onclick=()=>{if(dockOn){requestCloseDock();return}if(walletOpen)closeModal();openDock('board')};walBadge();
$('#mb').addEventListener('click',e=>{
 const wear=e.target.closest('[data-wear]'),eat=e.target.closest('[data-eat]');
 if(wear||eat){const box=(wear||eat).parentElement.parentElement.querySelector('.who');if(box)box.hidden=!box.hidden;return}
 const off=e.target.closest('[data-off]');if(off){wearOn[off.dataset.off]='';saveLook();applyLook();refreshWallet();toast('벗겼어요');return}
 const who=e.target.closest('[data-who]');if(who&&(who.dataset.who==='boy'||who.dataset.who==='girl')){wearOn[who.dataset.item]=who.dataset.who;saveLook();applyLook();refreshWallet();toast(whoName(who.dataset.who)+'에게 착용했어요');return}
 const feed=e.target.closest('[data-feed]');if(feed){startSnack(feed.dataset.item,feed.dataset.feed);return}
 const pl=e.target.closest('[data-place]');if(pl){togglePlace(pl.dataset.place);refreshWallet();return}
});
function beginEdit(kind,id){editKind=kind;editId=id;if(kind==='qa'){const item=QNA.find(q=>q.id===id);wysSeed['ans'+id]=item?item.answer||'':''}else if(kind==='gb'){const item=GB.find(g=>g.id===id);wysSeed['gans'+id]=item?item.answer||'':''}else if(kind==='board'){const item=BOARD.find(n=>n.id===id);wysSeed.bedit=item?item.body||'':''}else if(kind==='pf'){const item=PF.find(p=>p.id===id);wysSeed.pedit=item?item.body||'':''}dockRender(true)}
function paintPics(){const box=$('#gpics');if(!box)return;box.innerHTML=goodsPics.map((u,i)=>`<span class="gp"><img src="${esc(u)}" alt="상품 이미지"><button type="button" data-gimg-x="${i}" aria-label="이미지 빼기">✕</button></span>`).join('')}
$('#db').addEventListener('change',async e=>{if(e.target.id!=='gimg')return;const files=[...e.target.files];e.target.value='';if(!files.length)return;if(goodsPics.length+files.length>8){toast('이미지는 8장까지 올릴 수 있어요');return}try{for(const f of files){const fd=new FormData();fd.append('file',f,f.name);const r=await fetch('/api/upload',{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'이미지를 올리지 못했어요');goodsPics.push(j.url)}paintPics()}catch(err){toast(err.message)}});
$('#db').addEventListener('click',e=>{const del=e.target.closest('[data-del]');if(del){askDel(del.dataset.del,+del.dataset.i);return}if(e.target.closest('[data-edit-cancel]')){editKind='';editId=0;dockRender(true);return}if(e.target.closest('[data-goods-cancel]')){goodsEdit=0;goodsPics=[];dockRender();return}const gx=e.target.closest('[data-gimg-x]');if(gx){goodsPics.splice(+gx.dataset.gimgX,1);paintPics();return}const ge=e.target.closest('[data-goods-edit]');if(ge){const item=SALE.find(x=>x.id===+ge.dataset.goodsEdit);goodsEdit=item?item.id:0;goodsPics=item?[...(item.images||[])]:[];shopOpen=0;dockRender();return}const gi=e.target.closest('[data-gimg]');if(gi&&String(gi.dataset.gimg||'').startsWith('/uploads/')){const main=$('#gmain');if(main)main.src=gi.dataset.gimg;document.querySelectorAll('[data-gimg]').forEach(b=>b.classList.toggle('on',b===gi));return}const co=e.target.closest('[data-consult-open]');if(co){const box=document.getElementById('csbox');if(box)box.hidden=!box.hidden;return}const ed=e.target.closest('[data-edit]');if(ed){beginEdit(ed.dataset.edit,+ed.dataset.i);return}const gb=e.target.closest('[data-gb]');if(gb&&!e.target.closest('button,a')){beginEdit('gb',+gb.dataset.gb);return}const c=e.target.closest('[data-pf]');if(c){pfOpen=+c.dataset.pf;editKind='';editId=0;dockRender();return}const gd=e.target.closest('[data-goods]');if(gd&&!e.target.closest('button,a')){shopOpen=+gd.dataset.goods;dockRender();return}const n=e.target.closest('[data-board]');if(n){boardOpen=+n.dataset.board;editKind='';editId=0;dockRender();return}if(e.target.closest('[data-shop-back]')){shopOpen=0;dockRender();return}if(e.target.closest('[data-back]')){pfOpen=0;editKind='';editId=0;dockRender();return}if(e.target.closest('[data-board-back]')){boardOpen=0;editKind='';editId=0;dockRender();return}});
loadHome();if(adminToken)api('/api/admin/session').then(()=>{isAdmin=true;syncAdmin();if(dockOn)dockRender(true)}).catch(()=>{adminToken='';sessionStorage.removeItem('jng_admin');isAdmin=false;syncAdmin()});

/* ===== Three.js ===== */
const T=THREE,R=6;
const cv=$('#c'),rd=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
rd.setPixelRatio(Math.min(devicePixelRatio,2));rd.shadowMap.enabled=true;rd.shadowMap.type=T.PCFSoftShadowMap;rd.autoClear=false;rd.setClearColor(0,0);
if(BG_VIDEO){const v=document.createElement('video');Object.assign(v,{src:BG_VIDEO,autoplay:true,muted:true,loop:true,playsInline:true});v.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1';document.body.prepend(v)}
const scene=new T.Scene(),cam=new T.PerspectiveCamera(40,1,.1,200),world=new T.Group();scene.add(world);
const V=a=>new T.Vector3(...a),Cc=h=>new T.Color(h);
const TOD=[
{ic:'🌅',name:'일출',sun:new T.Vector2(.34,.63),sunC:V([1,.7,.4]),glow:1.3,skyH:V([1,.72,.5]),skyM:V([.92,.62,.74]),skyT:V([.34,.44,.8]),seaN:V([.85,.86,.8]),seaM:V([.42,.58,.76]),seaF:V([.22,.34,.6]),tint:V([1.06,.95,.88]),night:0,ct:V([1,.82,.72]),hs:Cc(0xffe0c4),hg:Cc(0xe8c39a),hi:.8,lc:Cc(0xffc080),li:.95,at:Cc(0xffd6c0)},
{ic:'🌤️',name:'아침',sun:new T.Vector2(.3,.78),sunC:V([1,.94,.78]),glow:.7,skyH:V([.92,.96,.98]),skyM:V([.62,.83,.96]),skyT:V([.3,.58,.9]),seaN:V([.64,.94,.88]),seaM:V([.14,.7,.84]),seaF:V([.05,.4,.66]),tint:V([1.02,1,.97]),night:0,ct:V([1,1,1]),hs:Cc(0xffffff),hg:Cc(0xf1d9a0),hi:.85,lc:Cc(0xfff0d6),li:1.05,at:Cc(0xd6f3ff)},
{ic:'☀️',name:'오후',sun:new T.Vector2(.64,.9),sunC:V([1,.95,.8]),glow:.55,skyH:V([.88,.94,.97]),skyM:V([.55,.79,.95]),skyT:V([.22,.5,.88]),seaN:V([.58,.94,.86]),seaM:V([.1,.68,.82]),seaF:V([.03,.36,.64]),tint:V([1.03,1,.96]),night:0,ct:V([1,1,1]),hs:Cc(0xffffff),hg:Cc(0xf1d9a0),hi:.85,lc:Cc(0xfff0d6),li:1.1,at:Cc(0xd6f3ff)},
{ic:'🌇',name:'저녁 노을',sun:new T.Vector2(.7,.68),sunC:V([1,.56,.26]),glow:1.8,skyH:V([1,.52,.26]),skyM:V([.9,.4,.54]),skyT:V([.3,.28,.62]),seaN:V([.95,.66,.55]),seaM:V([.55,.36,.56]),seaF:V([.2,.18,.46]),tint:V([1.1,.84,.74]),night:0,ct:V([1,.7,.55]),hs:Cc(0xffc9a0),hg:Cc(0xe0a070),hi:.75,lc:Cc(0xff9a55),li:.95,at:Cc(0xffb894)},
{ic:'🌆',name:'일몰',sun:new T.Vector2(.72,.585),sunC:V([1,.42,.3]),glow:1,skyH:V([.8,.34,.32]),skyM:V([.38,.2,.45]),skyT:V([.05,.07,.24]),seaN:V([.34,.3,.46]),seaM:V([.12,.14,.32]),seaF:V([.03,.05,.18]),tint:V([.66,.64,.88]),night:.75,ct:V([.4,.42,.62]),hs:Cc(0x7f8cc8),hg:Cc(0x4a4a78),hi:.55,lc:Cc(0xa99bdf),li:.35,at:Cc(0x8f8fd0)},
{ic:'🌙',name:'달님',sun:new T.Vector2(.66,.82),sunC:V([1,.86,.4]),glow:.7,moon:1,skyH:V([.13,.17,.36]),skyM:V([.06,.09,.26]),skyT:V([.02,.03,.12]),seaN:V([.2,.26,.42]),seaM:V([.07,.11,.27]),seaF:V([.02,.04,.14]),tint:V([.55,.6,.9]),night:1,ct:V([.3,.34,.55]),hs:Cc(0x8d9bdc),hg:Cc(0x34385f),hi:.7,lc:Cc(0xc4d0ff),li:.45,at:Cc(0x7f8fd8)}];
const cur={};['sun','sunC','skyH','skyM','skyT','seaN','seaM','seaF','tint','ct'].forEach(k=>cur[k]=TOD[2][k].clone());
let todIdx=2;
const bgS=new T.Scene(),bgC=new T.OrthographicCamera(-1,1,1,-1,-5,5),U={uT:{value:0},uSw:{value:0},uR:{value:new T.Vector2(1,1)},uGlow:{value:.55},uNight:{value:0},uMoon:{value:0},uWx:{value:0},uRain:{value:0},uFlash:{value:0},uSun:{value:cur.sun},uSunC:{value:cur.sunC},uSkyH:{value:cur.skyH},uSkyM:{value:cur.skyM},uSkyT:{value:cur.skyT},uSeaN:{value:cur.seaN},uSeaM:{value:cur.seaM},uSeaF:{value:cur.seaF},uTint:{value:cur.tint}};
const M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.75},o));
const mk=(g,m,x=0,y=0,z=0,p)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p&&p.add(o);return o};
const swell=t=>Math.pow(.5+.5*Math.sin(t*6.2832/9),1.4);

function buildBg(){
 if(BG_VIDEO)return;
 bgS.add(new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:U,depthTest:false,depthWrite:false,
 vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform float uT,uSw,uGlow,uNight,uMoon,uWx,uFlash,uRain;uniform vec2 uR,uSun;uniform vec3 uSunC,uSkyH,uSkyM,uSkyT,uSeaN,uSeaM,uSeaF,uTint;
 float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
 float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float a=.5,s=0.;mat2 m=mat2(.8,-.6,.6,.8);for(int i=0;i<4;i++){s+=a*n(p);p=m*p*2.03+7.1;a*=.5;}return s;}
 vec3 bow(float t){float x=clamp(t,0.,.999)*7.,i=floor(x),f=fract(x);vec3 a=vec3(.93,.15,.2),b=vec3(1.,.5,.08);if(i<1.){a=vec3(.93,.15,.2);b=vec3(1.,.5,.08);}else if(i<2.){a=vec3(1.,.5,.08);b=vec3(1.,.9,.16);}else if(i<3.){a=vec3(1.,.9,.16);b=vec3(.2,.76,.28);}else if(i<4.){a=vec3(.2,.76,.28);b=vec3(.15,.45,.96);}else if(i<5.){a=vec3(.15,.45,.96);b=vec3(.38,.24,.78);}else if(i<6.){a=vec3(.38,.24,.78);b=vec3(.66,.32,.92);}else{a=vec3(.66,.32,.92);b=a;}return mix(a,b,smoothstep(.86,1.,f));}
 void main(){
  vec2 uv=gl_FragCoord.xy/uR;float asp=uR.x/uR.y,t=uT,y=uv.y;
  const float H=.6,K=.3;
  vec3 col;
  if(y>=H){
   float s=(y-H)/(1.-H);
   vec3 sky=mix(uSkyH,uSkyM,smoothstep(0.,.3,s));
   sky=mix(sky,uSkyT,smoothstep(.25,1.,s));
   vec2 d=(uv-uSun)*vec2(asp,1.);float sd=length(d);
   sky+=uSunC*(exp(-sd*4.5)*.5*uGlow*(1.-.5*uMoon)+exp(-sd*34.)*.9)*(1.-.85*uWx);sky+=uSunC*(exp(-sd*11.)*.4+exp(-sd*3.)*.1)*uMoon*(1.-uWx);
   sky+=uSunC*exp(-s*7.)*exp(-abs(uv.x-uSun.x)*asp*.9)*.4*uGlow*(1.-.85*uMoon);
   float nt=smoothstep(.35,1.,uNight)*(1.-uWx),hz=smoothstep(.03,.4,s);
   if(nt>0.){
    vec2 g1=vec2(uv.x*asp,uv.y)*46.,i1=floor(g1),f1=fract(g1);
    if(h(i1)>.86){vec2 c1=.3+.4*vec2(h(i1+7.3),h(i1+3.1));float z1=h(i1+11.7),d1=length(f1-c1);
     float tw1=.5+.5*sin(t*(1.5+2.5*h(i1+5.9))+h(i1+1.)*40.);
     vec3 k1=mix(vec3(.85,.92,1.),vec3(1.,.9,.62),step(.55,h(i1+2.2)));
     sky+=k1*(exp(-d1*d1*(170.-100.*z1))+.12*exp(-d1*9.))*(.35+.65*tw1)*(.5+.5*z1)*nt*hz;}
    vec2 g2=vec2(uv.x*asp,uv.y)*13.,i2=floor(g2),f2=fract(g2);
    if(h(i2+19.)>.78){vec2 c2=.28+.44*vec2(h(i2+1.7),h(i2+8.3)),e=f2-c2;float z2=.55+.45*h(i2+4.4);
     float tw2=.5+.5*sin(t*(1.1+1.6*h(i2+9.1))+h(i2+2.)*30.);tw2*=tw2;
     float L=(.05+.09*tw2)*z2,ax=abs(e.x),ay=abs(e.y);
     float cr=(exp(-ax*70.)*exp(-ay/L)+exp(-ay*70.)*exp(-ax/L))*(1.-smoothstep(.12,.27,max(ax,ay)));
     float co=exp(-dot(e,e)*(240./z2))+.25*exp(-length(e)*14.);
     vec3 k2=mix(vec3(1.,.93,.66),vec3(.82,.9,1.),step(.82,h(i2+6.6)));
     sky+=k2*(cr*.9+co)*(.3+.7*tw2)*z2*nt*hz*1.3;}}
   float e0=mix(.024,.046,uMoon),e1=mix(.034,.05,uMoon);
   vec3 dc=mix(uSunC*1.25,uSunC*(1.12-.2*fbm(d*34.))*(1.-.1*sd/e1),uMoon);
   sky=mix(sky,dc,(1.-smoothstep(e0,e1,sd))*.97*(1.-uWx));
   float pz=1./(.3+s*1.6);vec2 cp=vec2((uv.x-.5)*asp*pz*1.2+t*.012,pz*1.6);
   float cl=smoothstep(.6-.34*uWx,.95-.3*uWx,fbm(cp+3.))*smoothstep(0.,.2,s)*(1.-smoothstep(.55,1.,s)*(.6-.5*uWx));
   vec3 cc=mix(vec3(1.),uSkyH*1.15,.55)*(1.-.5*uNight);cc=mix(cc,vec3(dot(cc,vec3(.33)))*vec3(.78,.82,.88),uWx*.8);
   col=mix(sky,cc,min(1.,cl*(.85+.15*uWx)));
   col=mix(col,vec3(dot(col,vec3(.33)))*vec3(.86,.9,.96)*(1.-.28*uWx),uWx*.8);
   vec2 bowC=vec2(.5,-.16);vec2 bowD=(uv-bowC)*vec2(asp,1.);float bowR=length(bowD),bowOut=1.02,bowTh=.22,bowIn=bowOut-bowTh;
   float bowT=clamp((bowOut-bowR)/bowTh,0.,.999);
   float bowM=smoothstep(0.,.012,min(bowR-bowIn,bowOut-bowR))*step(.02,bowD.y);
   bowM*=smoothstep(H,H+.03,y);
   float sunUp=(1.-uMoon)*(1.-smoothstep(.25,.7,uNight))*smoothstep(.6,.66,uSun.y)*(1.-uWx*.8);
   col=mix(col,bow(bowT),bowM*sunUp*.72);
  }else{
   float z=min(K/(H-y),40.);
   float wx=(uv.x-.5)*asp*z*2.;
   vec2 sq=vec2(wx,z);
   float S=1.05-.4*uSw+.10*sin(wx*1.1+.6)+.05*fbm(vec2(wx*.9,t*.04))+.03*fbm(vec2(wx*3.,t*.3));
   float yS=H-K/S;
   float dw=y-yS;
   vec3 sA=vec3(.97,.88,.69),sB=vec3(.85,.72,.51);
   vec3 sand=mix(sA,sB,fbm(sq*3.5));
   sand=mix(sand,sB*.9,smoothstep(.55,.8,fbm(sq*1.2+3.))*.5);
   sand+=(h(floor(gl_FragCoord.xy/1.6))-.5)*.06;
   sand*=1.+.035*sin(z*16.+fbm(sq*3.)*6.);
   float wet=smoothstep(.55,.75,z)*(.6+.4*smoothstep(.65,1.05,z));
   sand=mix(sand,sand*vec3(.66,.62,.58),wet*.75);
   sand*=1.-.14*uWx;
   if(dw>0.){
    float far=smoothstep(1.,9.,z);
    vec3 w=mix(uSeaN,uSeaM,smoothstep(0.,.12,dw));
    w=mix(w,uSeaF,far);
    float c1=fbm(sq*3.+vec2(t*.2,-t*.15)),c2=fbm(sq*3.-vec2(t*.16,t*.1)+3.);
    w+=pow(clamp(1.-abs(c1-c2)*3.,0.,1.),7.)*.4*(1.-far);
    w+=.05*sin(z*18.-t*1.2+fbm(sq*2.)*5.)*(1.-far*.7);
    float gx=(uv.x-uSun.x)*asp*1.6;
    float g=exp(-gx*gx/(.02+(H-y)*.5));
    w+=uSunC*pow(n(vec2(wx*9.,z*6.)+vec2(t*1.3,t*.7)),12.)*3.*g*(.4+.6*min(uGlow,1.))*(1.-uWx);
    float path=exp(-gx*gx/(.012+(H-y)*.35));
    w+=uSunC*path*.32*uGlow*(1.-uWx)*(.6+.4*n(vec2(wx*5.,z*3.)+t*.5));
    w=mix(w,vec3(dot(w,vec3(.33)))*vec3(.8,.9,.95)*(1.-.2*uWx),uWx*.6);
    w+=uRain*.16*pow(n(vec2(wx*20.,z*14.)+vec2(floor(t*7.)*3.1,t*.5)),9.)*(1.-far)+uRain*.04*sin(z*30.+t*3.)*(1.-far);
    col=mix(sand,w,.3+.7*smoothstep(0.,.08,dw));
    col=mix(col,vec3(1.),step(.74,fbm(vec2(wx*1.3,z*1.8+t*.25)))*smoothstep(1.4,3.,z)*(1.-smoothstep(5.,12.,z))*.35);
    float ph=fract(t/9.-.25),crest=0.;
    for(int k=0;k<2;k++){
     float pk=fract(ph+float(k)*.5);
     float cz=S+.1+(1.-pk)*2.6;
     float yc=H-K/cz;
     float q=(y-yc+.004*sin(wx*3.+float(k)*2.))/(.004+.01*pk);
     float mask=smoothstep(.35,.7,fbm(vec2(wx*2.,float(k)*7.+t*.05)));
     crest+=exp(-q*q)*mask*(.3+.7*pk)*(1.-smoothstep(.5,.95,1.-pk));
    }
    float fo=(1.-smoothstep(0.,.03+.02*uSw,dw))*(.6+.4*fbm(sq*6.+vec2(0.,t*.3)));
    fo+=(1.-smoothstep(0.,.012,abs(dw-.05)))*step(.5,fbm(sq*5.+t*.35))*.6;
    fo+=crest*.95;
    col=mix(col,vec3(1.),clamp(fo,0.,1.)*.93);
    col=mix(col,uSkyH*vec3(.96,.98,1.),(1.-smoothstep(0.,.07+.08*uRain,H-y))*(.85+.1*uRain));
   }else{
    float lace=(1.-smoothstep(0.,.035,-dw))*step(.58,fbm(sq*8.+vec2(t*.05,0.)))*.6;
    lace+=(1.-smoothstep(0.,.006,-dw))*.7;
    col=mix(sand,vec3(1.),clamp(lace,0.,1.)*.85);
   }
   col*=uTint;
  }
  col*=1.-.2*pow(length(uv-.5)*1.25,2.);
  col+=vec3(.55,.6,.8)*uFlash;col+=(h(gl_FragCoord.xy)-.5)/160.;gl_FragColor=vec4(col,1.);}`})));
}

function buildPlanet(){
 const pg=new T.SphereGeometry(R,80,60),pos=pg.attributes.position,col=[],p=new T.Vector3(),c=new T.Color(),a=new T.Color(0x5bb85a),b=new T.Color(0x8bd870),s=new T.Color(0xf3deA6);
 for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);
  const v=Math.sin(p.x*.8+1)*Math.cos(p.y*.9)+Math.sin(p.z*1.1+p.x*.4)*.7+Math.sin(p.y*2.1+p.z*1.7)*.25;
  c.copy(a).lerp(b,Math.min(1,Math.max(0,v*.5+.5))).lerp(s,T.MathUtils.smoothstep(v,.8,1.1));col.push(c.r,c.g,c.b)}
 pg.setAttribute('color',new T.Float32BufferAttribute(col,3));
 window.planet=mk(pg,new T.MeshStandardMaterial({vertexColors:true,roughness:1}),0,0,0,world);planet.castShadow=false;
 window.atm=new T.Mesh(new T.SphereGeometry(R*1.09,48,32),new T.MeshBasicMaterial({color:0xd6f3ff,transparent:true,opacity:.28,side:T.BackSide,depthWrite:false}));scene.add(atm);
 window.hemi=new T.HemisphereLight(0xffffff,0xf1d9a0,.85);scene.add(hemi);
 const sun=window.sunL=new T.DirectionalLight(0xfff0d6,1.05);sun.position.set(7,14,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});sun.shadow.bias=-.0006;scene.add(sun);
 const fill=new T.DirectionalLight(0xbfe4ff,.3);fill.position.set(-6,4,14);scene.add(fill);
}

const TOP=new T.Vector3(0,1,0),_m=new T.Matrix4(),_f=new T.Vector3(),_x=new T.Vector3();
const nrm=(a,b)=>new T.Vector3(Math.sin(a)*Math.sin(b),Math.cos(a),-Math.sin(a)*Math.cos(b));
function basisQ(n,dir,out){_f.copy(dir).sub(_x.copy(n).multiplyScalar(dir.dot(n)));if(_f.lengthSq()<1e-4)_f.set(0,0,1);_f.normalize();_x.crossVectors(n,_f);_m.makeBasis(_x,n,_f);return out.setFromRotationMatrix(_m)}
function place(o,n,rot=0){o.position.copy(n).multiplyScalar(R-.03);basisQ(n,TOP,o.quaternion);o.rotateY(rot);world.add(o);o.userData.n=n;return o}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function label(t,s,bg,fg){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,256);g.strokeStyle=fg;g.lineWidth=10;g.setLineDash([22,14]);g.strokeRect(16,16,480,224);g.setLineDash([]);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';if(s){g.font='800 84px "Noto Sans KR",sans-serif';g.fillText(t,256,104);g.font='700 38px "Noto Sans KR",sans-serif';g.fillText(s,256,194)}else{g.font='800 112px "Noto Sans KR",sans-serif';g.fillText(t,256,134)}const x=new T.CanvasTexture(c);x.anisotropy=8;return x}
/* 귀여운 둥근 간판: 글자 기준 pad 만큼 여백, 둥근 모서리(투명), 안쪽 점선, 하이라이트 */
function labelBig(t,o){o=Object.assign({fs:96,pad:15,bw:12,bg:'#fff',bd:'#999',fg:'#333',sh:'#0002',dots:'#fff'},o);
 const f='800 '+o.fs+'px "Noto Sans KR",sans-serif',m=document.createElement('canvas').getContext('2d');m.font=f;
 const measured=o.as||t,parts=o.tight!=null&&/^(\S+) (.+)$/.exec(t),pw=parts?[Math.max(m.measureText(parts[1]).width,o.fs*1.15),m.measureText(parts[2]).width]:null,gp=parts?Math.max(6,m.measureText(' ').width-o.tight):0,tw=Math.ceil(parts?pw[0]+gp+pw[1]:m.measureText(measured).width),edge=o.pad+o.bw,w=tw+edge*2,h=Math.ceil(o.fs*1.3)+edge*2,
 c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),r=Math.min(h/2.4,46);
 g.fillStyle=o.bg;rr(g,o.bw/2,o.bw/2,w-o.bw,h-o.bw,r);g.fill();
 g.save();rr(g,o.bw/2,o.bw/2,w-o.bw,h-o.bw,r);g.clip();g.fillStyle='rgba(255,255,255,.45)';g.fillRect(0,0,w,h*.34);g.restore();
 g.strokeStyle=o.bd;g.lineWidth=o.bw;rr(g,o.bw/2,o.bw/2,w-o.bw,h-o.bw,r);g.stroke();
 g.strokeStyle=o.dots;g.lineWidth=3;g.setLineDash([2,9]);g.lineCap='round';rr(g,o.bw+5,o.bw+5,w-o.bw*2-10,h-o.bw*2-10,Math.max(r-o.bw-5,8));g.stroke();g.setLineDash([]);
 g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
 const dfs=o.fs*(o.fontScale||1),fd='800 '+dfs+'px "Noto Sans KR",sans-serif',scale=!parts&&o.fontScale&&o.fontScale!==1&&/^(\S+) (.+)$/.exec(t);
 g.font=fd;const ty=h/2+dfs*.04,x0=parts?(w-tw)/2:0,tx=parts?x0+pw[0]+gp:0;g.lineWidth=dfs*.16;
 if(parts){g.font=f;g.textAlign='left';g.fillText(parts[1],x0,h/2+o.fs*.04);g.font=fd}
 let dt;
 if(scale){const ew=m.measureText(scale[1]).width,sw=m.measureText(' ').width,ww=m.measureText(scale[2]).width,x=(w-(ew+sw+ww))/2;g.font=f;g.textAlign='left';g.fillText(scale[1],x,h/2+o.fs*.04);g.font=fd;g.textAlign='center';const cx=x+ew+sw+ww/2,ty2=h/2+dfs*.04;dt=(op,dx,dy)=>g[op](scale[2],cx+dx,ty2+dy)}
 else dt=(op,dx,dy)=>{if(parts){g.textAlign='left';g[op](parts[2],tx+dx,ty+dy)}else g[op](t,w/2+dx,ty+dy)};
 g.strokeStyle='#fff';dt('strokeText',0,0);
 g.fillStyle=o.sh;dt('fillText',2,4);g.fillStyle=o.fg;dt('fillText',0,0);
 const x=new T.CanvasTexture(c);x.anisotropy=8;x.userData={w,h};return x}
function signLabel(t,bg,fg){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,128);g.strokeStyle=fg;g.lineWidth=8;g.setLineDash([20,12]);g.strokeRect(12,12,488,104);g.setLineDash([]);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='800 80px "Noto Sans KR",sans-serif';g.fillText(t,256,68);const x=new T.CanvasTexture(c);x.anisotropy=8;return x}
/* 게시판: 코르크 위에 포스터와 F4 공지. 글자 '게시판'은 없음 */
function daejaLabel(){const w=980,h=736,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 g.fillStyle='#c9a36a';g.fillRect(0,0,w,h);
 for(let i=0;i<1400;i++){g.fillStyle=i%3?'rgba(90,58,24,.16)':'rgba(255,236,196,.2)';g.beginPath();g.arc(Math.random()*w,Math.random()*h,Math.random()*2.2,0,6.29);g.fill()}
 const sheet=(x,y,pw,ph,rot,fill)=>{g.save();g.translate(x+pw/2,y+ph/2);g.rotate(rot);g.fillStyle='rgba(40,24,8,.22)';g.fillRect(-pw/2+7,-ph/2+9,pw,ph);g.fillStyle=fill;g.fillRect(-pw/2,-ph/2,pw,ph);g.restore();return {x,y,pw,ph,rot}};
 const pin=(x,y,col)=>{g.save();g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.arc(x+2,y+3,11,0,6.29);g.fill();g.fillStyle=col;g.beginPath();g.arc(x,y,10,0,6.29);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-3,y-3,3.5,0,6.29);g.fill();g.restore()};
 sheet(58,78,430,500,-.04,'#ff8f6b');
 g.save();g.translate(273,328);g.rotate(-.04);g.fillStyle='#fff6ea';g.beginPath();g.arc(0,-70,78,0,6.29);g.fill();g.fillStyle='#7d4a32';g.fillRect(-16,-8,32,92);g.beginPath();g.arc(0,92,26,0,6.29);g.fill();g.fillStyle='#ffe08a';g.font='800 54px "Noto Sans KR",sans-serif';g.textAlign='center';g.fillText('OPEN',0,168);g.restore();
 pin(90,100,'#e23b3b');pin(450,96,'#3b7ddd');
 const nw=250,nh=400;sheet(560,48,nw,nh,.03,'#fffdf8');
 g.save();g.translate(560+nw/2,48+nh/2);g.rotate(.03);g.fillStyle='#d23b3b';g.fillRect(-nw/2,-nh/2,nw,54);g.fillStyle='#fff';g.font='800 32px "Noto Sans KR",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('공지',0,-nh/2+28);g.fillStyle='rgba(40,28,16,.28)';g.font='500 16px "Noto Sans KR",sans-serif';g.textAlign='left';for(let i=0;i<8;i++){g.fillRect(-nw/2+22,-nh/2+84+i*34,nw-44,8)}g.fillStyle='rgba(40,28,16,.45)';g.font='600 18px "Noto Sans KR",sans-serif';g.fillText('2026. 10. 25',-nw/2+22,nh/2-28);g.restore();
 pin(590,70,'#f2c14e');pin(790,78,'#e23b3b');
 sheet(300,470,210,200,.07,'#fff3b0');
 g.save();g.translate(405,570);g.rotate(.07);g.fillStyle='#7aaf4a';g.beginPath();g.arc(-30,-20,28,0,6.29);g.fill();g.fillStyle='#f2c14e';g.beginPath();g.arc(24,-8,22,0,6.29);g.fill();g.fillStyle='#e23b3b';g.beginPath();g.arc(-4,28,18,0,6.29);g.fill();g.restore();
 pin(330,490,'#3b7ddd');
 const x=new T.CanvasTexture(c);x.anisotropy=8;x.userData={w,h};return x}
const spotObjs=[],markers=[],rides=[];
function spot(k,g,n,y){
 g.userData.spot=k;place(g,n);
 const m=new T.Mesh(new T.OctahedronGeometry(.16,0),new T.MeshBasicMaterial({color:0xffd23f}));
 m.scale.set(1,1.4,1);m.position.set(0,y+1.3,0);g.add(m);
 spotObjs.push(g);markers.push({m,y:y+1.3});
}
function buildSpots(){
 const wood=M(0x8a5a3a),plane=(x,w,h)=>new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:x,transparent:true,alphaTest:.02}));
 let g=new T.Group();const bl=daejaLabel(),bw=2.15,bh=bw*bl.userData.h/bl.userData.w,top=1.12+bw*(460/980),poleH=Math.max(.08,top-bh),signY=poleH+bh/2;
 mk(new T.BoxGeometry(.12,poleH,.12),wood,0,poleH/2,-.02,g);
 mk(new T.BoxGeometry(bw+.12,bh+.12,.06),M(0x6b4228),0,signY,-.05,g);
 let pl=plane(bl,bw,bh);pl.position.set(0,signY,.04);g.add(pl);spot('board',g,nrm(.78,.75),signY+bh/2);
 g=new T.Group();mk(new T.BoxGeometry(2.8,1.5,1.8),M(0xffe8bf),0,.75,0,g);mk(new T.BoxGeometry(3.1,.2,2.1),M(0xff6f61),0,1.6,0,g);
 for(let i=0;i<7;i++){const s=mk(new T.BoxGeometry(.43,.08,.7),M(i%2?0xffffff:0xff6f61),(i-3)*.44,1.3,1.2,g);s.rotation.x=.5}
 mk(new T.BoxGeometry(.62,1,.06),M(0x6b4a3a),0,.5,.91,g);[-.95,.95].forEach(x=>mk(new T.BoxGeometry(.6,.5,.05),M(0x9be3ff,{emissive:0x4aa8c8,emissiveIntensity:.5}),x,.85,.91,g));
 const sl=labelBig('🛍️ 상점',{as:'🛍️ 쇼핑몰',fs:92,fontScale:.8,pad:15,bw:12,bg:'#fff1f3',bd:'#ff6f8f',fg:'#e0405f',dots:'#ffb3c4'}),sw2=3.1,sh2=sw2*sl.userData.h/sl.userData.w;mk(new T.BoxGeometry(sw2-.2,sh2-.2,.1),M(0xff6f8f),0,2.2,0,g);pl=plane(sl,sw2,sh2);pl.position.set(0,2.2,.06);g.add(pl);spot('shop',g,nrm(.8,-.55),1.4);
 g=new T.Group();mk(new T.BoxGeometry(.14,1,.14),wood,0,.5,0,g);mk(new T.BoxGeometry(.7,.55,1),M(0x4c8bf5),0,1.25,0,g);mk(new T.BoxGeometry(.05,.4,.05),M(0xdd3333),.38,1.55,0,g);
 pl=plane(label('문의','MAIL','#4c8bf5','#fff'),.55,.3);pl.position.set(0,1.25,.51);g.add(pl);spot('mail',g,nrm(1.05,2.35),1);
 const bn=spotObjs.find(s=>s.userData.spot==='board').userData.n,sn=spotObjs.find(s=>s.userData.spot==='shop').userData.n,mid=bn.clone().add(sn).normalize();
 world.quaternion.setFromUnitVectors(mid,new T.Vector3(0,1,0));
 world.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-.22));
 yaw=0;
 buildRides();
}
/* 미끄럼은 미끄럼 반대편 사다리에서 미끄럼 쪽을 보며 올라간다. 그네는 줄을 잡고 움직이기 전까지 탄다 */
function courseOf(parent,x){
 const blue=M(0x4aa3ff),yellow=M(0xffe14a),pink=M(0xff8ec8),coral=M(0xff6b8a),white=M(0xfff7fb),mint=M(0x5ce1c5);
 [-.28,.28].forEach(s=>mk(new T.BoxGeometry(.09,1.5,.09),blue,x+s,.75,-.62,parent));
 for(let i=0;i<4;i++)mk(new T.BoxGeometry(.58,.08,.08),i%2?yellow:pink,x,.32+i*.3,-.62,parent);
 mk(new T.BoxGeometry(.86,.1,.62),pink,x,1.48,-.28,parent);
 [-.36,.36].forEach(s=>mk(new T.BoxGeometry(.09,1.48,.09),blue,x+s,.74,-.22,parent));
 const chute=new T.Group();chute.position.set(x,.735,.515);chute.rotation.x=.83;parent.add(chute);
 mk(new T.BoxGeometry(.72,.08,1.586),yellow,0,0,0,chute);
 mk(new T.BoxGeometry(.08,.26,1.586),coral,-.36,.12,0,chute);
 mk(new T.BoxGeometry(.08,.26,1.586),coral,.36,.12,0,chute);
 mk(new T.BoxGeometry(.72,.04,.22),white,0,.05,.55,chute);
 mk(new T.BoxGeometry(.8,.08,.22),mint,x,.08,1.12,parent);
 const steps=[.36,.66,.96,1.26].map(y=>new T.Vector3(x,y,-.62));
 steps.push(new T.Vector3(x,1.53,-.28));
 parent.userData.foot=new T.Vector3(x,.06,-1.28);
 parent.userData.steps=steps;
 parent.userData.top=steps[steps.length-1];
 parent.userData.exit=new T.Vector3(x,.2,1.05);
 parent.userData.land=new T.Vector3(x,.02,1.18);
}
function buildRides(){
 const post=M(0x5b7cfa),top=M(0xffe14a),ball=M(0xff5d8f),rope=M(0xfff6ea),seat=M(0x7d5cff),end=M(0xff8ec8),foot=M(0x5ce1c5);
 const g=new T.Group();
 courseOf(g,0);
 place(g,nrm(.62,-2.15),-155*Math.PI/180);g.userData.ride='slide';
 g.userData.stand=g.userData.foot.clone().applyQuaternion(g.quaternion).add(g.position).normalize();
 rides.push(g);
 const w=new T.Group();
 [-1.28,1.28].forEach(x=>{mk(new T.BoxGeometry(.1,3.25,.1),post,x,1.62,0,w);mk(new T.BoxGeometry(.36,.08,.36),foot,x,.05,0,w)});
 mk(new T.BoxGeometry(2.76,.1,.1),top,0,3.25,0,w);
 mk(new T.SphereGeometry(.12,12,10),ball,0,3.42,0,w);
 const pivot=new T.Group();pivot.position.set(0,3.18,0);w.add(pivot);
 [-.58,.58].forEach(x=>mk(new T.CylinderGeometry(.028,.028,2.35,8),rope,x,-1.17,0,pivot));
 mk(new T.BoxGeometry(1.18,.08,.46),seat,0,-2.32,0,pivot);
 mk(new T.BoxGeometry(.08,.22,.46),end,-.58,-2.2,0,pivot);
 mk(new T.BoxGeometry(.08,.22,.46),end,.58,-2.2,0,pivot);
 place(w,nrm(1.5,-2.2));w.userData.ride='swing';w.userData.pivot=pivot;
 w.userData.front=new T.Vector3(0,.02,.72);
 w.userData.stand=w.userData.front.clone().applyQuaternion(w.quaternion).add(w.position).normalize();
 rides.push(w);
 window.rideN=[g.userData.n,g.userData.stand,w.userData.n,w.userData.stand];
 EX.push({n:g.userData.n.clone(),r:.34},{n:w.userData.n.clone(),r:.4});
}
function buildProps(){
 let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const gT=new T.CylinderGeometry(.07,.1,.5,6),gC=new T.ConeGeometry(.45,.9,8),gS=new T.IcosahedronGeometry(.5,1),gF=new T.SphereGeometry(.09,8,6),gR=new T.DodecahedronGeometry(.3,0),gL=new T.ConeGeometry(.13,1,4),gP=new T.CylinderGeometry(.06,.1,1.5,6),gU=new T.ConeGeometry(.9,.4,10);
 const trunk=M(0x8a5a3a),pine=M(0x3f9d5a),leaf=M(0x6bcf63),rock=M(0xa9b0b5,{flatShading:true}),stem=M(0x3f9a45),red=M(0xff5a5f),white=M(0xffffff),used=window.propN=(window.rideN||[]).map(v=>{const c=v.clone();c.ride=1;return c});
 const free=(n,m)=>n.angleTo(TOP)>.4&&spotObjs.every(s=>s.userData.n.angleTo(n)>(s.userData.spot==='board'?Math.max(m,.78):m))&&used.every(u=>u.angleTo(n)>(u.ride?0.7:0.16));
 const spawn=(cnt,fn,m)=>{for(let i=0,k=0;i<cnt&&k<800;k++){const n=new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize();if(!free(n,m))continue;used.push(n);const g=new T.Group();fn(g);g.scale.setScalar(.9+rnd()*.35);place(g,n,rnd()*6.28);i++}};
 spawn(10,g=>{mk(gT,trunk,0,.25,0,g);mk(gC,pine,0,.8,0,g);mk(gC,pine,0,1.15,0,g).scale.setScalar(.75)},.55);
 spawn(8,g=>{mk(gT,trunk,0,.25,0,g);mk(gS,leaf,0,.85,0,g)},.55);
 spawn(9,g=>{const t=mk(gP,trunk,0,.75,0,g);t.rotation.z=.12;for(let i=0;i<6;i++){const a=new T.Group();a.rotation.y=i*1.047;const l=mk(gL,leaf,.45,1.55,0,a);l.rotation.z=-Math.PI/2-.45;l.scale.z=.3;g.add(a)}},.6);
 spawn(3,g=>{mk(new T.CylinderGeometry(.03,.03,1.3,6),white,0,.65,0,g);const u=mk(gU,red,0,1.35,0,g);u.rotation.z=.12},.7);
 spawn(10,g=>{const m=mk(gR,rock,0,.15,0,g);m.scale.set(1+rnd(),.7,1+rnd()*.5)},.5);
 /* 나무·바위·놀이기구가 비운 잔디에 여러 종류의 꽃 */
 const PM={},petal=c=>PM[c]||(PM[c]=M(c,{roughness:.46})),pick=a=>a[Math.floor(rnd()*a.length)];
 const stG=new T.CylinderGeometry(.02,.028,.48,5),stT=new T.CylinderGeometry(.028,.04,.78,5),stB=new T.CylinderGeometry(.012,.016,.2,4);
 const lfG=new T.SphereGeometry(.12,6,4),peG=new T.SphereGeometry(.1,7,5),cuG=new T.ConeGeometry(.065,.26,6),bdG=new T.SphereGeometry(.055,6,5),dcG=new T.CylinderGeometry(.14,.14,.05,10);
 const flm=(geo,mt,x,y,z,p)=>{const o=mk(geo,mt,x,y,z,p);o.castShadow=false;return o};
 const leafOf=(p,x,y,z,rz)=>{const l=flm(lfG,leaf,x,y,z,p);l.scale.set(1.5,.24,.62);l.rotation.z=rz};
 const around=(p,n,geo,mt,r,y,rz,sc)=>{for(let i=0;i<n;i++){const a=new T.Group();a.rotation.y=i*Math.PI*2/n+(rnd()-.5)*.08;const m=flm(geo,mt,r,y,0,a);if(rz)m.rotation.z=rz;if(sc)m.scale.set(sc[0],sc[1],sc[2]);p.add(a)}};
 function daisy(g){const c=petal(pick([0xfff7fb,0xff9ec8,0xffd0ea,0xd4c2ff,0xfff0a8]));flm(stG,stem,0,.2,0,g);leafOf(g,.09,.12,0,-.75);around(g,8,peG,c,.16,.48,0,[1.25,.38,.72]);flm(bdG,petal(0xffe14a),0,.52,.02,g)}
 function tulip(g){const c=petal(pick([0xff4d6d,0xff8ec8,0xffe14a,0xb388ff,0xff7a3c]));flm(stG,stem,0,.18,0,g);leafOf(g,.1,.12,0,-.95);leafOf(g,-.08,.1,.02,.8);around(g,5,cuG,c,.045,.46,-.42,null)}
 function rose(g){const c=petal(pick([0xe23b5a,0xff6f91,0xffb3c7,0xc73b6e]));flm(stG,stem,0,.16,0,g);leafOf(g,.1,.12,0,-.6);around(g,5,peG,c,.1,.34,0,[1.05,.5,.72]);around(g,5,peG,c,.07,.46,.25,[.8,.48,.65]);flm(bdG,c,0,.54,0,g)}
 function poppy(g){const c=petal(pick([0xff5d6c,0xff8a3d,0xfff1a8,0xff4d6d]));flm(stG,stem,0,.14,0,g);leafOf(g,.08,.1,0,-.55);around(g,4,peG,c,.13,.34,0,[1.75,.3,1.2]);flm(bdG,petal(0x2a1a14),0,.36,.03,g)}
 function lily(g){const c=petal(pick([0xfff7fb,0xffb3d9,0xff9a56,0xffe08a]));flm(stT,stem,0,.28,0,g);leafOf(g,.12,.16,0,-.85);around(g,6,cuG,c,.07,.62,-1.05,null);for(let i=0;i<3;i++){const a=new T.Group();a.rotation.y=i*2.094;flm(bdG,petal(0xffe14a),.04,.66,0,a);g.add(a)}}
 function hyacinth(g){const c=petal(pick([0x8a6cff,0xff8ec8,0x5ec8ff,0xff6f91]));flm(stG,stem,0,.22,0,g);[[0,.42,0],[.06,.5,.02],[-.05,.49,.04],[.03,.57,-.05],[-.04,.58,.02],[0,.65,0],[.05,.62,.03],[-.035,.63,-.04]].forEach(p=>{const s=flm(bdG,c,p[0],p[1],p[2],g);s.scale.setScalar(1.2)})}
 function cherry(g){flm(stB,stem,0,.08,0,g);const a=petal(0xffb7d5),b=petal(0xff8eb8),w=petal(0xfff7fb);[[0,.24,0,a],[.12,.32,.04,b],[-.11,.3,.05,a],[.04,.4,-.06,w],[-.05,.38,.06,b],[.13,.22,-.05,a],[-.12,.2,.02,w]].forEach(p=>{const s=flm(bdG,p[3],p[0],p[1],p[2],g);s.scale.setScalar(1.4)})}
 function blossom(g){const c=petal(pick([0xfff7fb,0xffd0ea,0xffe14a,0xc9b6ff,0xff9ec8]));flm(stB,stem,0,.08,0,g);around(g,5,peG,c,.08,.18,0,[.9,.32,.62]);flm(bdG,petal(0xffe14a),0,.2,0,g)}
 function sunflower(g){flm(stT,stem,0,.36,0,g);leafOf(g,.14,.24,0,-.5);leafOf(g,-.12,.3,.02,.6);around(g,10,peG,petal(0xffe14a),.22,.76,.15,[1.5,.36,.78]);flm(dcG,petal(0x8a4b1f),0,.78,0,g);flm(bdG,petal(0x5c3212),0,.82,0,g)}
 const kinds=[daisy,tulip,poppy,daisy,rose,lily,cherry,hyacinth,blossom,poppy];
 const homes=[nrm(.62,-1.2),nrm(.7,-1),nrm(.9,-.3)],ridePad=[.3,.28,.44,.42];
 used.forEach((u,i)=>{if(u.ride)u.pad=ridePad[i]||.4});
 flowerN=[];flowerSway.length=0;
 function canPlant(n,gap){
  if(n.y>.99)return false;
  for(const s of spotObjs){const sp=s.userData.spot,pad=sp==='board'?.36:sp==='shop'?.52:sp==='mail'?.24:.3;if(s.userData.n.angleTo(n)<pad)return false}
  for(const u of used)if(u.angleTo(n)<(u.ride?u.pad:gap))return false;
  for(const h of homes)if(h.angleTo(n)<.18)return false;
  return true}
 function plant(n,build,sc){const g=new T.Group(),inner=new T.Group();g.add(inner);build(inner);g.scale.setScalar(sc);place(g,n,rnd()*6.28);used.push(n);flowerN.push(n);flowerSway.push({g:inner,ph:rnd()*6.28,a:.03+rnd()*.04})}
 function scatter(center,minA,maxA,cnt,tries,gap,sc0,sc1,tall,even){
  const up=center.clone().normalize(),t=new T.Vector3().crossVectors(up,Math.abs(up.y)>.85?new T.Vector3(1,0,0):new T.Vector3(0,1,0)).normalize(),b=new T.Vector3().crossVectors(up,t);
  for(let i=0,k=0;i<cnt&&k<tries;k++){const ang=even?Math.acos(Math.cos(minA)-rnd()*(Math.cos(minA)-Math.cos(maxA))):minA+rnd()*(maxA-minA),az=rnd()*6.28,n=new T.Vector3().copy(up).multiplyScalar(Math.cos(ang)).addScaledVector(t,Math.sin(ang)*Math.cos(az)).addScaledVector(b,Math.sin(ang)*Math.sin(az)).normalize();
   if(!canPlant(n,gap))continue;plant(n,(tall&&i%6===0?sunflower:kinds[(i+k)%kinds.length]),sc0+rnd()*sc1);i++}}
 const feet=new T.Vector3(0,1,0).applyQuaternion(world.quaternion.clone().invert());
 const front=new T.Vector3(-.09,.5,.86).normalize().applyQuaternion(world.quaternion.clone().invert());
 const slideN=rides.find(r=>r.userData.ride==='slide').userData.n;
 const centers=[front.clone(),feet.clone()];
 for(let i=centers.length,k=0;i<8&&k<500;k++){
  const n=new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize();
  if(n.y<-.22||n.angleTo(TOP)<.28)continue;
  if(!canPlant(n,.16))continue;
  if(centers.some(c=>c.angleTo(n)<.7))continue;
  centers.push(n);i++}
 centers.forEach((c,i)=>{
  const dense=i<2||rnd()<.5,cnt=dense?16+Math.floor(rnd()*12):2+Math.floor(rnd()*4),rad=dense?.2+rnd()*.22:.08+rnd()*.1;
  const minA=i===1?.24:c.angleTo(slideN)<.25?.36:.02;
  scatter(c,minA,minA+rad,cnt,cnt*45,dense?.062:.1,.9+rnd()*.2,.7,dense&&rnd()<.45,false)});
 for(let i=0,k=0;i<12&&k<900;k++){
  const n=new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize();
  if(n.y<-.15||!canPlant(n,.55))continue;
  plant(n,i%8===0?sunflower:kinds[i%kinds.length],.95+rnd()*.7);i++}
 window.bfs=[];const bc=[0xff8fb1,0xffd23f,0x8fd0ff,0xc79bff,0xff9a56];
 for(let i=0;i<12&&flowerN.length;i++){const g=new T.Group(),mt=new T.MeshBasicMaterial({color:bc[i%5],side:T.DoubleSide}),pw=()=>{const pv=new T.Group(),m=new T.Mesh(new T.CircleGeometry(.17,12),mt);m.rotation.x=-Math.PI/2;pv.add(m);return[pv,m]};
  const[pR,mR]=pw(),[pL,mL]=pw();mR.position.x=.17;mL.position.x=-.17;const bd=new T.Mesh(new T.SphereGeometry(.05,8,6),new T.MeshBasicMaterial({color:0x3a2a2a}));bd.scale.set(.5,.5,1.7);g.add(pR,pL,bd);g.scale.setScalar(1.2);world.add(g);
  const t0=flowerN[Math.floor(Math.random()*flowerN.length)];bfs.push({g,pR,pL,cn:t0.clone(),tg:t0,sw:Math.random()*8,ph:Math.random()*6.28,sp:.7+Math.random()*.6,rad:.45+Math.random()*.4,h:.9+Math.random()*.5})}
}
const bT1=new T.Vector3(),bT2=new T.Vector3(),bP=new T.Vector3(),bP2=new T.Vector3(),bN=new T.Vector3();
function bfUpdate(dt){if(!window.bfs||!flowerN.length)return;
 for(const b of bfs){b.sw-=dt;if(b.sw<=0){b.sw=6+Math.random()*8;b.tg=flowerN[Math.floor(Math.random()*flowerN.length)]}
  b.cn.lerp(b.tg,Math.min(1,dt*.7)).normalize();const n=b.cn;bT1.set(0,1,0).cross(n);if(bT1.lengthSq()<.01)bT1.set(1,0,0);bT1.normalize();bT2.crossVectors(n,bT1);
  const pos=(a,o)=>o.copy(n).multiplyScalar(R+b.h+.18*Math.sin(tw*2.3+b.ph)).addScaledVector(bT1,Math.cos(a)*b.rad).addScaledVector(bT2,Math.sin(a*1.3)*b.rad),a=tw*b.sp+b.ph;
  pos(a,bP);pos(a+.08,bP2);b.g.position.copy(bP);bN.copy(bP).normalize();bP2.sub(bP);bP2.addScaledVector(bN,-bP2.dot(bN));if(bP2.lengthSq()<1e-8)bP2.set(0,0,1);bP2.normalize();
  basisQ(bN,bP2,b.g.quaternion);const fl=.25+.8*Math.abs(Math.sin(tw*16+b.ph));b.pR.rotation.z=fl;b.pL.rotation.z=-fl}}
let boy,legs,arms,body,boyHead=null,legHome=[],lying=0,placeMeshes=[],yaw=0,flowerN=[],flowerSway=[];
function buildBoy(){
 const g=new T.Group(),sk=M(0xffd9b8,{roughness:.6}),sh=M(0xff7a59),pa=M(0x3b6ea5),ha=M(0x4a2f20),wh=M(0xffffff),dk=new T.MeshBasicMaterial({color:0x2a1a14});
 body=new T.Group();g.add(body);
 mk(new T.CylinderGeometry(.3,.36,.55,16),sh,0,.62,0,body);
 mk(new T.BoxGeometry(.5,.55,.25),M(0xffc93c),0,.68,-.38,body);
 const hd=new T.Group();hd.position.y=1.4;body.add(hd);boyHead=hd;
 mk(new T.SphereGeometry(.58,32,24),sk,0,0,0,hd);
 const hr=mk(new T.SphereGeometry(.61,32,18,0,6.2832,0,Math.PI*.52),ha,0,.03,-.05,hd);hr.rotation.x=-.4;
 mk(new T.SphereGeometry(.3,16,12),ha,0,.42,.34,hd).scale.set(1.5,.55,.6);
 const ah=mk(new T.ConeGeometry(.08,.3,6),ha,0,.66,.02,hd);ah.rotation.x=.3;
 [-1,1].forEach(s=>{mk(new T.SphereGeometry(.075,12,10),dk,s*.2,-.04,.54,hd).scale.y=1.4;mk(new T.SphereGeometry(.026,8,6),wh,s*.2+.02,.03,.6,hd);
  mk(new T.SphereGeometry(.09,10,8),new T.MeshBasicMaterial({color:0xff9fa8}),s*.34,-.17,.44,hd).scale.z=.35;mk(new T.SphereGeometry(.1,10,8),sk,s*.58,-.03,0,hd).scale.x=.6});
 mk(new T.TorusGeometry(.075,.016,6,14,Math.PI),dk,0,-.1,.56,hd).rotation.z=Math.PI;
 arms=[];legs=[];
 [-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.4,.84,0);mk(new T.CylinderGeometry(.08,.09,.36,10),sh,0,-.17,0,a);mk(new T.SphereGeometry(.09,10,8),sk,0,-.38,0,a);body.add(a);arms.push(a);
  const l=new T.Group();l.position.set(s*.16,.36,0);mk(new T.CylinderGeometry(.11,.11,.26,10),pa,0,-.12,0,l);mk(new T.SphereGeometry(.14,12,10),wh,0,-.3,.05,l).scale.set(1,.7,1.3);g.add(l);legs.push(l)});
 g.position.set(0,R,0);g.scale.setScalar(1.15);boy=g;scene.add(g);legHome=legs.map(l=>({x:l.position.x,y:l.position.y,z:l.position.z}));
}

/* ===== 오디오 (파도 소리 합성) ===== */
let ac,mast,gL,gA,gB,fA,fB,gF,gS,gD,fD,gRn,muted=false,vol=.2;
const mg=()=>muted?0:vol*.5/3,sg=()=>muted?0:Math.min(1,vol*2.5);let sfx,pet;
function noise(kind){const sr=ac.sampleRate,len=sr*6,fd=sr>>1,b=ac.createBuffer(1,len,sr),d=b.getChannelData(0);let l=0,e=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
 for(let i=0;i<len;i++){const w=Math.random()*2-1;
  if(kind==='brown'){l=(l+.02*w)/1.02;d[i]=l*3.5}
  else if(kind==='pink'){b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.2;b6=w*.115926}
  else if(kind==='crackle'){if(Math.random()<.003)e=.4+Math.random()*.6;e*=.84;d[i]=w*e*4}
  else d[i]=w}
 for(let i=0;i<fd;i++)d[i]=d[i]*(i/fd)+d[len-fd+i]*(1-i/fd);
 const s=ac.createBufferSource();s.buffer=b;s.loop=true;s.loopEnd=(len-fd)/sr;s.start();return s}
const flt=(t,f,q)=>{const x=ac.createBiquadFilter();x.type=t;x.frequency.value=f;if(q)x.Q.value=q;return x};
function startAudio(){
 if(ac)return;
 try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 sfx=ac.createGain();sfx.gain.value=sg();sfx.connect(ac.destination);pet=ac.createGain();pet.gain.value=.08;pet.connect(sfx);mast=ac.createGain();mast.gain.value=0;mast.connect(ac.destination);mast.gain.setTargetAtTime(mg(),ac.currentTime,2);
 const pan=v=>{if(!ac.createStereoPanner)return ac.createGain();const p=ac.createStereoPanner();p.pan.value=v;return p},lpf=f=>flt('lowpass',f);
 gL=ac.createGain();noise('brown').connect(lpf(300)).connect(gL).connect(mast);
 gA=ac.createGain();fA=flt('bandpass',700,.5);noise('pink').connect(fA).connect(lpf(5200)).connect(gA).connect(pan(-.5)).connect(mast);
 gB=ac.createGain();fB=flt('bandpass',600,.5);noise('pink').connect(fB).connect(lpf(4800)).connect(gB).connect(pan(.5)).connect(mast);
 gF=ac.createGain();noise('pink').connect(flt('highpass',2600)).connect(lpf(8000)).connect(gF).connect(mast);
 gS=ac.createGain();noise('crackle').connect(flt('bandpass',4200,.7)).connect(lpf(9000)).connect(gS).connect(pan(.15)).connect(mast);
 gD=ac.createGain();fD=flt('bandpass',1500,1.1);noise('pink').connect(fD).connect(lpf(5000)).connect(gD).connect(pan(-.2)).connect(mast);
 gRn=ac.createGain();noise('white').connect(flt('highpass',900)).connect(lpf(7500)).connect(gRn).connect(mast);
 const unlock=()=>{if(ac.state!=='running')ac.resume()};
 ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{passive:true}));
 setTimeout(()=>{if(ac.state!=='running')toast('🔊 화면을 한 번 터치하면 파도 소리가 켜져요')},500);
}
const SP='<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
const volIcon=()=>{const lv=muted||vol===0?0:vol<.34?1:vol<.67?2:3;$('#snd').innerHTML=SP+(lv===0?'<path d="M16 9.5l5 5M21 9.5l-5 5"/>':lv===1?'<path d="M15.5 10.5a2.5 2.5 0 0 1 0 3"/>':lv===2?'<path d="M15.5 9a4.5 4.5 0 0 1 0 6"/>':'<path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>')+'</svg>'};
const applyVol=()=>{volIcon();if(ac){mast.gain.setTargetAtTime(mg(),ac.currentTime,.1);sfx.gain.setTargetAtTime(sg(),ac.currentTime,.1);ac.resume()}};
$('#snd').onclick=()=>{if(vol===0){vol=.2;$('#vol').value=20;muted=false}else muted=!muted;applyVol()};
$('#vol').addEventListener('input',e=>{vol=e.target.value/100;muted=false;applyVol()});
volIcon();
function noiseBuf(d){const n=Math.ceil(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;return b}
/* 귀여운 강아지 "멍!": 높은 소리에서 뚝 떨어지는 짧은 통통한 소리 + 입 모양(우→아) 포먼트 */
function bark(){if(!ac||ac.state!=='running'||muted||vol===0)return;const t=ac.currentTime,p=1+(Math.random()-.5)*.08,
 o=ac.createOscillator(),o2=ac.createOscillator(),f1=flt('bandpass',500,4),f2=flt('bandpass',1500,5),g1=ac.createGain(),g2=ac.createGain(),gn=ac.createGain();
 o.type='sawtooth';o2.type='triangle';
 o.frequency.setValueAtTime(520*p,t);o.frequency.exponentialRampToValueAtTime(330*p,t+.1);o.frequency.exponentialRampToValueAtTime(250*p,t+.2);
 o2.frequency.setValueAtTime(260*p,t);o2.frequency.exponentialRampToValueAtTime(125*p,t+.2);
 f1.frequency.setValueAtTime(420,t);f1.frequency.exponentialRampToValueAtTime(820,t+.06);f1.frequency.exponentialRampToValueAtTime(600,t+.2);
 f2.frequency.setValueAtTime(1100,t);f2.frequency.exponentialRampToValueAtTime(1500,t+.07);f2.frequency.exponentialRampToValueAtTime(1100,t+.2);
 g1.gain.value=1;g2.gain.value=.55;
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(.6,t+.015);gn.gain.setValueAtTime(.45,t+.08);gn.gain.exponentialRampToValueAtTime(.001,t+.24);
 o.connect(f1);o2.connect(f1);f1.connect(g1);g1.connect(gn);o.connect(f2);f2.connect(g2);g2.connect(gn);gn.connect(pet);
 const nz=ac.createBufferSource(),nf=flt('bandpass',2200,1.2),ng=ac.createGain();nz.buffer=noiseBuf(.06);ng.gain.setValueAtTime(.18,t);ng.gain.exponentialRampToValueAtTime(.001,t+.05);nz.connect(nf);nf.connect(ng);ng.connect(pet);nz.start(t);
 o.start(t);o2.start(t);o.stop(t+.26);o2.stop(t+.26)}
/* 자연스러운 고양이 "야~옹": 성대음(톱니파) + 입 모양 변화(이→아→오) 포먼트 + 살짝 떨림 + 숨소리 */
function meow(){if(!ac||ac.state!=='running'||muted||vol===0)return;const t=ac.currentTime,D=.85,p=1+(Math.random()-.5)*.06,
 o=ac.createOscillator(),vib=ac.createOscillator(),vg=ac.createGain(),f1=flt('bandpass',500,5),f2=flt('bandpass',2300,6),f3=flt('bandpass',3200,4),
 g1=ac.createGain(),g2=ac.createGain(),g3=ac.createGain(),gn=ac.createGain();
 o.type='sawtooth';
 o.frequency.setValueAtTime(470*p,t);o.frequency.linearRampToValueAtTime(560*p,t+.12);o.frequency.linearRampToValueAtTime(720*p,t+.3);o.frequency.linearRampToValueAtTime(680*p,t+.5);o.frequency.linearRampToValueAtTime(470*p,t+D);
 vib.frequency.value=5.5;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(10,t+.45);vib.connect(vg);vg.connect(o.frequency);
 f1.frequency.setValueAtTime(420,t);f1.frequency.linearRampToValueAtTime(900,t+.28);f1.frequency.linearRampToValueAtTime(850,t+.5);f1.frequency.linearRampToValueAtTime(520,t+D);
 f2.frequency.setValueAtTime(2500,t);f2.frequency.linearRampToValueAtTime(1700,t+.28);f2.frequency.linearRampToValueAtTime(1500,t+.5);f2.frequency.linearRampToValueAtTime(950,t+D);
 f3.frequency.value=3300;g1.gain.value=1;g2.gain.value=.5;g3.gain.value=.18;
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(.28,t+.07);gn.gain.linearRampToValueAtTime(.4,t+.3);gn.gain.setValueAtTime(.34,t+.55);gn.gain.exponentialRampToValueAtTime(.001,t+D);
 o.connect(f1);o.connect(f2);o.connect(f3);f1.connect(g1);f2.connect(g2);f3.connect(g3);g1.connect(gn);g2.connect(gn);g3.connect(gn);gn.connect(pet);
 const nz=ac.createBufferSource(),nf=flt('highpass',3500,.7),ng=ac.createGain();nz.buffer=noiseBuf(D);ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(.035,t+.1);ng.gain.exponentialRampToValueAtTime(.001,t+D);nz.connect(nf);nf.connect(ng);ng.connect(pet);nz.start(t);
 o.start(t);vib.start(t);o.stop(t+D+.05);vib.stop(t+D+.05)}
const audioTick=sw=>{if(!ac||ac.state!=='running')return;const t=ac.currentTime,ds=(swell(tw+.06)-swell(tw-.06))/.12,ri=Math.min(1,Math.max(0,ds*3)),fa=Math.min(1,Math.max(0,-ds*3)),s2=swell(tw+2.3),j=1+.08*Math.sin(tw*1.9)+.05*Math.sin(tw*3.7+1);
 gL.gain.setTargetAtTime((.04+.26*sw*sw)*j,t,.2);
 gA.gain.setTargetAtTime((.05+.3*sw)*j,t,.18);fA.frequency.setTargetAtTime(450+2300*sw,t,.2);
 gB.gain.setTargetAtTime(.04+.24*s2,t,.18);fB.frequency.setTargetAtTime(400+2000*s2,t,.2);
 gF.gain.setTargetAtTime(.008+.12*ri*sw+.02*sw*sw,t,.12);
 gS.gain.setTargetAtTime(.012+.26*fa*(.4+.6*sw)+.03*sw,t,.12);
 gD.gain.setTargetAtTime(.02+.2*fa,t,.2);fD.frequency.setTargetAtTime(900+1600*(1-sw),t,.3);
 gRn.gain.setTargetAtTime(.2*wxc.rain,t,.6)};

/* ===== 조작 (화면 기준 방향) ===== */
const keys={};let jx=0,jy=0,near=null,nearRide=null,jh=0,jv=0;
const MV=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
 if(modalOpen){if(k==='escape')closeModal();return}
 if(MV.includes(k)){if(snack)endSnack();keys[k]=true;auto=null;stopLie();e.preventDefault()}
 if(k===' '){if(ride)return;if(snack)endSnack();stopLie();e.preventDefault();if(!e.repeat&&jh<=0)jv=6.5}
 if((k==='enter'||k==='e')&&near){e.preventDefault();openSpot(near)}
 else if((k==='enter'||k==='e')&&nearRide){e.preventDefault();goRide(nearRide)}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
$('#act').onclick=()=>{if(near)openSpot(near);else if(nearRide)goRide(nearRide)};
const joy=$('#joy'),knob=joy.firstElementChild;let jid=null;
const jm=e=>{const r=joy.getBoundingClientRect(),x=(e.clientX-r.left-60)/44,y=(e.clientY-r.top-60)/44,l=Math.hypot(x,y),k=l>1?1/l:1;jx=x*k;jy=y*k;knob.style.transform=`translate(${jx*30}px,${jy*30}px)`;if(l>.2){if(snack)endSnack();auto=null;stopLie()}};
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jm(e)});
const jend=()=>{jid=null;jx=jy=0;knob.style.transform=''};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
let rot=null;const ob={x:0,y:0},oE=new T.Euler(0,0,0,'YXZ'),oQ=new T.Quaternion(),oT=new T.Vector3();
const ray=new T.Raycaster(),v2=new T.Vector2(),pts=new Map(),fx=[];let dx=0,dy=0,pd=0,multi=false,zm=1,zt=1;
cv.addEventListener('pointerdown',e=>{if(e.button===2){rot={id:e.pointerId,x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId)}catch(_){}return}pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===1){multi=false;dx=e.clientX;dy=e.clientY}else{multi=true;pd=0}});
cv.addEventListener('pointermove',e=>{if(rot&&e.pointerId===rot.id){if(!(e.buttons&2)){rot=null;return}ob.y-=(e.clientX-rot.x)*.006;ob.x=Math.max(-1.3,Math.min(1.3,ob.x-(e.clientY-rot.y)*.006));rot.x=e.clientX;rot.y=e.clientY;return}if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
 if(pts.size===2){if(snack)return;const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)zt=Math.min(1.35,Math.max(.38,zt*pd/d));pd=d}});
cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);rot=null});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{e.preventDefault();if(snack)return;zt=Math.min(1.35,Math.max(.38,zt*Math.exp(e.deltaY*.001)))},{passive:false});
function ring(n){const o=new T.Mesh(new T.RingGeometry(.22,.32,28),new T.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.9,depthWrite:false}));o.position.copy(n).multiplyScalar(R+.04);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);o.userData={a:0,life:.8,ring:true};world.add(o);fx.push(o)}
cv.addEventListener('pointerup',e=>{if(rot&&e.pointerId===rot.id){rot=null;return}pts.delete(e.pointerId);if(modalOpen||multi||Math.hypot(e.clientX-dx,e.clientY-dy)>10)return;
 v2.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(v2,cam);
 const hit=ray.intersectObjects([...spotObjs,...rides,...placeMeshes,planet],true)[0];if(!hit)return; let o=hit.object;while(o&&o!==planet&&!o.userData.spot&&!o.userData.ride&&!o.userData.towel&&!o.userData.towelHost)o=o.parent;if(!o)return;
 if(o.userData.towelHost)o=o.userData.towelHost;
 if(snack)endSnack();
 if(o.userData.towel){goTowel(o);return}
 if(o.userData.ride){if(!(ride&&ride.kind==='swing')){goRide(o);return}}
 if(ride){if(ride.kind==='swing'&&o===planet){const n=world.worldToLocal(hit.point.clone()).normalize();ride.after={n,reach:.04};rideOff();ring(n)}return}
 if(o===planet){const n=world.worldToLocal(hit.point.clone()).normalize();let towel=null,best=.42;for(const g of placeMeshes){if(!g.userData.towel||!g.userData.n)continue;const a=n.angleTo(g.userData.n);if(a<best){best=a;towel=g}}if(towel&&!(ride&&ride.kind==='slide')){goTowel(towel);return}stopLie();auto={n,reach:.04};ring(n)}
 else auto={n:o.userData.n,reach:SPOTS[o.userData.spot].reach,spot:o.userData.spot}});
const gPuff=new T.SphereGeometry(1,10,8);
function puff(){const o=new T.Mesh(gPuff,new T.MeshBasicMaterial({color:0xfff6e0,transparent:true,opacity:.55,depthWrite:false}));o.position.copy(world.worldToLocal(new T.Vector3((Math.random()-.5)*.3,R+.06,(Math.random()-.5)*.3)));o.scale.setScalar(.08);o.userData={a:0,life:.6};world.add(o);fx.push(o)}

/* ===== 시간대 / 바다 친구들 ===== */
const IC=[
'<svg viewBox="0 0 24 24"><path d="M3 19h18M7 19a5 5 0 0 1 10 0M12 4v6M9.5 6.5L12 4l2.5 2.5"/></svg>',
'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>',
'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" style="fill:currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>',
'<svg viewBox="0 0 24 24"><path d="M3 19h18M7 19a5 5 0 0 1 10 0M12 4v6M9.5 7.5L12 10l2.5-2.5"/></svg>',
'<svg viewBox="0 0 24 24"><path d="M3 18h18M8.5 18a3.5 3.5 0 0 1 7 0M17.5 4.5v4M15.5 6.5h4M7 8h.01"/></svg>',
'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/></svg>'];
const rnd2=Math.random,dsc=v=>.45+(.6-v)*3.2,ease=u=>u*u*(3-2*u);
const gulls=[],items=[],pool=[],fl={st:'wait',w:1.5},sx={};let nextD=5,nextW=13,gMat,wingGeo;
const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));const x=new T.CanvasTexture(c);x.anisotropy=4;return x};
const bm=(map,o)=>new T.MeshBasicMaterial(Object.assign({map,transparent:true,depthTest:false,depthWrite:false},o));
function todTick(dt){const p=TOD[todIdx],k=1-Math.exp(-dt*1.6);
 ['sun','sunC','skyH','skyM','skyT','seaN','seaM','seaF','tint','ct'].forEach(n=>cur[n].lerp(p[n],k));
 U.uGlow.value+=(p.glow-U.uGlow.value)*k;U.uNight.value+=(p.night-U.uNight.value)*k;U.uMoon.value+=((p.moon||0)-U.uMoon.value)*k;
 if(window.hemi){hemi.color.lerp(p.hs,k);hemi.groundColor.lerp(p.hg,k);hemi.intensity+=(p.hi*(1+.12*wxc.wx)-hemi.intensity)*k;sunL.color.lerp(p.lc,k);sunL.intensity+=(p.li*(1-.55*wxc.wx)-sunL.intensity)*k;atm.material.color.lerp(p.at,k);
  sunL.position.set((cur.sun.x-.5)*34,10+(cur.sun.y-.6)*10,10)}}
function todSet(i,quiet){todIdx=i;document.querySelectorAll('#tod button').forEach((b,j)=>b.classList.toggle('on',j===i));if(!quiet)toast(TOD[i].name)}
/* 노란 달이 떠 있으면 2분마다. 8시에서 나타나 3시로 달을 가로지르고 달 밖에서 사라진다 */
const ET_EVERY=120000,ET_DUR=12,ET_H=.09;
let etP,etOn=false,etT=0,etNext=0;
function etInit(){
 const tex=new T.TextureLoader().load('et.png');tex.anisotropy=8;
 const m=new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,opacity:0});
 etP=new T.Mesh(new T.PlaneGeometry(1,1),m);etP.scale.set(ET_H*(191/172),ET_H,1);
 etP.renderOrder=2;etP.frustumCulled=false;etP.visible=false;bgS.add(etP)}
function etMoon(){const asp=bgC.right||1;return {x:(cur.sun.x*2-1)*asp,y:cur.sun.y*2-1+.02,r:.1}}
function etTick(dt){if(!etP||!etP.material.map||!etP.material.map.image)return
 const moon=U.uMoon.value,wx=U.uWx.value,up=moon>.6&&wx<.9&&started;
 if(!up){etOn=false;etP.visible=false;etNext=0;return}
 const now=Date.now();if(!etNext)etNext=now+1500;
 if(!etOn){if(now<etNext){etP.visible=false;return}etOn=true;etT=0;etNext=now+ET_EVERY}
 etT+=dt;if(etT>=ET_DUR){etOn=false;etP.visible=false;return}
 const u=etT/ET_DUR,e=u*u*(3-2*u),c=etMoon(),reach=c.r+.05,a8=240*Math.PI/180,a3=90*Math.PI/180;
 const x=c.x+reach*(Math.sin(a8)*(1-e)+Math.sin(a3)*e),y=c.y+reach*(Math.cos(a8)*(1-e)+Math.cos(a3)*e);
 etP.position.set(x,y,0);
 const dist=Math.hypot(x-c.x,y-c.y),inR=c.r*.55,outR=c.r+.045;
 let k=dist<=inR?1:dist>=outR?0:(outR-dist)/(outR-inR);k=k*k*(3-2*k);
 etP.material.opacity=Math.min(1,moon)*(1-Math.min(1,wx))*k;etP.visible=k>.02}
function drawDolphin(g){const gr=g.createLinearGradient(0,14,0,106);gr.addColorStop(0,'#35607f');gr.addColorStop(.5,'#7aa2bf');gr.addColorStop(1,'#e6f0f5');g.fillStyle=gr;g.beginPath();g.moveTo(244,70);g.quadraticCurveTo(232,62,214,58);g.bezierCurveTo(200,40,170,30,140,34);g.lineTo(128,14);g.quadraticCurveTo(116,26,110,36);g.bezierCurveTo(80,42,50,58,26,70);g.lineTo(8,52);g.quadraticCurveTo(14,66,12,72);g.quadraticCurveTo(14,80,8,94);g.lineTo(28,76);g.bezierCurveTo(60,86,100,96,140,92);g.bezierCurveTo(176,90,204,84,222,76);g.quadraticCurveTo(236,76,244,70);g.closePath();g.fill();
 g.fillStyle='#4a7596';g.beginPath();g.moveTo(166,84);g.quadraticCurveTo(160,104,146,112);g.quadraticCurveTo(176,106,186,84);g.closePath();g.fill();
 g.fillStyle='#16283a';g.beginPath();g.arc(207,64,2.6,0,6.2832);g.fill()}
function drawWhale(g){const gr=g.createLinearGradient(0,30,0,160);gr.addColorStop(0,'#2d4b66');gr.addColorStop(.55,'#5f87a3');gr.addColorStop(1,'#dce9ef');g.fillStyle=gr;g.beginPath();g.moveTo(502,118);g.bezierCurveTo(492,70,430,42,340,38);g.bezierCurveTo(250,36,170,56,92,84);g.lineTo(40,58);g.quadraticCurveTo(54,84,48,96);g.quadraticCurveTo(54,112,40,134);g.lineTo(94,108);g.bezierCurveTo(170,140,260,162,350,152);g.bezierCurveTo(430,146,492,140,502,118);g.closePath();g.fill();
 g.fillStyle='#2d4b66';g.beginPath();g.moveTo(236,44);g.quadraticCurveTo(232,28,226,22);g.quadraticCurveTo(250,30,266,42);g.closePath();g.fill();
 g.fillStyle='#16283a';g.beginPath();g.arc(452,96,3,0,6.2832);g.fill()}
function buildSea(){
 rd.localClippingEnabled=true;
 sx.dot=tex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.5,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
 sx.ring=tex(128,128,g=>{g.strokeStyle='#fff';g.lineWidth=5;g.beginPath();g.arc(64,64,54,0,6.2832);g.stroke()});
 sx.dol=tex(256,128,drawDolphin);sx.wha=tex(512,192,drawWhale);
 for(let i=0;i<200;i++){const s=new T.Sprite(new T.SpriteMaterial({map:sx.dot,transparent:true,depthTest:false,depthWrite:false}));s.visible=false;s.renderOrder=4;bgS.add(s);pool.push({s,on:false})}
 const ws=new T.Shape();ws.moveTo(0,.006);ws.quadraticCurveTo(.05,.05,.16,.004);ws.quadraticCurveTo(.08,.012,0,-.012);ws.closePath();wingGeo=new T.ShapeGeometry(ws);
 gMat=bm(null,{color:0xffffff});
 sx.crab=[0,1].map(i=>tex(128,96,g=>drawCrab(g,i)));
 for(let i=0;i<4;i++){const m=new T.Mesh(new T.PlaneGeometry(1,.75),bm(sx.crab[0]));m.renderOrder=3;m.visible=false;bgS.add(m);crabs.push({m,on:false})}
 for(let i=0;i<5;i++){const o=new T.Group(),b=new T.Mesh(new T.CircleGeometry(.018,12),gMat),wR=new T.Mesh(wingGeo,gMat),wL=new T.Mesh(wingGeo,gMat);b.scale.set(1.7,.75,1);wL.scale.x=-1;[b,wR,wL].forEach(m=>{m.renderOrder=5;o.add(m)});o.visible=false;bgS.add(o);gulls.push({o,wR,wL,on:false})}
 TOD.forEach((p,i)=>{const b=document.createElement('button');b.innerHTML=IC[i];b.title=p.name;b.setAttribute('aria-label',p.name);b.onclick=()=>todSet(i);$('#tod').appendChild(b)});
 const tb=()=>{const h=new Date().getHours();return h<6||h>=22?5:h<10?0:h<13?1:h<17?2:h<19?3:4};
 let lastB=tb();todSet(lastB,true);todTick(99);
 setInterval(()=>{const b=tb();if(b!==lastB){lastB=b;todSet(b)}},30000);
 addEventListener('keydown',e=>{if(!modalOpen&&/^[1-6]$/.test(e.key))todSet(+e.key-1)});
 buildClouds();buildFun();buildWx();etInit();
}
function emit(x,y,vx,vy,size,life,g,op){const p=pool.find(q=>!q.on);if(!p)return;const c=cur.ct;p.on=true;Object.assign(p,{x,y,vx,vy,sz:size,life,age:0,g,op});p.s.visible=true;p.s.material.color.setRGB(.55+.45*c.x,.55+.45*c.y,.55+.45*c.z);p.s.position.set(x,y,0)}
function ripple(x,y,s){const mat=bm(sx.ring,{}),m=new T.Mesh(new T.PlaneGeometry(1,1),mat);m.renderOrder=1;m.position.set(x,y,0);bgS.add(m);items.push({t:'rip',m,mat,age:0,life:1.2,s})}
function splash(x,y,s){for(let i=0;i<14;i++)emit(x+(rnd2()-.5)*.04*s,y,(rnd2()-.5)*.5*s,(.3+rnd2()*.5)*s,(.012+rnd2()*.014)*s,.8+rnd2()*.4,-1.5*s,.9);ripple(x,y,s)}
const randX=()=>{const a=cam.aspect;return a>1.1?(rnd2()<.5?-1:1)*a*(.32+.58*rnd2()):(rnd2()-.5)*a*1.8};
function spawnDol(){const uvy=.43+rnd2()*.13,s=dsc(uvy),x=randX(),dir=rnd2()<.5?-1:1,n=rnd2()<.45?2:1;
 for(let i=0;i<n;i++){const ss=s*(1-i*.12);items.push({t:'dol',dl:i*.5,age:0,dur:1.5+rnd2()*.3,x0:x+dir*i*.2*s,dir,s:ss,y0:(uvy+i*.008)*2-1,h:(.13+rnd2()*.05)*ss,span:(.5+rnd2()*.12)*ss,m:null})}}
function spawnWha(){const uvy=.5+rnd2()*.07,s=dsc(uvy),W=.8*s;items.push({t:'wha',x:randX(),dir:rnd2()<.5?-1:1,s,y0:uvy*2-1,W,Hh:W*.375,age:0,acc:0,rt:0,m:null})}
function mkSprite(it,tx,W,hh,rel){it.mat=bm(tx,{clippingPlanes:[new T.Plane(new T.Vector3(0,1,0),-it.y0)]});it.m=new T.Mesh(new T.PlaneGeometry(1,hh),it.mat);it.m.scale.set(it.dir*W,W,1);it.m.renderOrder=rel;bgS.add(it.m)}
function kill(it){it.dead=true;if(it.m){bgS.remove(it.m);it.m.geometry.dispose();it.mat.dispose()}}
function gullUpdate(dt){const asp=cam.aspect;
 if(fl.st==='wait'){if(wxc.storm>.5)return;fl.w-=dt;if(fl.w<=0){const n=2+Math.floor(rnd2()*4),d0=rnd2()<.5?-1:1,cy=.33+rnd2()*.38;
  gulls.forEach((g,i)=>{g.on=i<n;if(!g.on)return;g.dir=rnd2()<.2?-d0:d0;g.dl=i*(.4+rnd2()*1.1);g.sp=.2+rnd2()*.12;g.by=cy+(rnd2()-.5)*.14;g.ph=rnd2()*6.3;g.fr=7+rnd2()*3;g.x=-g.dir*(asp+.3);const sc=.5+rnd2()*.4;g.o.scale.set(sc*g.dir,sc,1)});fl.st='fly'}}
 else{let any=false;gulls.forEach(g=>{if(!g.on)return;any=true;if(g.dl>0){g.dl-=dt;return}
  g.o.visible=true;g.x+=g.dir*g.sp*dt;g.ph+=dt*g.fr;const a=Math.sin(g.ph)*.6+.12;g.wR.rotation.z=a;g.wL.rotation.z=-a;
  g.o.position.set(g.x,g.by+Math.sin(tw*.7+g.by*9)*.025,0);g.o.rotation.z=Math.cos(g.ph)*.04;
  if(g.dir*g.x>asp+.35){g.on=false;g.o.visible=false}});
  if(!any){fl.st='wait';fl.w=2+rnd2()*7}}}
const crabs=[];let nextC=8;
function drawCrab(g,p){const o=p?5:-5;
 g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(64,64,32,11,0,0,6.2832);g.fill();
 g.strokeStyle='#d4452a';g.lineWidth=4;g.lineCap='round';g.lineJoin='round';
 [-1,1].forEach(s=>{for(let k=0;k<3;k++){const j=o*(k%2?1:-1);g.beginPath();g.moveTo(64+s*24,48+k*7);g.lineTo(64+s*40,42+k*9+j);g.lineTo(64+s*52,56+k*9-j);g.stroke()}});
 const gr=g.createLinearGradient(0,32,0,68);gr.addColorStop(0,'#ff8f62');gr.addColorStop(1,'#d94a2b');g.fillStyle=gr;g.beginPath();g.ellipse(64,50,27,18,0,0,6.2832);g.fill();
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(58,43,10,5,-.3,0,6.2832);g.fill();
 g.strokeStyle='#d94a2b';g.lineWidth=3;g.beginPath();g.moveTo(57,38);g.lineTo(56,30);g.moveTo(71,38);g.lineTo(72,30);g.stroke();
 [56,72].forEach(x=>{g.fillStyle='#fff';g.beginPath();g.arc(x,28,3.8,0,6.2832);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(x,28,1.9,0,6.2832);g.fill()});
 [-1,1].forEach(s=>{g.strokeStyle='#e8573a';g.lineWidth=6;g.beginPath();g.moveTo(64+s*22,40);g.lineTo(64+s*34,26);g.stroke();
  g.fillStyle='#ff6a45';g.beginPath();g.ellipse(64+s*38,20,10,8,0,0,6.2832);g.fill();
  g.strokeStyle='#a83317';g.lineWidth=2;g.beginPath();g.moveTo(64+s*38,11);g.lineTo(64+s*38,19);g.stroke()})}
function crabUpdate(dt){const a=cam.aspect,c3=cur.ct;nextC-=dt;
 if(nextC<=0&&!crabs.some(c=>c.on)){nextC=24+rnd2()*22;const n=2+Math.floor(rnd2()*3),d0=rnd2()<.5?-1:1;
  crabs.forEach((c,i)=>{c.on=i<n;if(!c.on)return;c.dir=rnd2()<.25?-d0:d0;c.y=-.93+rnd2()*.15;c.W=.1+(-.8-c.y)*.35;c.x=-c.dir*(a+c.W+i*.15);c.st='run';c.t=.6+rnd2();c.sp=.28+rnd2()*.18;c.fr=0;c.m.scale.set(c.W,c.W,1);c.m.visible=true})}
 crabs.forEach(c=>{if(!c.on)return;c.m.material.color.setRGB(c3.x,c3.y,c3.z);c.t-=dt;
  if(c.st==='run'){c.x+=c.dir*c.sp*dt;c.fr+=dt;c.m.material.map=sx.crab[Math.floor(c.fr/.09)%2];c.m.rotation.z=Math.sin(tw*40)*.05;if(c.t<=0){c.st='stop';c.t=.4+rnd2()*1.2;c.m.rotation.z=0;if(rnd2()<.12)c.dir*=-1}}
  else if(c.t<=0){c.st='run';c.t=.5+rnd2()*.9;c.sp=.28+rnd2()*.18}
  c.m.position.set(c.x,c.y,0);
  if(Math.abs(c.x)>a+c.W+.3&&c.dir*c.x>0){c.on=false;c.m.visible=false}})}
const clouds2=[];let nextCl=6;
function buildClouds(){
 sx.cloud=[0,1,2].map(()=>tex(256,128,g=>{const n=10+Math.floor(rnd2()*3);
  for(let i=0;i<n;i++){const u=i/(n-1),b=Math.sin(u*Math.PI),x=40+u*176+(rnd2()-.5)*12,r=16+b*20+rnd2()*8,y=84-b*14-rnd2()*6,gr=g.createRadialGradient(x,y-r*.25,r*.1,x,y,r);
   gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.55,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
  g.globalCompositeOperation='source-atop';const sh=g.createLinearGradient(0,44,0,112);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(150,170,205,.5)');g.fillStyle=sh;g.fillRect(0,0,256,128)}));
 const pl=new T.Plane(new T.Vector3(0,1,0),-.2);
 for(let i=0;i<16;i++){const mat=bm(sx.cloud[0],{clippingPlanes:[pl],opacity:0}),m=new T.Mesh(new T.PlaneGeometry(1,1),mat);m.renderOrder=1;m.visible=false;bgS.add(m);clouds2.push({m,mat,on:false})}
 for(let i=0;i<8;i++)spawnCloud(1.3+rnd2()*8.5)}
function spawnCloud(d){const c=clouds2.find(q=>!q.on);if(!c)return;Object.assign(c,{on:true,d,k:(.1+rnd2()*.05)*.9,X:rnd2()*2-1,Hc:.1+rnd2()*.6,S:.42+rnd2()*.5,dir:rnd2()<.5?-1:1});c.mat.map=sx.cloud[Math.floor(rnd2()*3)];c.m.visible=true}
function cloudUpdate(dt){const a=cam.aspect,c=cur.ct,wx=wxc.wx,dk=1-.3*wx;
 nextCl-=dt;if(nextCl<=0){nextCl=(2.4+rnd2()*2.4)/(1+1.5*wx);spawnCloud(12)}
 for(const o of clouds2){if(!o.on)continue;o.d*=Math.exp(-o.k*dt);const d=o.d;
  if(d<.6){o.on=false;o.m.visible=false;continue}
  const w=o.S*(.12+.88/d),fi=Math.min(1,Math.max(0,(12.5-d)/4)),fo=Math.min(1,Math.max(0,(d-.6)/.9));
  o.m.scale.set(w*o.dir,w*.5,1);o.m.position.set(o.X*(a*1.15+.15)*(.3+.7/d),.2+o.Hc/d+w*.19,-d*.3);
  o.mat.opacity=(.92-.3*U.uNight.value)*Math.min(fi,fo);o.mat.color.setRGB(c.x*dk,c.y*dk,c.z*dk)}}
const fun={u:{on:false},sh:{on:false}};let nextU=20,nextS=45;
function buildFun(){
 sx.ufo=tex(256,128,g=>{g.save();g.translate(128,70);g.scale(1,.42);let r=g.createRadialGradient(0,0,10,0,0,122);r.addColorStop(0,'rgba(180,255,240,.3)');r.addColorStop(1,'rgba(180,255,240,0)');g.fillStyle=r;g.beginPath();g.arc(0,0,122,0,6.2832);g.fill();g.restore();
  g.shadowColor='rgba(170,230,255,.9)';g.shadowBlur=9;
  r=g.createRadialGradient(118,42,3,128,54,34);r.addColorStop(0,'rgba(255,255,255,.8)');r.addColorStop(1,'rgba(150,220,255,.4)');g.fillStyle=r;g.beginPath();g.ellipse(128,58,30,28,0,Math.PI,0);g.fill();
  r=g.createLinearGradient(0,52,0,94);r.addColorStop(0,'rgba(240,246,255,.82)');r.addColorStop(.5,'rgba(165,182,220,.78)');r.addColorStop(1,'rgba(105,120,170,.72)');g.fillStyle=r;g.beginPath();g.ellipse(128,72,96,22,0,0,6.2832);g.fill();
  g.shadowBlur=0;g.fillStyle='rgba(255,255,255,.38)';g.beginPath();g.ellipse(112,65,56,5,-.04,0,6.2832);g.fill();
  const cs=['#ff6fa8','#ffe066','#7df0c8','#6fb6ff','#ff9a56'];
  for(let i=0;i<7;i++){const k=cs[i%5];g.fillStyle=k;g.shadowColor=k;g.shadowBlur=9;g.beginPath();g.arc(50+i*26,73+Math.sin(i/6*Math.PI)*5,4.5,0,6.2832);g.fill()}
  g.shadowBlur=0});
 sx.beam=tex(128,256,g=>{const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(220,255,240,.75)');gr.addColorStop(1,'rgba(160,255,220,.18)');g.fillStyle=gr;g.shadowColor='rgba(200,255,230,.9)';g.shadowBlur=14;g.beginPath();g.moveTo(52,0);g.lineTo(76,0);g.lineTo(118,248);g.lineTo(10,248);g.closePath();g.fill()});
 sx.dino=tex(96,96,g=>{const G='#6ccf7a';g.fillStyle=G;g.strokeStyle=G;g.lineWidth=7;g.lineCap='round';
  g.beginPath();g.ellipse(46,60,22,22,0,0,6.2832);g.fill();g.beginPath();g.moveTo(62,66);g.quadraticCurveTo(88,72,84,48);g.quadraticCurveTo(76,62,62,56);g.fill();
  g.beginPath();g.moveTo(28,54);g.lineTo(14,36);g.moveTo(64,54);g.lineTo(76,36);g.stroke();
  g.fillStyle='#4fb862';g.beginPath();g.ellipse(35,82,9,5,0,0,6.2832);g.ellipse(57,82,9,5,0,0,6.2832);g.fill();
  g.fillStyle='#e8f7c8';g.beginPath();g.ellipse(45,66,12,14,0,0,6.2832);g.fill();
  g.fillStyle=G;g.beginPath();g.ellipse(43,32,23,19,0,0,6.2832);g.fill();
  g.fillStyle='#ff9a56';[24,36,48].forEach(x=>{g.beginPath();g.moveTo(x-5,16);g.lineTo(x,5);g.lineTo(x+5,16);g.fill()});
  [33,53].forEach(x=>{g.fillStyle='#fff';g.beginPath();g.arc(x,30,6,0,6.2832);g.fill();g.fillStyle='#222';g.beginPath();g.arc(x+1,31,3,0,6.2832);g.fill()});
  g.fillStyle='rgba(255,130,150,.6)';g.beginPath();g.ellipse(25,40,5,3,0,0,6.2832);g.ellipse(61,40,5,3,0,0,6.2832);g.fill();
  g.strokeStyle='#2a5a34';g.lineWidth=2;g.beginPath();g.arc(43,38,6,.2,2.9);g.stroke()});
 const mk2=(tx,o,ro)=>{const m=new T.Mesh(new T.PlaneGeometry(1,1),bm(tx,o||{}));m.renderOrder=ro;bgS.add(m);return m};
 fun.beam=mk2(sx.beam,{blending:T.AdditiveBlending},5);fun.ufo=mk2(sx.ufo,{},6);fun.dino=mk2(sx.dino,{},7);[fun.beam,fun.ufo,fun.dino].forEach(m=>m.visible=false);
}
function funUpdate(dt){const a=cam.aspect,c=cur.ct,tn=(m,k=.55)=>m.material.color.setRGB(k+(1-k)*c.x,k+(1-k)*c.y,k+(1-k)*c.z);
 const u=fun.u;
 if(!u.on){nextU-=dt;if(nextU<=0&&wxc.storm<.5){nextU=50+rnd2()*60;Object.assign(u,{on:true,t:0,sp:false,side:rnd2()<.5?-1:1,y1:.5+rnd2()*.1});u.x1=u.side*Math.min(a*.8,Math.max(a*.55,.62))}}
 else{u.t+=dt;const t=u.t,W=.3,sd=u.side;let x=u.x1,y=u.y1,sc=1,ba=0,dp=-1;
  if(t<1.6){const e=1-Math.pow(1-t/1.6,3);x=sd*(a+.3)+(u.x1-sd*(a+.3))*e;y=u.y1+.25*(1-e)}
  else if(t<7.2){y+=Math.sin(tw*5)*.006;ba=Math.min(1,(t-1.6)/1)*(t>6.4?Math.max(0,(7.2-t)/.8):1);
   if(t>2.6&&t<6.6){dp=(t-2.6)/4;if(!u.sp){u.sp=true;splash(x,.06,.8)}}}
  else{const k=Math.min(1,(t-7.2)/1.2),e=k*k;x=u.x1-sd*e*(a+.8);y=u.y1+e*.5;sc=1-.7*e;if(k>=1){u.on=false;fun.ufo.visible=fun.beam.visible=fun.dino.visible=false}}
  if(u.on){const m=fun.ufo;m.visible=true;m.scale.set(W*sc,W*sc*.5,1);m.position.set(x,y,0);m.rotation.z=Math.sin(tw*3)*.03;m.material.opacity=.85;tn(m,.75);
   const yb=y-.045,hb=Math.max(.01,yb-.06),b=fun.beam;b.visible=ba>0;b.scale.set(W*1.15,hb,1);b.position.set(x,(yb+.06)/2,0);b.material.opacity=ba*(.75+.25*Math.sin(tw*22));
   const d=fun.dino;d.visible=dp>=0&&dp<1;if(d.visible){const e=dp*dp*(3-2*dp);d.scale.set(.1*(1-.35*e),.1*(1-.35*e),1);d.position.set(x+Math.sin(dp*14)*.012,.07+(yb-.03-.07)*e,0);d.rotation.z=Math.sin(dp*18)*.25;tn(d,.8)}}}
}
function seaUpdate(dt){const c=cur.ct;
 gMat.color.setRGB(.98*c.x,.98*c.y,.98*c.z);
 nextD-=dt;if(nextD<=0){nextD=8+rnd2()*8;spawnDol()}
 nextW-=dt;if(nextW<=0){nextW=28+rnd2()*18;spawnWha()}
 gullUpdate(dt);crabUpdate(dt);cloudUpdate(dt);funUpdate(dt);
 for(const it of items){
  if(it.t==='rip'){it.age+=dt;const r=it.age/it.life,sc=(.05+.4*r)*it.s;it.m.scale.set(sc*2,sc*.5,1);it.mat.color.setRGB(.6+.4*c.x,.6+.4*c.y,.6+.4*c.z);it.mat.opacity=.55*(1-r);if(r>=1)kill(it)}
  else if(it.t==='dol'){
   if(it.dl>0){it.dl-=dt;continue}
   if(!it.m){mkSprite(it,sx.dol,.34*it.s,.5,3);splash(it.x0,it.y0,it.s)}
   it.mat.color.setRGB(c.x,c.y,c.z);it.age+=dt;const u=Math.min(1,it.age/it.dur);
   it.m.position.set(it.x0+it.dir*it.span*u,it.y0+4*it.h*u*(1-u),0);it.m.rotation.z=it.dir*Math.atan2(4*it.h*(1-2*u),it.span);
   if(u>=1){splash(it.x0+it.dir*it.span,it.y0,it.s);kill(it)}}
  else if(it.t==='wha'){
   if(!it.m){mkSprite(it,sx.wha,it.W,.375,2);ripple(it.x,it.y0,it.s*1.2)}
   it.mat.color.setRGB(c.x,c.y,c.z);it.age+=dt;const a=it.age,Hh=it.Hh;
   const v=a<2.2?ease(a/2.2):a<7.2?1:1-ease((a-7.2)/2.2);
   const vis=(-.05+.37*v)*Hh+Math.sin(a*1.3)*.004*it.s*v;
   it.m.position.set(it.x,it.y0+vis-.31*Hh,0);
   const bx=it.x+it.dir*.28*it.W,by=it.y0+vis+.004;
   if((a>2.7&&a<3.6)||(a>5.3&&a<6.1)){it.acc+=dt*80;while(it.acc>=1){it.acc--;emit(bx+(rnd2()-.5)*.01,by,(rnd2()-.5)*.1*it.s+it.dir*.03,(.8+rnd2()*.3)*it.s,(.012+rnd2()*.012)*it.s*1.2,1.5,-1.5*it.s,.8)}}
   it.rt-=dt;if(it.rt<=0&&a>1.5&&a<8.5){it.rt=.7;ripple(it.x+it.dir*(rnd2()-.2)*.2*it.W,it.y0,it.s*1.2)}
   if(a>9.6)kill(it)}}
 for(let i=items.length-1;i>=0;i--)if(items[i].dead)items.splice(i,1);
 for(const p of pool){if(!p.on)continue;p.age+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const r=p.age/p.life;
  if(r>=1){p.on=false;p.s.visible=false;continue}
  p.s.position.set(p.x,p.y,0);p.s.scale.setScalar(p.sz*(1+r*.6));p.s.material.opacity=p.op*(1-r*r)}}

/* ===== AI 친구들 (여자아이 · 강아지) ===== */
const npcs={},vA=new T.Vector3(),vB=new T.Vector3(),vC=new T.Vector3(),vP=new T.Vector3(),catAim=new T.Vector3(),qI=new T.Quaternion();
const rv=()=>new T.Vector3(rnd2()-.5,rnd2()-.5,rnd2()-.5).normalize();
function randNear(c,a0,a1){const t=rv();t.addScaledVector(c,-t.dot(c)).normalize();const a=a0+rnd2()*(a1-a0);return c.clone().multiplyScalar(Math.cos(a)).addScaledVector(t,Math.sin(a))}
function toward(sn,pn,a){const t=pn.clone().addScaledVector(sn,-pn.dot(sn));if(t.lengthSq()<1e-6)return randNear(sn,a,a);t.normalize();return sn.clone().multiplyScalar(Math.cos(a)).addScaledVector(t,Math.sin(a))}
function buildGirl(){
 const g=new T.Group(),sk=M(0xffd9b8,{roughness:.6}),dr=M(0xff8fb1),ha=M(0x3a2418),wh=M(0xffffff),rb=M(0xe8465a),dk=new T.MeshBasicMaterial({color:0x2a1a14}),pk=new T.MeshBasicMaterial({color:0xff9fa8}),body=new T.Group();g.add(body);
 mk(new T.CylinderGeometry(.2,.42,.5,20),dr,0,.6,0,body);mk(new T.CylinderGeometry(.2,.24,.32,16),dr,0,.97,0,body);
 mk(new T.TorusGeometry(.22,.035,8,20),wh,0,1.12,0,body).rotation.x=Math.PI/2;
 const hd=new T.Group();hd.position.y=1.5;body.add(hd);
 mk(new T.SphereGeometry(.58,32,24),sk,0,0,0,hd);
 mk(new T.SphereGeometry(.62,32,18,0,6.2832,0,Math.PI*.55),ha,0,.03,-.04,hd).rotation.x=-.35;
 mk(new T.SphereGeometry(.62,20,16),ha,0,-.12,-.2,hd).scale.set(.95,1.05,.7);
 mk(new T.SphereGeometry(.3,16,12),ha,0,.42,.34,hd).scale.set(1.5,.55,.6);
 [-1,1].forEach(s=>{
  mk(new T.SphereGeometry(.2,14,12),ha,s*.6,-.22,-.05,hd).scale.set(.8,1.5,.8);mk(new T.SphereGeometry(.07,10,8),rb,s*.52,.1,-.02,hd);
  mk(new T.SphereGeometry(.075,12,10),dk,s*.2,-.04,.54,hd).scale.y=1.45;mk(new T.SphereGeometry(.027,8,6),wh,s*.2+.02,.04,.6,hd);
  mk(new T.SphereGeometry(.09,10,8),pk,s*.34,-.17,.44,hd).scale.z=.35;
  mk(new T.SphereGeometry(.13,12,10),rb,s*.15,.6,.12,hd).scale.set(1.2,.8,.6)});
 mk(new T.SphereGeometry(.07,10,8),rb,0,.6,.14,hd);mk(new T.TorusGeometry(.075,.016,6,14,Math.PI),dk,0,-.1,.56,hd).rotation.z=Math.PI;
 const arms=[],legs=[];
 [-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.34,1.02,0);mk(new T.CylinderGeometry(.075,.085,.2,10),dr,0,-.08,0,a);mk(new T.CylinderGeometry(.06,.06,.2,10),sk,0,-.24,0,a);mk(new T.SphereGeometry(.08,10,8),sk,0,-.36,0,a);body.add(a);arms.push(a);
  const l=new T.Group();l.position.set(s*.14,.36,0);mk(new T.CylinderGeometry(.075,.075,.2,10),sk,0,-.08,0,l);mk(new T.CylinderGeometry(.085,.085,.1,10),wh,0,-.2,0,l);mk(new T.SphereGeometry(.12,12,10),rb,0,-.29,.05,l).scale.set(1,.65,1.3);g.add(l);legs.push(l)});
 g.scale.setScalar(1.1);world.add(g);return{o:g,legs,arms,body,head:hd}}
function buildDog(){
 const g=new T.Group(),R2={roughness:.95},fur=M(0xd9a05b,R2),dkf=M(0xb67a3c,R2),cream=M(0xf6dcae,R2),ear=M(0x8f5a2c,R2),dk=new T.MeshBasicMaterial({color:0x120d0b}),nose=M(0x1a1412,{roughness:.3}),wh=new T.MeshBasicMaterial({color:0xffffff}),br=new T.MeshBasicMaterial({color:0x4a2a14}),body=new T.Group();g.add(body);
 mk(new T.SphereGeometry(.3,22,16),fur,0,.46,-.02,body).scale.set(1,.92,1.75);mk(new T.SphereGeometry(.26,18,14),dkf,0,.54,-.06,body).scale.set(.95,.65,1.6);mk(new T.SphereGeometry(.24,16,12),cream,0,.4,.3,body).scale.set(.95,1,.9);
 mk(new T.CylinderGeometry(.14,.2,.3,12),fur,0,.62,.4,body).rotation.x=.5;
 const head=new T.Group();head.position.set(0,.76,.52);body.add(head);
 mk(new T.SphereGeometry(.22,24,18),fur,0,0,0,head);mk(new T.SphereGeometry(.12,16,12),cream,0,-.06,.2,head).scale.set(.95,.8,1.5);mk(new T.SphereGeometry(.05,12,10),nose,0,-.01,.36,head).scale.set(1.2,.9,.9);
 const jaw=new T.Group();jaw.position.set(0,-.12,.12);head.add(jaw);mk(new T.SphereGeometry(.085,12,10),cream,0,-.02,.1,jaw).scale.set(1,.5,1.4);
 const tongue=mk(new T.SphereGeometry(.05,10,8),M(0xff7d92),0,-.04,.12,jaw);tongue.scale.set(.9,.3,.02);tongue.castShadow=false;
 [-1,1].forEach(s=>{mk(new T.SphereGeometry(.045,10,8),br,s*.1,.07,.18,head);mk(new T.SphereGeometry(.015,6,6),wh,s*.1+.012,.09,.215,head);mk(new T.SphereGeometry(.03,8,6),cream,s*.1,.14,.17,head).scale.set(1.4,.5,.6);
  const e=mk(new T.SphereGeometry(.15,12,10),ear,s*.2,.04,-.02,head);e.scale.set(.35,.8,.55);e.rotation.z=-s*.5;e.position.y=-.02});
 const legs=[];
 [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx2,sz])=>{const l=new T.Group();l.position.set(sx2*.17,.38,sz*.34);mk(new T.CylinderGeometry(.075,.065,.3,10),fur,0,-.15,0,l);mk(new T.SphereGeometry(.085,10,8),cream,0,-.33,.03,l).scale.set(1,.7,1.3);body.add(l);legs.push(l)});
 const tail=new T.Group();tail.position.set(0,.58,-.56);const tc=mk(new T.ConeGeometry(.075,.5,8),dkf,0,.2,0,tail);mk(new T.SphereGeometry(.07,8,6),cream,0,.44,0,tail).scale.set(1,1.5,1);tail.rotation.x=-.9;body.add(tail);
 g.scale.setScalar(1);world.add(g);return{o:g,legs,tail,head,body,jaw,tongue}}
function buildCat(){
 const g=new T.Group(),R2={roughness:.9};
 const fur=M(0xf07830,R2),dk=M(0xc24e22,R2),cream=M(0xffe3c2,R2),earIn=M(0xff9eb8,{roughness:.6});
 const eye=new T.MeshBasicMaterial({color:0x37b36a}),pup=new T.MeshBasicMaterial({color:0x1a120c}),hi=new T.MeshBasicMaterial({color:0xffffff});
 const nose=M(0xff7d9a,{roughness:.35}),body=new T.Group();g.add(body);
 const torso=mk(new T.SphereGeometry(.24,22,16),fur,0,.28,.02,body);torso.scale.set(.9,.68,1.28);
 mk(new T.SphereGeometry(.15,14,12),cream,0,.22,.14,body).scale.set(.8,.5,.85);
 mk(new T.SphereGeometry(.16,14,12),fur,0,.32,-.2,body).scale.set(.95,.78,.8);
 mk(new T.SphereGeometry(.05,8,6),dk,0,.4,.04,body).scale.set(.45,.18,.75);mk(new T.SphereGeometry(.04,8,6),dk,0,.38,-.1,body).scale.set(.4,.16,.55);
 const head=new T.Group();head.position.set(0,.44,.28);body.add(head);
 const hd=mk(new T.SphereGeometry(.175,24,18),fur,0,.02,0,head);hd.scale.set(1.12,.98,.9);
 mk(new T.SphereGeometry(.07,12,10),cream,0,-.045,.12,head).scale.set(1.05,.62,.55);
 mk(new T.SphereGeometry(.028,8,6),nose,0,-.02,.165,head).scale.set(1.15,.7,.65);
 mk(new T.BoxGeometry(.016,.04,.012),dk,-.02,.09,.15,head).rotation.z=.5;
 mk(new T.BoxGeometry(.016,.04,.012),dk,.02,.09,.15,head).rotation.z=-.5;
 [-1,1].forEach(s=>{
  const e=mk(new T.ConeGeometry(.09,.3,4),fur,s*.11,.16,-.04,head);e.rotation.z=s*.5;e.rotation.x=-.35;
  const ei=mk(new T.ConeGeometry(.048,.16,4),earIn,s*.11,.16,-.005,head);ei.rotation.z=s*.5;ei.rotation.x=-.35;
  mk(new T.SphereGeometry(.048,12,10),eye,s*.072,.015,.15,head).scale.set(.95,1.15,.6);
  mk(new T.SphereGeometry(.015,6,6),pup,s*.072,.015,.18,head).scale.set(.42,1.5,.35);
  mk(new T.SphereGeometry(.01,6,6),hi,s*.055,.04,.175,head);
  for(let i=-1;i<=1;i++){const w=mk(new T.BoxGeometry(.13,.007,.007),hi,s*.16,-.03+i*.018,.11,head);w.rotation.y=-s*i*.35}
 });
 const legs=[];[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx2,sz])=>{const l=new T.Group();l.position.set(sx2*.09,.2,sz*.15);mk(new T.CylinderGeometry(.032,.028,.13,8),fur,0,-.05,0,l);mk(new T.SphereGeometry(.04,8,6),cream,0,-.125,.012,l).scale.set(1.15,.5,1.2);body.add(l);legs.push(l)});
 const tail=new T.Group();tail.position.set(0,.34,-.32);
 mk(new T.CylinderGeometry(.02,.038,.4,8),fur,0,.2,0,tail);
 mk(new T.CylinderGeometry(.03,.03,.045,8),dk,0,.1,0,tail);mk(new T.CylinderGeometry(.024,.024,.04,8),dk,0,.24,0,tail);
 mk(new T.SphereGeometry(.036,8,6),dk,.045,.4,.01,tail);body.add(tail);
 g.scale.setScalar(1.35);world.add(g);return{o:g,legs,tail,head,body}}
function orbSlot(n,c,r,dir){const u=n.clone().addScaledVector(c,-n.dot(c));if(u.lengthSq()<1e-6){const t=rv();u.copy(t).addScaledVector(c,-c.dot(t))}u.normalize();u.applyAxisAngle(c,dir*.7);return c.clone().multiplyScalar(Math.cos(r)).addScaledVector(u,Math.sin(r))}
function sep(c,on,m){if(c.n.angleTo(on)>=m)return;vB.copy(c.n).addScaledVector(on,-c.n.dot(on));if(vB.lengthSq()<1e-8){const t=rv();vB.copy(t).addScaledVector(on,-on.dot(t))}vB.normalize();c.n.copy(on).multiplyScalar(Math.cos(m)).addScaledVector(vB,Math.sin(m));c.f.addScaledVector(c.n,-c.f.dot(c.n)).normalize()}
const bubs=[];let EX=[],bkT=120,mwT=180,chase=0,chaseGap=120+rnd2()*60;
function say(c,txt,h,lf=1.2){const el=document.createElement('div');el.className='bub';el.textContent=txt;document.body.appendChild(el);bubs.push({el,c,h,t:0,life:lf})}
function dogNext(d,g){const r=rnd2();d.barks=0;d.bt=.25;d.meow=false;d.od=rnd2()<.5?-1:1;d.orb=.26+rnd2()*.1;
 if(r<.2){d.st='sit';d.stT=3.5+rnd2()*2.5}else if(r<.34){d.st='pant';d.stT=3+rnd2()*2}else if(r<.48){d.st='sit';d.stT=3+rnd2()*2}else if(r<.6){d.st='roll';d.stT=4.5+rnd2()*1.5}else if(r<.78){d.st='run';d.stT=3.5+rnd2()*1.5;d.tg=randNear(g.n,.55,.95)}else{d.st='orbit';d.stT=4+rnd2()*4}}
function buildNpcs(){
 const mkc=(rig,n,x)=>{const t=rv();const f=t.addScaledVector(n,-t.dot(n)).normalize();return Object.assign({o:rig.o,rig,n:n.clone().normalize(),f,mv:0,walk:0,sp:0,wave:false,t:6,stT:3,st:'orbit',od:1,orb:.36,barks:0,bt:0,barkP:0,sit:0,lay:0,tg:null},x)};
 npcs.girl=mkc(buildGirl(),nrm(.62,-1.2),{orb:.42});npcs.dog=mkc(buildDog(),nrm(.7,-1.0),{orb:.3,turn:.6});npcs.cat=mkc(buildCat(),nrm(.9,-.3),{hop:0,bi:0,ct:3,mode:'bf',actT:6+rnd2()*6,lk:0});
 [npcs.girl,npcs.dog,npcs.cat].forEach(c=>{basisQ(c.n,c.f,c.o.quaternion);c.o.position.copy(c.n).multiplyScalar(R)});
}
function steer(c,tg,sp,dt){
 const n=c.n,f=c.f;vA.copy(tg).addScaledVector(n,-tg.dot(n));if(vA.lengthSq()<1e-6)vA.copy(f);vA.normalize();
 for(const s of spotObjs){const sn=s.userData.n,an=Math.acos(Math.min(1,n.dot(sn))),r0=SPOTS[s.userData.spot].reach*1.15+.12;if(an<r0){vB.copy(n).addScaledVector(sn,-n.dot(sn));if(vB.lengthSq()>1e-6){vB.normalize();vA.addScaledVector(vB,(r0-an)/r0*3)}}}
 for(const pr of propN){const an=Math.acos(Math.min(1,n.dot(pr)));if(an<.13){vB.copy(n).addScaledVector(pr,-n.dot(pr));if(vB.lengthSq()>1e-6){vB.normalize();vA.addScaledVector(vB,(.13-an)/.13*2.5)}}}
 for(const e of EX){const an=Math.acos(Math.min(1,n.dot(e.n)));if(an<e.r){vB.copy(n).addScaledVector(e.n,-n.dot(e.n));if(vB.lengthSq()>1e-6){vB.normalize();vA.addScaledVector(vB,(e.r-an)/e.r*3.5)}}}
 vA.normalize();
 const ang=Math.atan2(n.dot(vC.crossVectors(f,vA)),f.dot(vA)),mx=3.6*dt;
 f.applyAxisAngle(n,Math.max(-mx,Math.min(mx,ang)));
 if(sp>0){vC.crossVectors(n,f).normalize();const st=sp*dt*(Math.abs(ang)>1.6?.3:1);n.applyAxisAngle(vC,st);f.applyAxisAngle(vC,st)}
 n.normalize();f.addScaledVector(n,-f.dot(n)).normalize();
 return Math.acos(Math.min(1,n.dot(tg)))}
function npcUpdate(dt){
 if(!npcs.girl)return;
 const pn=vP.copy(TOP).applyQuaternion(qI.copy(world.quaternion).invert()),g=npcs.girl,d=npcs.dog,cat=npcs.cat;
 const gp=g.n.angleTo(pn),dg=d.n.angleTo(g.n);
 bkT-=dt;if(bkT<=0){if(chase>0)bkT=20;else{bkT=120;d.st='bark';d.stT=2.4;d.barks=0;d.bt=.25;d.meow=false}}
 mwT-=dt;if(mwT<=0){mwT=180;say(cat,'야옹~',1.5);meow()}
 /* 여자아이: 남자아이 주변을 맴돈다 */
 g.sp=0;g.t-=dt;
 if(g.st==='pause'&&gp>.75)g.t=0;
 if(g.t<=0){if(g.st==='orbit'){g.st='pause';g.t=2.2+rnd2()*1.5;if(gp<.9)say(g,'안녕!',2.9)}else{g.st='orbit';g.t=6+rnd2()*5;g.od=rnd2()<.5?-1:1;g.orb=.36+rnd2()*.14}}
 EX=[{n:pn,r:.27},{n:d.n,r:.14}];
 if(g.st==='orbit'){g.wave=false;g.sp=gp>1.2?.62:gp>.8?.5:gp>.55?.36:.22;if(dg>.5)g.sp*=.5;steer(g,orbSlot(g.n,pn,g.orb,g.od),g.sp,dt)}
 else{steer(g,pn,0,dt);g.wave=gp<.8}
 sep(g,pn,.25);
 /* 2~3분마다: 강아지가 10초간 여기저기 뛰면 고양이가 쫓아온다 */
 if(started&&chase>0){chase-=dt;if(chase<=0){chase=0;chaseGap=120+rnd2()*60;d.st='orbit';d.stT=5+rnd2()*3;d.od=rnd2()<.5?-1:1;cat.mode='bf';cat.actT=5+rnd2()*5;cat.ct=.4}}
 else if(started&&chaseGap>0)chaseGap-=dt;
 else if(started){chase=10;d.st='dash';d.turn=.15;d.tg=randNear(d.n,.9,1.45);cat.mode='chase';bark();say(d,'멍!',1.1);meow();say(cat,'야옹!',1.1)}
 /* 강아지: 평소엔 여자아이 주변. 질주 중에는 방향을 자주 꺾는다 */
 d.sp=0;
 if(chase>0){d.st='dash';d.turn-=dt;d.sp=1.35;EX=[{n:pn,r:.16}];if(!d.tg)d.tg=randNear(d.n,.75,1.45);const left=steer(d,d.tg,d.sp,dt);if(d.turn<=0||left<.2){d.turn=.45+rnd2()*.4;d.tg=randNear(d.n,.75,1.45)}sep(d,pn,.14)}
 else{d.stT-=dt;
  if(dg>.75&&d.st!=='orbit'&&d.st!=='run'&&d.st!=='bark'){d.st='orbit';d.stT=3}
  if(d.stT<=0)dogNext(d,g);
  EX=[{n:pn,r:.2},{n:g.n,r:.17}];
  switch(d.st){
   case 'orbit':d.sp=dg>.8?.8:dg>.5?.55:.36;steer(d,orbSlot(d.n,g.n,d.orb,d.od),d.sp,dt);break;
   case 'run':{d.sp=.95;if(steer(d,d.tg,d.sp,dt)<.12)d.tg=randNear(g.n,.55,.95);break}
   case 'sit':case 'pant':steer(d,g.n,0,dt);break;
   case 'bark':steer(d,pn,0,dt);d.bt-=dt;if(d.bt<=0&&d.barks<(d.meow?2:3)){d.barks++;if(d.meow){d.bt=1.1;d.barkP=.7;meow();say(d,'야옹~',1.5,1.1)}else{d.bt=.6;d.barkP=.22;bark();say(d,'멍멍!',1.5)}}break;
  }
  sep(d,g.n,.16);sep(d,pn,.17)}
 if(cat.mode==='chase'){const da=cat.n.angleTo(d.n);catAim.copy(d.n).addScaledVector(d.f,-.28).normalize();EX=[{n:pn,r:.16},{n:g.n,r:.12}];cat.sp=da>.5?1.28:1.12;steer(cat,da>.42?d.n:catAim,cat.sp,dt);sep(cat,pn,.14);sep(cat,g.n,.11)}
 else if(window.bfs&&bfs.length){cat.actT-=dt;if(cat.mode!=='lick'&&cat.actT<=0){cat.mode='lick';cat.actT=2.3+rnd2()*1.1}
  if(cat.mode==='lick'){cat.sp=0;if(cat.actT<=0){cat.mode='bf';cat.actT=8+rnd2()*8;cat.ct=.2}}
  else{cat.ct-=dt;if(cat.ct<=0){cat.ct=5+rnd2()*5;cat.bi=Math.floor(rnd2()*bfs.length)}
   const tg=bfs[cat.bi].g.position.clone().normalize(),da=cat.n.angleTo(tg);EX=[{n:pn,r:.2},{n:g.n,r:.14},{n:d.n,r:.12}];
   cat.sp=da>.9?.9:da>.3?.65:da>.1?.4:0;steer(cat,tg,cat.sp,dt);
   if(da<.12&&cat.hop<=0&&rnd2()<dt*1.5)cat.hop=.5}
  sep(cat,pn,.17);sep(cat,g.n,.13);if(cat.mode!=='lick')sep(cat,d.n,.12)}
 for(const c of [g,d,cat]){const id=c===g?'girl':c===d?'dog':'cat';if(snack&&snack.who===id&&snack.lock){c.n.copy(snack.lock.n);c.f.copy(snack.lock.f);c.sp=0;c.mv=0;if(id==='cat'){c.mode='bf';c.lk=0;c.hop=0}if(id==='dog'){c.st='orbit';c.sit=0;c.lay=0}if(id==='girl')c.wave=false}basisQ(c.n,c.f,c.o.quaternion);c.o.position.copy(c.n).multiplyScalar(R);c.mv+=((c.sp>0?1:0)-c.mv)*Math.min(1,dt*8)}
 {const r=g.rig;g.walk+=dt*10*g.mv;const s=Math.sin(g.walk);r.legs[0].rotation.x=s*.8*g.mv;r.legs[1].rotation.x=-s*.8*g.mv;r.arms[0].rotation.x=-s*.7*g.mv;r.arms[1].rotation.x=s*.7*g.mv;
  r.arms[1].rotation.z+=((g.wave&&g.mv<.2?2.5+Math.sin(tw*9)*.3:0)-r.arms[1].rotation.z)*Math.min(1,dt*10);
  r.body.position.y=Math.abs(s)*.06*g.mv+Math.sin(tw*2+1)*.012}
 {const r=d.rig,st=d.st,k=Math.min(1,dt*6);d.sit+=((st==='sit'?1:0)-d.sit)*k;d.lay+=((st==='roll'?1:0)-d.lay)*Math.min(1,dt*3.5);
  d.walk+=dt*(9+8*d.sp)*(st==='dash'?1.3:1)*d.mv;const s=Math.sin(d.walk),tr=s*.9*d.mv*(1-d.sit)*(1-d.lay),sw=Math.sin(tw*6)*.7*d.lay;
  d.barkP=Math.max(0,d.barkP-dt);const bk=d.barkP>0?1:0,pa=st==='dash'||st==='pant'?1:st==='sit'?.7:st==='run'?1:st==='roll'?.6:st==='orbit'?.35:0;
  r.legs[0].rotation.x=tr+.6*d.sit+sw;r.legs[1].rotation.x=-tr+.6*d.sit-sw;r.legs[2].rotation.x=-tr-.9*d.sit+sw*1.2;r.legs[3].rotation.x=tr-.9*d.sit-sw*1.2;
  r.body.rotation.x=-.6*d.sit;r.body.rotation.z=Math.PI*d.lay;r.body.rotation.y=d.lay*Math.sin(tw*4)*.18;
  r.body.position.y=-.08*d.sit+.69*d.lay+Math.abs(s)*(st==='dash'?.16:st==='run'?.1:.05)*d.mv*(1-d.lay);
  r.body.scale.setScalar(1+.015*pa*Math.sin(tw*14));
  r.head.rotation.x=Math.sin(tw*2)*.05-.4*bk;r.head.rotation.z=Math.sin(tw*1.3)*.08;
  r.jaw.rotation.x=Math.max(pa*(.12+.1*Math.sin(tw*14)),bk*.5);
  const e=pa*(.55+.35*Math.sin(tw*14-1));r.tongue.scale.z=.02+e*1.9;r.tongue.position.z=.1+e*.08;r.tongue.rotation.x=e*.5;
  r.tail.rotation.y=Math.sin(tw*(9+9*d.mv+(st==='sit'?4:0)+(st==='dash'?12:0)))*(st==='dash'?.95:.7)}
 {const r=cat.rig,ch=cat.mode==='chase';cat.lk+=(((cat.mode==='lick'?1:0)-cat.lk)*Math.min(1,dt*5));cat.walk+=dt*(10+8*cat.sp)*(ch?1.25:1)*cat.mv;const sn=Math.sin(cat.walk),tr=sn*.9*cat.mv*(ch?1.3:1),lk=cat.lk;cat.hop=Math.max(0,cat.hop-dt);const hp=cat.hop>0?Math.sin(Math.PI*(1-cat.hop/.5)):0;
  r.legs[0].rotation.x=tr*(1-lk)-.5*hp+.2*lk;r.legs[1].rotation.x=-tr*(1-lk)-.5*hp+.2*lk;r.legs[2].rotation.x=-tr*(1-lk)+.6*hp+1.25*lk;r.legs[3].rotation.x=tr*(1-lk)+.6*hp;
  r.body.position.y=Math.abs(sn)*.05*cat.mv+.45*hp-.07*lk;r.body.rotation.x=-.35*hp-(ch?.28:0)+.2*lk;r.body.rotation.z=.35*lk;
  r.head.rotation.x=Math.sin(tw*2)*.04*(1-lk)-.3*hp+(.8+Math.sin(tw*11)*.2)*lk;r.head.rotation.y=.2*lk;r.head.rotation.z=-.6*lk;
  r.tail.rotation.x=-.5-(ch?.9:0)+.15*lk;r.tail.rotation.y=Math.sin(tw*(ch?13:lk>.4?3.2:5))*(ch?.9:.45)}
 for(let i=bubs.length-1;i>=0;i--){const b=bubs[i];b.t+=dt;const r=b.t/b.life;if(r>=1){b.el.remove();bubs.splice(i,1);continue}
  vC.copy(b.c.n).multiplyScalar(R+b.h+r*.3).applyQuaternion(world.quaternion).project(cam);
  b.el.style.transform='translate('+(vC.x+1)/2*innerWidth+'px,'+(1-vC.y)/2*innerHeight+'px) translate(-50%,-100%)';b.el.style.opacity=r<.15?r/.15:r>.75?(1-r)/.25:1}}
/* ===== 날씨 (접속 지역 · 비 · 눈) ===== */
const fxC=document.getElementById('fx'),fxX=fxC.getContext('2d');
const fxResize=()=>{fxC.width=innerWidth;fxC.height=innerHeight};
const K_=(wx,rain=0,snow=0,fog=0,storm=0)=>({wx,rain,snow,fog,storm});
const WXK={clear:K_(0),partial:K_(.25),cloudy:K_(.55),rain:K_(.85,.75),snow:K_(.6,0,.85),storm:K_(1,1,0,0,1),fog:K_(.5,0,0,1)};
const WXN={clear:'맑음',partial:'구름 조금',cloudy:'흐림',rain:'비',snow:'눈',storm:'천둥·번개',fog:'안개'};
const WIC={auto:'<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>',
 clear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>',
 cloudy:'<svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5 4.25 4.25 0 0 1 17 18z"/></svg>',
 rain:'<svg viewBox="0 0 24 24"><path d="M7 14a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 5.5 4.25 4.25 0 0 1 17 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>',
 snow:'<svg viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/></svg>'};
const WLB={auto:'자동 (내 지역 날씨)',clear:'맑음',cloudy:'흐림',rain:'비',snow:'눈'};
const TZ={'Asia/Seoul':[37.57,126.98,'서울'],'Asia/Tokyo':[35.68,139.69,'도쿄'],'Asia/Shanghai':[31.23,121.47,'상하이'],'Asia/Hong_Kong':[22.32,114.17,'홍콩'],'Asia/Taipei':[25.03,121.57,'타이베이'],'Asia/Singapore':[1.35,103.82,'싱가포르'],'Asia/Bangkok':[13.75,100.5,'방콕'],'Asia/Ho_Chi_Minh':[10.82,106.63,'호치민'],'Asia/Manila':[14.6,120.98,'마닐라'],'Asia/Jakarta':[-6.2,106.85,'자카르타'],'Asia/Kolkata':[28.61,77.21,'뉴델리'],'Asia/Dubai':[25.2,55.27,'두바이'],
 'Europe/London':[51.51,-.13,'런던'],'Europe/Paris':[48.86,2.35,'파리'],'Europe/Berlin':[52.52,13.4,'베를린'],'Europe/Madrid':[40.42,-3.7,'마드리드'],'Europe/Rome':[41.9,12.5,'로마'],'Europe/Moscow':[55.75,37.62,'모스크바'],
 'America/New_York':[40.71,-74,'뉴욕'],'America/Chicago':[41.88,-87.63,'시카고'],'America/Denver':[39.74,-104.99,'덴버'],'America/Los_Angeles':[34.05,-118.24,'로스앤젤레스'],'America/Toronto':[43.65,-79.38,'토론토'],'America/Vancouver':[49.28,-123.12,'밴쿠버'],'America/Sao_Paulo':[-23.55,-46.63,'상파울루'],'America/Mexico_City':[19.43,-99.13,'멕시코시티'],
 'Australia/Sydney':[-33.87,151.21,'시드니'],'Australia/Melbourne':[-37.81,144.96,'멜버른'],'Pacific/Auckland':[-36.85,174.76,'오클랜드'],'Pacific/Honolulu':[21.31,-157.86,'호놀룰루']};
const codeKind=c=>c>=95?'storm':(c>=71&&c<=77)||c===85||c===86?'snow':(c>=51&&c<=67)||(c>=80&&c<=82)?'rain':c===45||c===48?'fog':c===3?'cloudy':c>=1&&c<=2?'partial':'clear';
let wxMode='auto',wxKind='clear',wxDet=null,wxPos=null,wxWarned=false,snowAcc=0,snowLast=0,snowBase=null;
const wxc={wx:0,rain:0,snow:0,fog:0,storm:0,flash:0,nf:6,f2:0,bolt:null};
async function wxLoad(precise){
 try{
  if(precise&&navigator.geolocation){try{const p=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:8000,maximumAge:3600000}));wxPos=[p.coords.latitude,p.coords.longitude,'내 위치']}catch(e){}}
  if(!wxPos){const z=TZ[Intl.DateTimeFormat().resolvedOptions().timeZone];if(!z)throw 0;wxPos=z}
  const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+wxPos[0]+'&longitude='+wxPos[1]+'&current=weather_code&timezone=auto');
  if(!r.ok)throw 0;const j=await r.json(),k=codeKind(j.current.weather_code);wxDet=k;
  if(wxMode==='auto'){wxKind=k;toast(wxPos[2]+' · '+WXN[k])}
 }catch(e){if(!wxWarned){wxWarned=true;toast('날씨를 불러오지 못했어요. 아이콘으로 직접 골라 보세요')}}}
function wxMark(){document.querySelectorAll('#wx button').forEach(b=>b.classList.toggle('on',b.dataset.m===wxMode))}
function buildWx(){
 ['auto','clear','cloudy','rain','snow'].forEach(m=>{const b=document.createElement('button');b.dataset.m=m;b.innerHTML=WIC[m];b.title=WLB[m];b.setAttribute('aria-label',WLB[m]);
  b.onclick=()=>{wxMode=m;wxMark();if(m==='auto'){wxKind=wxDet||'clear';wxLoad(true)}else{wxKind=m;toast(WLB[m])}};$('#wx').appendChild(b)});
 wxMark();wxLoad(false);setInterval(()=>{if(wxMode==='auto')wxLoad(false)},900000)}
function thunder(){if(!ac||ac.state!=='running'||muted)return;const sr=ac.sampleRate,len=sr*4,b=ac.createBuffer(1,len,sr),d=b.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+.03*(Math.random()*2-1))/1.03;d[i]=l*4*Math.exp(-i/sr*1.1)}
 const s=ac.createBufferSource();s.buffer=b;const f=flt('lowpass',260),gn=ac.createGain();gn.gain.value=1.6;s.connect(f);f.connect(gn);gn.connect(mast);s.start()}
const RL=[{n:260,sp:.6,len:15,w:.8,a:.2,y0:.5,y1:.66},{n:260,sp:.9,len:26,w:1.1,a:.32,y0:.6,y1:.86},{n:150,sp:1.3,len:44,w:1.7,a:.48,y0:.82,y1:1.02}];
const RNL=RL.map(L=>Array.from({length:L.n},()=>{const e=L.y0+rnd2()*(L.y1-L.y0);return{x:rnd2()*1.3-.15,y:rnd2()*e,e,s:.85+rnd2()*.3}}));
const SPL=[];
const SL=[{n:90,r:2.2,sp:.03,a:.55,sw:.8},{n:90,r:3.2,sp:.045,a:.7,sw:1},{n:80,r:4.6,sp:.065,a:.85,sw:1.25},{n:36,r:10,sp:.09,a:.26,sw:1.6}];
const SNL=SL.map(L=>Array.from({length:L.n},()=>({x:rnd2(),y:rnd2(),s:.7+rnd2()*.7,ph:rnd2()*6.3,fq:.5+rnd2()*.9,am:.6+rnd2()*.8})));
const sfl=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.7)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return c})();
function wxDraw(dt){const w=fxC.width,h=fxC.height,x=fxX;x.clearRect(0,0,w,h);
 if(wxc.fog>.02){const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(225,232,236,'+.15*wxc.fog+')');gr.addColorStop(1,'rgba(225,232,236,'+.45*wxc.fog+')');x.fillStyle=gr;x.fillRect(0,0,w,h)}
 if(wxc.rain>.02){x.lineCap='round';
  x.fillStyle='rgba(90,110,135,'+.1*wxc.rain+')';x.fillRect(0,0,w,h);
  const wind=.17+.04*Math.sin(tw*.4)+.03*Math.sin(tw*1.1);
  RL.forEach((L,li)=>{const arr=RNL[li],n=Math.floor(arr.length*wxc.rain);
   x.lineWidth=L.w;x.strokeStyle='rgba(215,228,245,'+L.a*.175+')';x.beginPath();
   for(let i=0;i<n;i++){const p=arr[i];p.y+=L.sp*p.s*dt;p.x-=wind*L.sp*p.s*dt*h/w;
    if(p.y>=p.e){if(li>0&&SPL.length<90&&rnd2()<.55)SPL.push({x:p.x*w,y:p.e*h,r:2,a:.4+.1*li});p.y=-.06-rnd2()*.12;p.x=rnd2()*1.3-.15}
    if(p.x<-.2)p.x+=1.4;
    const px=p.x*w,py=p.y*h,l=L.len*p.s;x.moveTo(px,py);x.lineTo(px-wind*l,py-l)}
   x.stroke();
   x.strokeStyle='rgba(238,245,255,'+L.a*.35+')';x.beginPath();
   for(let i=0;i<n;i++){const p=arr[i],px=p.x*w,py=p.y*h,l=L.len*p.s*.45;x.moveTo(px,py);x.lineTo(px-wind*l,py-l)}
   x.stroke()});
  x.lineWidth=1;
  for(let i=SPL.length-1;i>=0;i--){const q=SPL[i];q.r+=dt*28;q.a-=dt*.85;if(q.a<=0){SPL.splice(i,1);continue}
   x.strokeStyle='rgba(235,243,255,'+q.a*wxc.rain*.35+')';x.beginPath();x.ellipse(q.x,q.y,q.r,q.r*.3,0,0,6.2832);x.stroke()}}
 if(wxc.snow>.02){const gust=.004+.006*Math.sin(tw*.23)+.004*Math.sin(tw*.61+1);
  SL.forEach((L,li)=>{const arr=SNL[li],n=Math.floor(arr.length*wxc.snow);x.globalAlpha=L.a;
   for(let i=0;i<n;i++){const p=arr[i];
    p.y+=L.sp*p.s*(1+.3*Math.sin(tw*p.fq*2.2+p.ph))*dt;
    p.x+=(Math.sin(tw*p.fq+p.ph)*.018*p.am*L.sw+Math.cos(tw*p.fq*.6+p.ph*2)*.008*p.am*L.sw+gust*L.sw*p.s)*dt;
    if(p.y>1.04){p.y=-.04;p.x=rnd2()*1.2-.1}if(p.x>1.1)p.x-=1.2;if(p.x<-.1)p.x+=1.2;
    const d=L.r*(.8+.4*p.s)*2;x.drawImage(sfl,p.x*w-d/2,p.y*h-d/2,d,d)}});
  x.globalAlpha=1}
 if(wxc.bolt&&wxc.bolt.t>0){wxc.bolt.t-=dt;x.strokeStyle='rgba(255,255,255,.92)';x.lineWidth=2.5;x.shadowColor='#bcd';x.shadowBlur=18;x.beginPath();let bx=wxc.bolt.x,by=0;x.moveTo(bx,by);while(by<h*.55){by+=h*.045;bx+=(rnd2()-.5)*w*.04;x.lineTo(bx,by)}x.stroke();x.shadowBlur=0}
 if(wxc.flash>.02){x.fillStyle='rgba(235,240,255,'+wxc.flash*.18+')';x.fillRect(0,0,w,h)}}
function wxTick(dt){
 const p=WXK[wxKind]||WXK.clear,k=1-Math.exp(-dt*1.2);
 for(const n of ['wx','rain','snow','fog','storm'])wxc[n]+=(p[n]-wxc[n])*k;
 U.uWx.value=wxc.wx;U.uRain.value=wxc.rain;
 if(wxc.storm>.5){wxc.nf-=dt;if(wxc.nf<=0){wxc.nf=5+rnd2()*9;wxc.flash=1;wxc.f2=.14;wxc.bolt={x:(rnd2()<.5?.1+rnd2()*.25:.65+rnd2()*.25)*fxC.width,t:.2};setTimeout(thunder,400+rnd2()*900)}}
 if(wxc.f2>0){wxc.f2-=dt;if(wxc.f2<=0)wxc.flash=.8}
 wxc.flash=Math.max(0,wxc.flash-dt*3.2);U.uFlash.value=wxc.flash*.45;
 if(!snowBase)snowBase=planet.geometry.attributes.color.array.slice();
 const tg=wxc.snow>.4?.9:0;snowAcc+=(tg-snowAcc)*(1-Math.exp(-dt*(tg?.35:.2)));
 if(Math.abs(snowAcc-snowLast)>.012){snowLast=snowAcc;const ca=planet.geometry.attributes.color,arr=ca.array;for(let i=0;i<arr.length;i++)arr[i]=snowBase[i]+(1-snowBase[i])*snowAcc*.92;ca.needsUpdate=true}
 wxDraw(dt)}
/* ===== 루프 ===== */
let tw=0,walk=0,amp=0,intro=0,started=false,halted=false,stepT=0,k=1,ride=null,snack=null;
const rideQ=new T.Quaternion(),rideQ2=new T.Quaternion(),rideQ3=new T.Quaternion(),rideV=new T.Vector3(),rideV2=new T.Vector3(),rideV3=new T.Vector3(),rideSeat=new T.Vector3(),rideAxZ=new T.Vector3(0,0,1),rideAxX=new T.Vector3(1,0,0);
function swingSeat(th,out){out.set(0,3.18-2.28*Math.cos(th),-2.28*Math.sin(th));return out}
/* 어깨에서 팔 길이만큼 떨어진 줄 위의 점을 잡아, 그 손만 그쪽 줄을 감싼다 */
function gripSwing(group,arm){
 const L=.38,sx=arm.position.x,pivot=group.userData.pivot;
 boy.worldToLocal(pivot.localToWorld(rideV.set(.58,-1.2,0)));
 const rx=(sx>=0)===(rideV.x>=0)?.58:-.58;
 boy.worldToLocal(pivot.localToWorld(rideSeat.set(rx,-.05,0)));
 boy.worldToLocal(pivot.localToWorld(rideV3.set(rx,-2.15,0)));
 const ax=rideV3.x-rideSeat.x,ay=rideV3.y-rideSeat.y,az=rideV3.z-rideSeat.z;
 const bx=rideSeat.x-sx,by=rideSeat.y-arm.position.y,bz=rideSeat.z-arm.position.z;
 const qa=ax*ax+ay*ay+az*az,qb=2*(ax*bx+ay*by+az*bz),qc=bx*bx+by*by+bz*bz-L*L;
 let t=.42,disc=qb*qb-4*qa*qc;
 if(disc>=0&&qa>1e-6){const s=Math.sqrt(disc),t1=(-qb-s)/(2*qa),t2=(-qb+s)/(2*qa),ok=u=>u>=-.05&&u<=1.05;
  if(ok(t1)&&ok(t2))t=Math.min(t1,t2);else if(ok(t1))t=t1;else if(ok(t2))t=t2;else t=Math.max(0,Math.min(1,t1))}
 else if(qa>1e-6)t=Math.max(0,Math.min(1,-qb/(2*qa)));
 const dx=rideSeat.x+ax*t-sx,dy=rideSeat.y+ay*t-arm.position.y,dz=rideSeat.z+az*t-arm.position.z;
 arm.rotation.y=0;arm.rotation.z=Math.atan2(dx,-dy);arm.rotation.x=-Math.atan2(dz,Math.hypot(dx,dy)||1)}
function rideQuat(group,local,axis,targetAngle,out){
 rideV.copy(local).applyQuaternion(group.quaternion).add(group.position);
 const len=rideV.length()||1;rideV3.copy(rideV).multiplyScalar(1/len);
 out.setFromUnitVectors(rideV3,TOP);
 rideV2.copy(axis).applyQuaternion(group.quaternion);rideV2.addScaledVector(rideV3,-rideV2.dot(rideV3));
 if(rideV2.lengthSq()<1e-6)rideV2.set(1,0,0);
 rideV2.normalize().applyQuaternion(out);
 out.premultiply(rideQ3.setFromAxisAngle(TOP,targetAngle-Math.atan2(rideV2.x,rideV2.z)));
 return len}
let zoomBack=null,zoomKind='';
function zoomRide(kind){if(zoomBack==null)zoomBack=zt;zoomKind=kind;zt=kind==='swing'?.22:.24}
function zoomClear(){if(zoomBack!=null){zt=zoomBack;zoomBack=null}zoomKind=''}
function goRide(o){
 if(!o||ride)return;stopLie();
 auto={n:o.userData.stand.clone(),reach:.11,ride:o.userData.ride,group:o};
 if(o.userData.ride==='slide'||o.userData.ride==='swing')zoomRide(o.userData.ride)}
function beginRide(kind,group){
 if(ride)return;jh=0;jv=0;stopLie();if(snack)endSnack();
 if(kind==='swing'){yaw=-Math.PI/2;rideV2.copy(group.userData.front);zoomRide('swing')}else{yaw=Math.PI/2;rideV2.copy(group.userData.foot);zoomRide('slide')}
 rideQ.copy(world.quaternion);rideQuat(group,rideV2,rideAxZ,Math.PI/2,rideQ2);
 ride={kind,group,phase:'align',t:0,q0:rideQ.clone(),q1:rideQ2.clone()}}
function rideOff(){
 if(!ride||ride.phase==='off')return;
 ride.phase='off';ride.t=0;ride.a0=ride.group.userData.pivot?ride.group.userData.pivot.rotation.x:0;ride.p0=boy.position.clone()}
function slideSfx(){if(!ac||ac.state!=='running'||muted||vol===0)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=flt('lowpass',900);
 o.type='triangle';o.frequency.setValueAtTime(560,t);o.frequency.exponentialRampToValueAtTime(160,t+.5);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.1,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+.5);
 o.connect(f);f.connect(g);g.connect(sfx);o.start(t);o.stop(t+.52)}
function rideStand(){legs[0].rotation.x=legs[1].rotation.x=0;arms[0].rotation.x=arms[1].rotation.x=0;arms[0].rotation.z=arms[1].rotation.z=0;body.rotation.x=0;body.position.y=0}
function rideTick(dt){
 if(!ride)return;
 const g=ride.group;
 if(ride.phase==='align'){
  ride.t+=dt;const u=Math.min(1,ride.t/.4);
  world.quaternion.copy(ride.q0).slerp(ride.q1,ease(u));
  boy.position.set(0,R,0);boy.rotation.set(0,yaw,0);rideStand();
  if(u>=1){ride.phase='play';ride.t=0;ride.slid=false}
  return}
 if(ride.phase==='off'){
  ride.t+=dt;const u=Math.min(1,ride.t/.3),e=ease(u);
  if(g.userData.pivot)g.userData.pivot.rotation.x=ride.a0*(1-e);
  boy.position.lerpVectors(ride.p0,rideV.set(0,R,0),e);
  const k=1-e;
  legs[0].rotation.x=legs[1].rotation.x=-1.15*k;arms[0].rotation.z=-1.15*k;arms[1].rotation.z=1.15*k;arms[0].rotation.x=arms[1].rotation.x=-.35*k;body.rotation.x=.08*k;body.position.y=0;
  boy.rotation.set(ride.a0*.2*k,yaw,0);
  if(u>=1){if(g.userData.pivot)g.userData.pivot.rotation.x=0;boy.position.set(0,R,0);boy.rotation.set(0,yaw,0);rideStand();const next=ride.after;ride=null;if(next)auto=next}
  return}
 if(ride.phase==='stand'){
  ride.t+=dt;const u=Math.min(1,ride.t/.34),e=ease(u);
  world.quaternion.copy(ride.q0).slerp(ride.q1,e);
  boy.position.set(0,ride.len0+(R-ride.len0)*e,0);
  boy.rotation.set(0,Math.PI/2,0);rideStand();
  if(u>=1){boy.position.set(0,R,0);yaw=Math.PI/2;ride=null}
  return}
 if(ride.kind==='swing'){
  ride.t+=dt;
  const pivot=g.userData.pivot,SIT=.42,period=2.05,HIP=.4;
  let th=0,pose=0;
  if(ride.t<SIT){
   const e=ease(ride.t/SIT);
   rideV2.copy(g.userData.front).lerp(swingSeat(0,rideSeat),e);pose=e;
  }else{
   const t=ride.t-SIT,env=Math.min(1,t/.8);
   th=Math.sin(t/period*Math.PI*2)*.58*env;
   swingSeat(th,rideV2);pose=1;
  }
  pivot.rotation.x=th;
  const len=rideQuat(g,rideV2,rideAxZ,Math.PI/2,world.quaternion);
  boy.quaternion.setFromAxisAngle(AY,Math.PI);
  pivot.updateWorldMatrix(true,false);
  pivot.getWorldQuaternion(rideQ3);
  boy.quaternion.premultiply(rideQ3);
  boy.position.set(0,len,0);
  rideV.set(0,-HIP*pose,0).applyQuaternion(boy.quaternion);boy.position.add(rideV);
  legs[0].rotation.x=legs[1].rotation.x=-1.15*pose;
  body.rotation.set(0,0,0);body.position.y=0;
  g.updateWorldMatrix(true,true);boy.updateMatrixWorld(true);
  arms.forEach(a=>{gripSwing(g,a);a.rotation.x*=pose;a.rotation.z*=pose});
  return}
 ride.t+=dt;
 const steps=g.userData.steps,STEP=.56,climb=steps.length*STEP,turn=.28,slide=1.15;
 if(ride.t<climb){
  const i=Math.min(steps.length-1,Math.floor(ride.t/STEP)),u=(ride.t-i*STEP)/STEP,e=u<.42?0:ease((u-.42)/.58);
  rideV2.lerpVectors(i?steps[i-1]:g.userData.foot,steps[i],e);
  const lift=Math.sin(Math.min(1,u/.72)*Math.PI),lead=i%2;
  legs[lead].rotation.x=-lift*1.45;legs[1-lead].rotation.x=0;
  arms[0].rotation.z=-.45;arms[1].rotation.z=.45;arms[0].rotation.x=arms[1].rotation.x=-.9;body.rotation.x=.28;body.position.y=0;
  boy.rotation.set(0,Math.PI/2,0);
 }else if(ride.t<climb+turn){
  const u=(ride.t-climb)/turn;
  rideV2.copy(steps[steps.length-1]);
  legs[0].rotation.x=legs[1].rotation.x=0;arms[0].rotation.z=-.3;arms[1].rotation.z=.3;arms[0].rotation.x=arms[1].rotation.x=-.4;body.rotation.x=.08;body.position.y=0;
  boy.rotation.set(0,Math.PI/2,0);
 }else{
  const u=Math.min(1,(ride.t-climb-turn)/slide),e=Math.pow(u,1.35);
  if(!ride.slid){ride.slid=true;slideSfx()}
  rideV2.copy(g.userData.top).lerp(g.userData.exit,e);
  const sit=u<.78?1:1-(u-.78)/.22;
  legs[0].rotation.x=legs[1].rotation.x=-1.15*sit;arms[0].rotation.z=-2.1*sit;arms[1].rotation.z=2.1*sit;arms[0].rotation.x=arms[1].rotation.x=-.15*sit;body.rotation.x=.14*sit;body.position.y=0;
  boy.rotation.set(0,Math.PI/2,0);
  if(u>=1){
   const len=rideQuat(g,rideV2,rideAxZ,Math.PI/2,world.quaternion);
   boy.position.set(0,len,0);boy.rotation.set(0,Math.PI/2,0);rideStand();
   ride.phase='stand';ride.t=0;ride.len0=len;ride.q0=world.quaternion.clone();
   rideQuat(g,g.userData.land,rideAxZ,Math.PI/2,rideQ2);ride.q1=rideQ2.clone();return}
 }
 const len=rideQuat(g,rideV2,rideAxZ,Math.PI/2,world.quaternion);
 boy.position.set(0,len,0)}
const clock=new T.Clock(),AY=new T.Vector3(0,1,0),axis=new T.Vector3(),q=new T.Quaternion(),q2=new T.Quaternion(),tmp=new T.Vector3(),cl=new T.Vector3();
const look=new T.Vector3(0,2,0),dir=new T.Vector3(-.09,.5,.86).normalize(),camDir=dir.clone(),swingDir=new T.Vector3(-.28,.4,1).normalize();
function resize(){const w=innerWidth,h=innerHeight;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();rd.getDrawingBufferSize(U.uR.value);bgC.left=-cam.aspect;bgC.right=cam.aspect;bgC.updateProjectionMatrix();fxResize();k=Math.max(1,Math.pow(.95/cam.aspect,.8))}
addEventListener('resize',resize);
function frame(){requestAnimationFrame(frame);if(halted)return;const dt=Math.min(clock.getDelta(),.05);tw+=dt;
 const sw=swell(tw);U.uSw.value=sw;U.uT.value=tw;audioTick(sw);
 let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iz=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
 if(Math.hypot(jx,jy)>.2){ix=jx;iz=-jy}
 if(!ride&&dockOn&&!auto)auto={n:rv(),reach:.05};if(!ride&&dockOn&&(wanderT-=dt)<=0){wanderT=2+rnd2()*3;if(rnd2()<.5&&jh<=0)jv=6.5}
 if(ride&&ride.kind==='swing'&&ride.phase!=='off'&&(Math.hypot(ix,iz)>.01||Math.hypot(jx,jy)>.2))rideOff();
 if(ride)ix=iz=0;
 else if(auto&&(!modalOpen||dockOn)){tmp.copy(auto.n).applyQuaternion(world.quaternion);const ang=Math.acos(Math.min(1,tmp.y));
  if(ang<auto.reach){const s=auto.spot,rd=auto.ride,rg=auto.group,lie=auto.lie;auto=null;if(s)openSpot(s);else if(rd)beginRide(rd,rg);else if(lie)startLie(lie)}
  else{const l=Math.hypot(tmp.x,tmp.z)||1;ix=tmp.x/l;iz=-tmp.z/l}}
 if(modalOpen&&!dockOn){ix=iz=0}
 let m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m;m=1}
 if(m>.01&&lying&&!(auto&&auto.lie))stopLie();
 if(snack&&m>.01)endSnack();
 if(m>.01&&!rot){const kk=Math.min(1,dt*5);ob.x-=ob.x*kk;ob.y-=ob.y*kk;if(Math.abs(ob.x)+Math.abs(ob.y)<.001)ob.x=ob.y=0}
 if(m>.01){axis.set(iz,0,ix).normalize();q.setFromAxisAngle(axis,m*.55*dt);world.quaternion.premultiply(q).normalize();
  const yt=Math.atan2(ix,-iz);yaw+=Math.atan2(Math.sin(yt-yaw),Math.cos(yt-yaw))*Math.min(1,dt*12);
  stepT+=dt;if(stepT>.2){stepT=0;puff()}}
 boy.rotation.y=yaw;
 amp+=(Math.min(1,m*1.4)-amp)*Math.min(1,dt*10);walk+=dt*12*(m>.01?1:0);
 const s=Math.sin(walk);legs[0].rotation.x=s*.9*amp;legs[1].rotation.x=-s*.9*amp;arms[0].rotation.x=-s*.8*amp;arms[1].rotation.x=s*.8*amp;
 body.position.y=Math.abs(s)*.08*amp+Math.sin(tw*2.2)*.014;body.rotation.x=.1*amp;
 if(jv!==0||jh>0){jv-=22*dt;jh+=jv*dt;if(jh<=0){jh=0;jv=0;puff();puff()}}
 boy.position.y=R+jh;const air=Math.min(1,jh*2.5);arms[0].rotation.z=-2.2*air;arms[1].rotation.z=2.2*air;legs[0].rotation.x-=.6*air;legs[1].rotation.x-=.6*air;
 if(ride){if(jh||jv){jh=0;jv=0}rideTick(dt)}
 if(zoomBack!=null&&!snack&&!ride&&!(auto&&(auto.ride==='slide'||auto.ride==='swing')))zoomClear();
 for(let i=fx.length-1;i>=0;i--){const o=fx[i],u=o.userData;u.a+=dt;const r=u.a/u.life;
  if(r>=1){world.remove(o);o.material.dispose();fx.splice(i,1);continue}
  if(u.ring){o.scale.setScalar(1+r*1.6);o.material.opacity=.9*(1-r)}else{o.scale.setScalar(.08+r*.3);o.material.opacity=.55*(1-r);o.position.y+=0}}
  markers.forEach((o,i)=>{o.m.position.y=o.y+Math.sin(tw*3+i)*.1;o.m.rotation.y+=dt*2});
 cl.copy(cam.position);world.worldToLocal(cl);
 spotObjs.forEach(o=>{basisQ(o.userData.n,cl,q2);o.quaternion.slerp(q2,Math.min(1,dt*5))});
 near=null;if(!modalOpen){let best=9;for(const o of spotObjs){tmp.copy(o.userData.n).applyQuaternion(world.quaternion);const a=Math.acos(Math.min(1,tmp.y)),r=SPOTS[o.userData.spot].reach+.1;if(a<r&&a<best){best=a;near=o.userData.spot}}}
 nearRide=null;if(!near&&!ride&&!modalOpen){let best=9;for(const o of rides){tmp.copy(o.userData.stand||o.userData.n).applyQuaternion(world.quaternion);const a=Math.acos(Math.min(1,tmp.y));if(a<.36&&a<best){best=a;nearRide=o}}}
 const ab=$('#act');if(near){const sp=SPOTS[near];ab.hidden=false;ab.textContent=`${sp.icon} ${sp.name} 열기`}else if(nearRide){ab.hidden=false;ab.textContent=nearRide.userData.ride==='slide'?'🛝 미끄럼 타기':'🛝 그네 타기'}else ab.hidden=true;
 if(started&&intro<1)intro=Math.min(1,intro+dt/3);const e=1-Math.pow(1-intro,3);zm+=(zt-zm)*Math.min(1,dt*8);
 const swingOn=zoomKind==='swing'&&(!!ride||(auto&&auto.ride==='swing')),slideOn=zoomKind==='slide'&&!swingOn;
 look.y+=(((snack?snack.look:swingOn?8.6:slideOn?7.15:2))-look.y)*Math.min(1,dt*3.2);
 camDir.lerp(swingOn?swingDir:dir,Math.min(1,dt*2.6)).normalize();
 dkv=dkT?Math.min(1,dkv+dt/1.5):Math.max(0,dkv-dt/1.3);const dk1=ease(Math.min(1,dkv*2)),dk2=ease(Math.max(0,dkv*2-1)),wide=innerWidth>=760;
 const D=35*k*zm*(1+(1-e)*.7)*(1+dk1);cam.position.copy(look).addScaledVector(camDir,D);cam.position.x+=Math.sin(tw*.4)*.12;if(ob.x||ob.y){oE.set(ob.x,ob.y,0);oQ.setFromEuler(oE);cam.position.applyQuaternion(oQ);cam.up.set(0,1,0).applyQuaternion(oQ);oT.copy(look).applyQuaternion(oQ)}else{cam.up.set(0,1,0);oT.copy(look)}cam.lookAt(oT);cam.setViewOffset(innerWidth,innerHeight,wide?dk2*innerWidth*.25:0,dk1*innerHeight*(wide?.1:.28),innerWidth,innerHeight);
 todTick(dt);wxTick(dt);etTick(dt);seaUpdate(dt);for(const f of flowerSway)f.g.rotation.z=Math.sin(tw*1.35+f.ph)*f.a;bfUpdate(dt);npcUpdate(dt);itemTick(dt);
 rd.clear();if(!BG_VIDEO)rd.render(bgS,bgC);rd.clearDepth();rd.render(scene,cam)}

/* ===== 상점 물건: 착용 · 먹기 · 바닥에 놓기 ===== */
const WEAR={boy:{shell:[0,-.55,.28],hat:[0,.5,0],s:1.05},girl:{shell:[0,-.52,.28],hat:[0,.48,0],s:1},dog:{shell:[0,-.16,.16],hat:[0,.2,.04],s:.5},cat:{shell:[0,-.12,.14],hat:[0,.16,.02],s:.42}};
const wearMesh=new Map(),placeById=new Map(),hearts=[];
function rigOf(who){if(who==='boy')return boyHead?{head:boyHead,arms,body}:null;const n=npcs[who];return n&&n.rig.head?{head:n.rig.head,arms:n.rig.arms,body:n.rig.body,jaw:n.rig.jaw}:null}
function nearbySpot(){const inv=world.quaternion.clone().invert(),up=new T.Vector3(0,1,0).applyQuaternion(inv),ax=new T.Vector3(1,0,0).applyQuaternion(inv),az=new T.Vector3(0,0,1).applyQuaternion(inv),spots=[...spotObjs.map(o=>o.userData.n),...rides.map(o=>o.userData.n)];
 for(const ang of [.7,1.7,2.6,3.6,4.8,5.6]){const n=up.clone().multiplyScalar(Math.cos(.22)).addScaledVector(ax,Math.sin(.22)*Math.cos(ang)).addScaledVector(az,Math.sin(.22)*Math.sin(ang)).normalize();if(spots.every(s=>n.angleTo(s)>.22)&&n.y>-.2)return n}
 return up.clone().addScaledVector(ax,.2).normalize()}
function makeHat(){const g=new T.Group(),straw=M(0xe6c15a,{roughness:.8});mk(new T.CylinderGeometry(.72,.78,.045,22),straw,0,0,0,g);mk(new T.CylinderGeometry(.3,.34,.24,16),straw,0,.13,0,g);mk(new T.TorusGeometry(.31,.028,8,18),M(0xd24b4b),0,.08,0,g).rotation.x=Math.PI/2;return g}
function makeShell(){const g=new T.Group(),gold=M(0xe6c36a,{roughness:.35,metalness:.4}),shell=M(0xfff3ea,{roughness:.42}),line=M(0xf0b49a,{roughness:.5});
 const chain=mk(new T.TorusGeometry(.2,.014,8,20),gold,0,-.02,0,g);chain.rotation.x=Math.PI/2;
 const cup=mk(new T.SphereGeometry(.16,16,12,0,Math.PI*2,0,Math.PI*.62),shell,0,-.34,.08,g);cup.scale.set(1.55,.62,1.1);cup.rotation.x=.6;
 for(let i=-3;i<=3;i++){const r=mk(new T.BoxGeometry(.018,.028,.2),line,i*.038,-.3,.1,g);r.rotation.x=.6;r.rotation.y=i*.12}
 mk(new T.SphereGeometry(.03,8,6),gold,0,-.16,.02,g);return g}
let popSwirlTex=null;
function popSwirl(){if(popSwirlTex)return popSwirlTex;const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),img=g.createImageData(S,S),d=img.data,cols=[[255,94,168],[255,214,64],[102,214,255],[184,146,255]],cx=S/2,R=S/2-1;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=x-cx,dy=y-cx,r=Math.hypot(dx,dy),i=(y*S+x)*4;if(r>R){d[i+3]=0;continue}let u=Math.atan2(dy,dx)/(Math.PI*2)+r/R*1.65;u=((u%1)+1)%1;const b=u*4,i0=b|0,f=b-i0,m=f>.84?(f-.84)/.16:0,c0=cols[i0%4],c1=cols[(i0+1)%4],shade=1-Math.pow(r/R,2)*.1,rim=r>R*.88?(r-R*.88)/(R*.12):0;for(let k=0;k<3;k++)d[i+k]=(c0[k]*(1-m)+c1[k]*m)*shade*(1-rim*.22);d[i+3]=255}
 g.putImageData(img,0,0);g.globalCompositeOperation='source-atop';const hg=g.createRadialGradient(cx-78,cx-88,6,cx-16,cx-24,R*.7);hg.addColorStop(0,'rgba(255,255,255,.5)');hg.addColorStop(.42,'rgba(255,255,255,.06)');hg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hg;g.beginPath();g.arc(cx,cx,R,0,6.2832);g.fill();
 const t=new T.CanvasTexture(c);t.anisotropy=8;popSwirlTex=t;return t}
function makePop(){const g=new T.Group(),stick=M(0xfff8f4,{roughness:.45});
 mk(new T.CylinderGeometry(.028,.032,.78,12),stick,0,.34,0,g);
 const spin=new T.Group();spin.position.y=.7;
 const edge=mk(new T.CylinderGeometry(.5,.5,.16,48),new T.MeshBasicMaterial({color:0xfff0f6}),0,0,0,spin);edge.rotation.x=Math.PI/2;
 const face=new T.MeshBasicMaterial({map:popSwirl(),side:T.DoubleSide});
 mk(new T.CircleGeometry(.52,64),face,0,0,.082,spin);mk(new T.CircleGeometry(.52,64),face,0,0,-.082,spin);
 g.add(spin);g.userData.spin=spin;return g}
function makeFluff(){const g=new T.Group(),stick=M(0xfff4e4,{roughness:.55}),white=new T.MeshBasicMaterial({color:0xfffdfb}),warm=new T.MeshBasicMaterial({color:0xfff0f4}),cool=new T.MeshBasicMaterial({color:0xf7f8ff});
 mk(new T.CylinderGeometry(.02,.022,.78,10),stick,0,.22,0,g);
 const cone=mk(new T.ConeGeometry(.12,.2,10),M(0xfff6ea,{roughness:.7}),0,.56,0,g);cone.rotation.x=Math.PI;
 const puff=new T.Group();puff.position.y=1.18;puff.scale.setScalar(2);
 [[0,.02,0,.26,white],[.14,.06,.02,.18,white],[-.15,.04,-.02,.18,warm],[.02,.16,.06,.16,white],[-.04,-.1,.1,.16,cool],[.1,-.08,-.08,.15,white],[-.12,.12,.08,.14,white],[.08,.12,-.1,.14,cool],[0,.08,-.14,.15,white],[-.08,-.06,-.1,.14,warm],[.16,.02,.1,.13,white],[-.02,.18,-.04,.13,white],[.04,-.14,.02,.14,cool],[-.16,-.02,.06,.12,white]].forEach(([x,y,z,r,m])=>mk(new T.SphereGeometry(r,16,12),m,x,y,z,puff));
 g.add(puff);return g}
function makeFood(key){return key==='pop'?makePop():makeFluff()}
function parasolCloth(){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d'),cols=['#ff6f8a','#fff6ea','#ffe566','#7ee0c8'],w=32;for(let i=0;i<8;i++){g.fillStyle=cols[i%4];g.fillRect(i*w,0,w,64);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(i*w,0,7,64)}const t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function makeParasol(){const g=new T.Group(),pole=M(0xfff6ea,{roughness:.45}),wood=M(0xc9864a,{roughness:.7}),cloth=new T.MeshStandardMaterial({map:parasolCloth(),roughness:.7,side:T.DoubleSide});
 mk(new T.CylinderGeometry(.055,.065,2.35,12),pole,0,1.18,0,g);mk(new T.ConeGeometry(.065,.22,8),wood,0,-.03,0,g).rotation.x=Math.PI;
 mk(new T.ConeGeometry(1.32,.5,48,1,true),cloth,0,2.15,0,g);
 const ring=mk(new T.TorusGeometry(1.24,.026,6,40),pole,0,1.92,0,g);ring.rotation.x=Math.PI/2;
 mk(new T.SphereGeometry(.085,12,10),M(0xff5d7a),0,2.46,0,g);
 const grab=new T.Mesh(new T.CylinderGeometry(1.2,1.05,2.55,12),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));grab.position.y=1.28;g.add(grab);
 ['#ff6f8a','#fff6ea','#ffe566','#7ee0c8'].forEach((col,i)=>{for(let k=i;k<12;k+=4){const a=k/12*Math.PI*2,drop=mk(new T.ConeGeometry(.08,.14,6),M(col),Math.cos(a)*1.22,1.82,Math.sin(a)*1.22,g);drop.rotation.x=Math.PI}});
 g.userData.tilt={x:-.22,z:.04};g.rotation.set(g.userData.tilt.x,0,g.userData.tilt.z);return g}
function makeTowel(){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d'),cols=['#ff8fab','#ffe566','#7ec8ff','#fffdf8'];for(let i=0;i<16;i++){x.fillStyle=cols[i%4];x.fillRect(i*16,0,16,128)}x.strokeStyle='#fff';x.lineWidth=16;x.strokeRect(8,8,240,112);const t=new T.CanvasTexture(c);t.anisotropy=4;const g=new T.Group();mk(new T.BoxGeometry(3.05,.07,1.55),new T.MeshStandardMaterial({map:t,roughness:.9}),0,.05,0,g);const pick=new T.Mesh(new T.BoxGeometry(3.3,.7,1.9),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));pick.position.y=.2;g.add(pick);
 const sc=document.createElement('canvas');sc.width=128;sc.height=128;const sg=sc.getContext('2d'),rg=sg.createRadialGradient(64,64,8,64,64,62);rg.addColorStop(0,'rgba(72,48,36,.55)');rg.addColorStop(.62,'rgba(72,48,36,.24)');rg.addColorStop(1,'rgba(72,48,36,0)');sg.fillStyle=rg;sg.fillRect(0,0,128,128);
 const shade=mk(new T.PlaneGeometry(2.8,1.85),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}),.05,.11,0,g);shade.rotation.x=-Math.PI/2;shade.castShadow=false;shade.receiveShadow=false;
 const parasol=makeParasol();parasol.position.set(.7,0,.55);parasol.userData.towelHost=g;g.add(parasol);g.userData.parasol=parasol;return g}
function makeCandle(){const g=new T.Group();mk(new T.CylinderGeometry(.05,.058,.2,14),M(0xf6f1e8,{roughness:.7}),0,.1,0,g);mk(new T.CylinderGeometry(.055,.055,.02,12),M(0x7eb8d4),0,.2,0,g);
 const flame=mk(new T.SphereGeometry(.055,10,8),new T.MeshBasicMaterial({color:0xffe08a}),0,.32,0,g);flame.scale.set(.7,1.45,.7);
 const glow=mk(new T.SphereGeometry(.2,10,8),new T.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.35,depthWrite:false}),0,.32,0,g);
 const light=new T.PointLight(0xffb15a,.8,8,2);light.position.y=.36;g.add(light);g.userData.flame=flame;g.userData.glow=glow;g.userData.light=light;return g}
let heartMat=null;
function makeHeart(){if(!heartMat){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#ff4d78';g.beginPath();g.moveTo(64,108);g.bezierCurveTo(8,72,12,28,40,28);g.bezierCurveTo(56,28,64,42,64,42);g.bezierCurveTo(64,42,72,28,88,28);g.bezierCurveTo(116,28,120,72,64,108);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(48,46,10,0,6.3);g.fill();heartMat=new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false})}const s=new T.Sprite(heartMat.clone());s.scale.set(.7,.7,1);return s}
function stopLie(){if(!lying)return;lying=0;legs.forEach((l,i)=>{const h=legHome[i];if(h)l.position.set(h.x,h.y,h.z);l.rotation.set(0,0,0)});body.position.set(0,0,0);body.rotation.set(0,0,0)}
function startLie(id){if(placeById.has(id)){lying=id;toast('타월에 누웠어요')}}
function towelStand(g){const off=new T.Vector3(-.7,0,0).applyQuaternion(g.quaternion);return g.userData.n.clone().multiplyScalar(R).add(off).normalize()}
function towelYaw(g){const q=new T.Quaternion(),ax=new T.Vector3(1,0,0);g.getWorldQuaternion(q);ax.applyQuaternion(q);ax.y=0;if(ax.lengthSq()<1e-4)return yaw;ax.normalize();return Math.atan2(-ax.x,-ax.z)}
function goTowel(g){if(!g)return;const n=towelStand(g);if(ride&&ride.kind==='slide')return;if(ride&&ride.kind==='swing'){ride.after={n,reach:.12,lie:g.userData.towel};rideOff();ring(n);return}stopLie();auto={n,reach:.12,lie:g.userData.towel};ring(n)}
function liePose(){if(!lying)return;const g=placeById.get(lying);if(!g){stopLie();return}yaw=towelYaw(g);boy.rotation.y=yaw;body.rotation.set(-1.5,0,0);body.position.set(0,.3,0);legs.forEach(l=>{l.rotation.set(-1.2,0,0)});arms[0].rotation.set(-.2,0,-1.05);arms[1].rotation.set(-.2,0,1.05)}
function holdArm(who,key){const r=rigOf(who);if(!r||!r.arms)return null;return r.arms[(key==='fluff'&&wearOn.pop===who)?0:1]}
function applyLook(){if(!boy)return;
 for(const key of ['shell','hat','pop','fluff']){const old=wearMesh.get(key);if(old&&old.parent)old.parent.remove(old);wearMesh.delete(key);const who=wearOn[key];if(who!=='boy'&&who!=='girl')continue;const r=rigOf(who);if(!r)continue;
  if(key==='shell'||key==='hat'){const w=WEAR[who];if(!w||!w[key]||!r.head)continue;const g=key==='hat'?makeHat():makeShell();g.position.set(w[key][0],w[key][1],w[key][2]);g.scale.setScalar(w.s);r.head.add(g);wearMesh.set(key,g)}
  else{const arm=holdArm(who,key);if(!arm)continue;const g=key==='pop'?makePop():makeFluff();g.rotation.x=Math.PI;g.position.set(0,who==='girl'?-.34:-.36,.05);arm.add(g);wearMesh.set(key,g)}}
 for(const key of ['towel','candle']){const old=placeById.get(key);if(old){world.remove(old);placeMeshes=placeMeshes.filter(m=>m!==old);placeById.delete(key);if(lying===key)stopLie()}const n=placeN[key];if(!n||!Number.isFinite(+n.x))continue;const g=key==='towel'?makeTowel():makeCandle(),v=new T.Vector3(+n.x,+n.y,+n.z).normalize();place(g,v,key==='towel'?.4:0);if(key==='towel'){g.userData.towel=key;placeMeshes.push(g)}placeById.set(key,g)}}
function togglePlace(key){if(placeN[key]&&Number.isFinite(+placeN[key].x)){placeN[key]=null;saveLook();applyLook();toast('치웠어요');return}const n=nearbySpot();placeN[key]={x:n.x,y:n.y,z:n.z};saveLook();applyLook();toast(key==='towel'?'타월과 파라솔을 펼쳤어요':'캔들을 켰어요')}
function closeAll(){walletOpen=false;$('#modal').classList.remove('on');$('#warn').classList.remove('on');if(dockOn)closeDock();modalOpen=false;auto=null}
function aimSnack(who){const c=npcs[who];if(!c)return null;const q=new T.Quaternion().setFromUnitVectors(c.n,AY),fs=c.f.clone().applyQuaternion(q);q.premultiply(new T.Quaternion().setFromAxisAngle(AY,Math.atan2(dir.x,dir.z)-Math.atan2(fs.x,fs.z)));return q}
const handDown=new T.Vector3(0,-1,0),toMouth=new T.Vector3();
function startSnack(key,who){if(ride){toast('놀이기구에서 내린 다음에 먹을 수 있어요');return}if(snack)endSnack();const r=rigOf(who);if(!r)return;closeAll();stopLie();const food=makeFood(key),pet=!r.arms;if(!pet){food.rotation.x=Math.PI;food.position.set(0,-.36,.02);food.scale.setScalar(who==='girl'?1.35:1.45);r.arms[1].add(food)}else{food.position.set(0,-.04,.2);food.scale.setScalar(who==='cat'?1.35:1.5);if(key==='juice')food.rotation.x=-1.05;r.head.add(food)}const lock=who!=='boy'&&npcs[who]?{n:npcs[who].n.clone(),f:npcs[who].f.clone()}:null,petShot=who==='dog'||who==='cat';snack={key,who,t:0,next:0,food,baseY:food.position.y,lock,look:who==='girl'?7.32:petShot?(who==='cat'?6.7:6.82):7.12,q:lock?aimSnack(who):null};if(who!=='boy')boy.visible=false;if(zoomBack==null)zoomBack=zt;zoomKind='snack';zt=petShot?(who==='cat'?.05:.046):.125;toast('맛있게 먹고 있어요')}
function endSnack(){if(!snack)return;const s=snack;snack=null;if(s.food&&s.food.parent)s.food.parent.remove(s.food);for(const h of hearts){if(h.parent)h.parent.remove(h);h.material&&h.material.dispose()}hearts.length=0;boy.visible=true;const r=rigOf(s.who);if(r&&r.head&&(s.who==='boy'||s.who==='girl'))r.head.rotation.set(0,0,0);if(r&&r.jaw)r.jaw.rotation.x=0;zoomClear()}
function eatPose(){if(!snack)return;const r=rigOf(snack.who);if(!r||!r.head)return;const sway=Math.sin(tw*1.05)*.2;if(r.arms){toMouth.set(snack.who==='girl'?-.36:-.4,.52,.74).normalize();r.arms[1].quaternion.setFromUnitVectors(handDown,toMouth)}else if(r.jaw)r.jaw.rotation.x=.5+Math.sin(tw*2.2)*.1;r.head.rotation.y=sway;r.head.rotation.z=Math.sin(tw*.7)*.035;if(snack.key==='juice'){const sip=(Math.sin(tw*2.6)+1)*.5;r.head.rotation.x=.08+sip*.12;if(snack.food)snack.food.position.y=snack.baseY+(r.arms?sip*.02:-sip*.015)}else r.head.rotation.x=Math.sin(tw*1.2)*.04}
function spawnHeart(who){const r=rigOf(who);if(!r||!r.body)return;const h=makeHeart(),y={boy:2.05,girl:2.15,dog:1.28,cat:1.08}[who]||1.1,x=(Math.random()-.5)*.35,z=(Math.random()-.5)*.2,sc=who==='dog'||who==='cat'?.16:.26;h.position.set(x,y,z);h.scale.set(sc,sc,1);h.userData={age:0,x,y,z,ph:Math.random()*6.28,drift:(Math.random()-.5)*.22,lift:.1+Math.random()*.08};r.body.add(h);hearts.push(h)}
const popAim=new T.Vector3(),popFace=new T.Vector3(0,-.02,1),popX=new T.Vector3(),popZ=new T.Vector3(),popM=new T.Matrix4(),popQ=new T.Quaternion(),popInv=new T.Quaternion();
function holdPose(){if(ride||lying||snack)return;for(const key of ['pop','fluff']){const who=wearOn[key];if(who!=='boy'&&who!=='girl')continue;const arm=holdArm(who,key);if(!arm)continue;const side=arm.position.x>=0?1:-1;const bob=Math.sin(tw*2.2+(key==='fluff'?1:0))*.04;if(key==='pop'){arm.rotation.set(-1.8+bob,0,side*.2);arm.quaternion.setFromEuler(arm.rotation,false);const pop=wearMesh.get('pop');if(!pop)continue;pop.position.set(0,who==='girl'?-.34:-.36,.04);popAim.set(side*.06,.57,.82).normalize();popX.crossVectors(popAim,popFace);if(popX.lengthSq()<1e-6)popX.set(1,0,0);popX.normalize();popZ.crossVectors(popX,popAim).normalize();popM.makeBasis(popX,popAim,popZ);popQ.setFromRotationMatrix(popM);popInv.copy(arm.quaternion).invert();pop.quaternion.copy(popInv).multiply(popQ)}else{arm.rotation.set(-2.2+bob,0,side*.62)}}}
function spinPop(){const pop=wearMesh.get('pop');if(pop&&pop.userData.spin)pop.userData.spin.rotation.z=tw*4}
function itemTick(dt){if(!boy)return;liePose();holdPose();spinPop();
 if(snack){if(ride){endSnack();return}snack.t+=dt;if(snack.q)world.quaternion.slerp(snack.q,Math.min(1,dt*3.4));if(snack.who==='boy'){const face=Math.atan2(dir.x,dir.z);yaw+=Math.atan2(Math.sin(face-yaw),Math.cos(face-yaw))*Math.min(1,dt*4);boy.rotation.y=yaw}eatPose();if(snack.t>=snack.next&&snack.t<10){snack.next+=1;spawnHeart(snack.who)}if(snack.t>=10)endSnack()}
 for(let i=hearts.length-1;i>=0;i--){const h=hearts[i],u=h.userData;u.age+=dt;const a=u.age;h.position.set(u.x+Math.sin(a*1.15+u.ph)*.16+u.drift*Math.min(a,3),u.y+u.lift*Math.min(a,3)+Math.sin(a*1.8+u.ph)*.05,u.z+Math.cos(a*.9+u.ph)*.1);const fade=a<3?1:Math.max(0,1-(a-3)/.8);h.material.opacity=fade;if(a>=3.8){h.parent&&h.parent.remove(h);h.material.dispose();hearts.splice(i,1)}}
 for(const g of placeById.values()){const p=g.userData.parasol;if(p&&p.userData.tilt){const t=p.userData.tilt;p.rotation.x=t.x+Math.sin(tw*.55)*.02;p.rotation.z=t.z+Math.cos(tw*.4)*.018}if(!g.userData.light)continue;const night=U.uNight.value,flick=.72+.28*Math.sin(tw*8)+.12*Math.sin(tw*21);g.userData.light.intensity=(.2+night*2.6)*flick;g.userData.glow.material.opacity=.12+night*.62;g.userData.flame.scale.y=1.15+.3*Math.sin(tw*12)}}

/* ===== 로딩 (끝나면 자동 입장) ===== */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function showBlock(msg){halted=true;try{if(ac&&ac.suspend)ac.suspend()}catch(e){}const app=document.getElementById('app');if(app)app.hidden=true;const el=document.getElementById('block');if(el){el.hidden=false;el.textContent=msg}}
async function homeGuard(){try{const r=await fetch('/api/home-guard',{cache:'no-store'});if(!r.ok)return false;const j=await r.json();return j.ok===true}catch(e){return false}}
(async()=>{
 if(!(await homeGuard())){showBlock('로딩할 수 없습니다.');return}
 document.getElementById('app').hidden=false;
 setInterval(()=>{if(!halted)homeGuard().then(ok=>{if(!ok&&!halted)showBlock('비정상 접근입니다.')})},20000);
 const steps=[['글꼴과 바다를 준비하는 중…',async()=>{try{await Promise.race([Promise.all([document.fonts.load('800 40px "Noto Sans KR"','게시판상점쇼핑몰문의SHOP'),document.fonts.load('500 16px "Noto Sans KR"','공지사항 NOTICE MAIL'),document.fonts.load('700 16px "Noto Sans KR"','메뉴')]),sleep(3000)])}catch(e){}buildBg()}],
 ['작은 지구를 빚는 중…',buildPlanet],['귀여운 친구를 만드는 중…',buildBoy],['건물과 표지판을 세우는 중…',buildSpots],['나무와 꽃을 심는 중…',buildProps],['친구들을 데려오는 중…',buildNpcs],['바다 친구들을 부르는 중…',buildSea],['파도 소리를 조율하는 중…',()=>sleep(500)]];
 for(let i=0;i<steps.length;i++){$('#lt').textContent=steps[i][0];await sleep(120);await steps[i][1]();$('#bi').style.width=Math.round((i+1)/steps.length*100)+'%';await sleep(300)}
 resize();frame();applyLook();$('#lt').textContent='파도가 밀려와요 🌊';await sleep(700);
 $('#load').classList.add('off');started=true;startAudio();setTimeout(()=>$('#hint').style.opacity=0,10000);
})();
})();