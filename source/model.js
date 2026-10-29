import * as THREE from 'three';
export function createModel(){
const model=new THREE.Group();model.name="GMF 压力诱导发泡线 V0.2";
const palette={steel:0xb5c4c8,dark:0x34474e,green:0x2d9980,pipe:0x80baa8,red:0xbf604d,blue:0x376879,black:0x1c292e,light:0xe0e6e1};
const parts=[],systems=[['釜体与操作平台','01'],['物料收集系统','02'],['物料输送系统','03'],['颗粒后处理','04'],['筛分出料系统','05']];
function part(id,name,sys,fn,anchor,offset,evidence='宣传页第3页 · 功能部件示意') {const g=new THREE.Group();g.name=name;g.userData={id,name,system:systems[sys][0],function:fn,evidence,geometry:'宣传资料重建示意，非尺寸图'};model.add(g);const p={id,name,sys,fn,g,base:new THREE.Vector3(),anchor:new THREE.Vector3(...anchor),offset:new THREE.Vector3(...offset),evidence};parts.push(p);return p;}
function mesh(p,geo,pos,color='steel',rot=null){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:palette[color]||color,metalness:color==='steel'?.78:.4,roughness:color==='steel'?.28:.5}));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;m.userData.part=p.id;p.g.add(m);return m;}
function box(p,pos,size,c){return mesh(p,new THREE.BoxGeometry(...size),pos,c);}
function cyl(p,pos,r,h,c,rt=null){return mesh(p,new THREE.CylinderGeometry(r,r,h,40),pos,c,rt);}
function ball(p,pos,r,c,scale=[1,1,1]){const m=mesh(p,new THREE.SphereGeometry(r,32,20),pos,c);m.scale.set(...scale);return m;}
function routedCurve(pts,radius=.18){const v=pts.map(p=>new THREE.Vector3(...p)),curve=new THREE.CurvePath();let cursor=v[0];for(let i=1;i<v.length-1;i++){const before=v[i].clone().sub(v[i-1]),after=v[i+1].clone().sub(v[i]),r=Math.min(radius,before.length()*.25,after.length()*.25);const a=v[i].clone().addScaledVector(before.normalize(),-r),b=v[i].clone().addScaledVector(after.normalize(),r);curve.add(new THREE.LineCurve3(cursor,a));curve.add(new THREE.QuadraticBezierCurve3(a,v[i],b));cursor=b;}curve.add(new THREE.LineCurve3(cursor,v.at(-1)));return curve;}
function tube(p,pts,r=.06,c='pipe'){const m=mesh(p,new THREE.TubeGeometry(routedCurve(pts),Math.max(48,pts.length*20),r,12,false),[0,0,0],c);m.userData.route=pts;return m;}
function hopper(p,upper,lower,top,bottom,c='steel'){const [x,y,z]=upper,[bx,by,bz]=lower,[w,d]=top,[bw,bd]=bottom;const a=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([xx,zz])=>[x+xx,y,z+zz]),b=[[-bw/2,-bd/2],[bw/2,-bd/2],[bw/2,bd/2],[-bw/2,bd/2]].map(([xx,zz])=>[bx+xx,by,bz+zz]);const vertices=[];for(let i=0;i<4;i++){const j=(i+1)%4;for(const v of [a[i],b[i],b[j],a[i],b[j],a[j]])vertices.push(...v);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const m=mesh(p,geo,[0,0,0],c);m.material.side=THREE.DoubleSide;m.userData.openHopper={upper,lower,top,bottom};return m;}
function bar(p,a,b,r=.04,c='steel'){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),m=cyl(p,A.clone().add(B).multiplyScalar(.5).toArray(),r,A.distanceTo(B),c);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return m;}
const frame=part('platform','操作平台与支架',0,'支承高压釜，提供装料、巡检和维护的作业空间。',[-4,3,0],[-1,0,-1.8]);
// Assembled platform: openings around each vessel and longer legs keep the raised kettles grounded.
for(const z of [-1.3,1.3])box(frame,[-4,4.45,z],[5.3,.23,.8],'dark');
for(const [x,w] of [[-6.295,.71],[-4.025,.47],[-1.73,.76]])box(frame,[x,4.45,0],[w,.23,1.8],'dark');
for(const x of [-6.2,-1.8])for(const z of [-1.35,1.35]){box(frame,[x,2.225,z],[.15,4.45,.15],'dark');box(frame,[x,.08,z],[.45,.16,.45],'steel');}
for(const z of [-1.6,1.6]){for(let x=-6.4;x<-1.5;x+=.8)bar(frame,[x,4.6,z],[x,5.45,z],.024);bar(frame,[-6.5,5.45,z],[-1.5,5.45,z],.035);bar(frame,[-6.5,5,z],[-1.5,5,z],.022);}
frame.anchor.set(-4,4.45,0);
const stair=part('stairs','检修楼梯',0,'连接地面与抬高后的操作平台，提供人员通行。',[-8,2.2,1.7],[-2,0,2]);for(let i=0;i<18;i++){const t=i/17;box(stair,[-10.2+3.75*t,.13+4.24*t,1.7],[.3,.07,1.1],'dark');}for(const z of [1.15,2.25]){bar(stair,[-10.2,.13,z],[-6.45,4.37,z],.055,'dark');bar(stair,[-10.2,1.13,z],[-6.45,5.37,z],.025);}
const shells=[];
for(let k=0;k<2;k++) {const x=-5.1+k*2.15,prefix=k?'b':'a';
const body=part(prefix+'-body','高压釜 '+(k?'B':'A')+' · 承压筒体',0,'容纳物料及发泡介质，为物料搅拌和升温升压过程提供密闭承压空间。',[x,5.5,0],[k?1.5:-1.5,1,0],'宣传页第3页 · 高压釜；外形按图片示意');
const m=cyl(body,[x,5.25,0],.68,3.25,'steel');shells.push(m);const b=ball(body,[x,3.63,0],.68,'steel',[1,.45,1]);shells.push(b);cyl(body,[x,3.3,0],.13,.5,'steel');
const jacket=part(prefix+'-jacket','高压釜 '+(k?'B':'A')+' · 温控夹套示意',0,'表达釜体与外部温控回路之间的换热关系；实际加热方式及结构需按图纸确认。',[x,5.25,.75],[k?2.7:-2.7,.5,.8],'结构推定 · 待图纸核对');
const jacketMesh=mesh(jacket,new THREE.CylinderGeometry(.76,.76,2.5,48,1,true),[x,5.25,0],'green');shells.push(jacketMesh);for(const y of [4,6.5])cyl(jacket,[x,y,0],.8,.075,'steel');
const lid=part(prefix+'-lid','高压釜 '+(k?'B':'A')+' · 釜盖与连接示意',0,'关闭装料开口，形成密闭腔体。实际锁紧形式和密封结构需由装配图核对。',[x,7,0],[k?.7:-.7,2.8,0],'高压釜外观参考 · 连接细节待核对');
ball(lid,[x,6.94,0],.7,'steel',[1,.4,1]);cyl(lid,[x,6.85,0],.86,.14,'steel');for(let a=0;a<12;a++){let t=a/12*Math.PI*2;cyl(lid,[x+Math.cos(t)*.77,6.98,Math.sin(t)*.77],.055,.14,'dark');}
const seal=part(prefix+'-seal','高压釜 '+(k?'B':'A')+' · 密封件示意',0,'表达釜盖连接处的密封功能。密封材料、截面和数量尚无资料依据。',[x,6.83,0],[k?.7:-.7,1.8,1.4],'结构推定 · 待图纸核对');mesh(seal,new THREE.TorusGeometry(.69,.027,12,64),[x,6.81,0],'red',[Math.PI/2,0,0]);
const mix=part(prefix+'-mix','高压釜 '+(k?'B':'A')+' · 搅拌组件示意',0,'使釜内物料混合，帮助物料均匀接触介质。宣传页包含“物料搅拌”步骤，叶轮形式待核对。',[x,5.1,0],[k?.7:-.7,4.5,0],'宣传页第3页 · 物料搅拌；内部几何推定');cyl(mix,[x,7.55,0],.24,.65,'dark');cyl(mix,[x,5.65,0],.055,3.3,'steel');for(let y of [4.4,5.3,6.1]){box(mix,[x,y,0],[1.05,.07,.18],'steel');box(mix,[x,y,0],[.18,.07,1.05],'steel');}
const gauge=part(prefix+'-gauge','高压釜 '+(k?'B':'A')+' · 压温仪表示意',0,'表达温度、压力的监测功能；传感器数量、安装位置与联锁配置待确认。',[x,6,1],[k?2:-2,2,2],'功能推定 · 待仪表清单核对');tube(gauge,[[x,6.2,0],[x,6.2,.75],[x,6.8,.9]],.045);cyl(gauge,[x,6.8,.96],.19,.1,'light',[Math.PI/2,0,0]);bar(gauge,[x,6.8,1.025],[x+.1,6.9,1.025],.012,'red');
}
// Vessel groups use an explicit assembled offset, distinct from explosion offsets.
for(const p of parts.filter(p=>/^[ab]-/.test(p.id))){p.base.y=1;p.g.position.copy(p.base);p.g.userData.assembledOffset=p.base.toArray();}
const gas=part('gas','CO₂介质管路示意',0,'单独标示发泡介质供给，区别于釜顶原料上料管道。实际阀组及接口仍需图纸核对。',[-3.8,5.5,-1.2],[0,0,-3],'宣传页第3页 · 通入气体；接口位置示意');
tube(gas,[[-7,.6,-1.8],[-7,5.2,-1.8],[-5.1,5.2,-1.8],[-5.1,5.5,-.72]],.055,'blue');tube(gas,[[-5.1,5.2,-1.8],[-2.95,5.2,-1.8],[-2.95,5.5,-.72]],.055,'blue');
const feed=part('top-feed','釜顶上料管道',0,'原料由上方分配管送至两台高压釜的顶部入口，再从上往下进入釜内。',[-4.2,9.65,.35],[0,2.6,1.2],'用户确认 · 从釜顶接入、向下送料；弯管形状为示意');
const feedSource=[-7.2,10.1,.35],feedJunction=[-7.2,9.65,.35];
const lidEntryY=7.94+.28*Math.sqrt(1-(.35/.7)**2-(.35/.7)**2);
const feedPorts=[[-4.75,lidEntryY,.35],[-2.6,lidEntryY,.35]];
tube(feed,[feedSource,feedJunction,...[feedPorts[0]].map(p=>[p[0],9.65,p[2]]),feedPorts[0]],.105,'green');
tube(feed,[[-4.75,9.65,.35],[-2.6,9.65,.35],feedPorts[1]],.105,'green');
for(const [x,y,z] of feedPorts){cyl(feed,[x,y+.035,z],.145,.09,'steel');}
const release=part('release','釜底至收集罐顶部出料管道',0,'两台高压釜分别由底部出料，通过两条独立管道接入物料收集罐的顶部。',[-1.5,3.9,.3],[0,0,2.5],'用户确认 · 两釜底部分别接收集罐顶部；连接走向示意');
const collectorRoof=3.33+.25*Math.sqrt(1-.3*.3-.3*.3);
const releaseRoutes=[
 [[-5.1,4.05,0],[-5.1,3.95,0],[-5.1,3.95,.3],[.2,3.95,.3],[.2,collectorRoof,.3]],
 [[-2.95,4.05,0],[-2.95,3.8,0],[-2.95,3.8,-.3],[.8,3.8,-.3],[.8,collectorRoof,-.3]]
];
for(const route of releaseRoutes){tube(release,route,.095,'steel');const [x,y,z]=route.at(-1);cyl(release,[x,y+.045,z],.135,.13,'steel');}
const collect=part('collector','物料收集罐',1,'接收发泡后的颗粒，衔接后续输送和处理。',[.5,2.6,0],[0,.5,3],'宣传页第3页 · 物料收集罐');cyl(collect,[.5,2.7,0],1,1.25,'steel');mesh(collect,new THREE.ConeGeometry(1,1.3,48),[.5,1.45,0],'steel',[Math.PI,0,0]);ball(collect,[.5,3.33,0],1,'steel',[1,.25,1]);
const legs=part('collector-support','收集罐支架',1,'支承收集罐，保持下方出料空间。',[.5,.6,0],[0,0,3.4],'图片参考 · 几何示意');for(const x of [-.3,1.3])for(const z of [-.7,.7])bar(legs,[x,.08,z],[x,2.2,z],.045,'dark');
const outlet=part('collector-outlet','收集罐底部出料口',1,'颗粒从收集罐锥底向下落料，由正下方的输送机接料斗承接。',[.5,.65,0],[0,-.2,4],'用户确认 · 罐底落料、输送装置在正下方承接');cyl(outlet,[.5,.7,0],.16,.4,'dark');box(outlet,[.5,.47,0],[.5,.13,.42],'steel');
const conveyor=part('conveyor','倾斜物料输送装置',2,'水平接料段位于收集罐底部正下方，接住下落颗粒，再经倾斜输送段送入后处理装置的顶部进料口。',[2.8,1.4,0],[1.5,0,3],'用户确认 · 从收集罐最下端承接物料');
const catchUpper=[.5,.37,0],catchLower=[.5,.24,0];hopper(conveyor,catchUpper,catchLower,[.75,.85],[.65,.75]);
box(conveyor,[.525,.18,0],[1.35,.10,.85],'dark');
const ca=[1.2,.18,0],cb=[4.9,2.99,0],length=Math.hypot(cb[0]-ca[0],cb[1]-ca[1]),slope=Math.atan2(cb[1]-ca[1],cb[0]-ca[0]);
for(const z of [-.45,.45]){bar(conveyor,[-.15,.18,z],[1.2,.18,z],.06,'steel');bar(conveyor,[ca[0],ca[1],z],[cb[0],cb[1],z],.06,'steel');}
const belt=box(conveyor,[(ca[0]+cb[0])/2,(ca[1]+cb[1])/2,0],[length,.10,.85],'dark');belt.rotation.z=slope;
for(let i=0;i<18;i++){const t=i/17,b=box(conveyor,[ca[0]+(cb[0]-ca[0])*t,ca[1]+(cb[1]-ca[1])*t+.065,0],[.05,.09,.82],'green');b.rotation.z=slope;}
for(const x of [1.25,4.5]){const y=ca[1]+(x-ca[0])*Math.tan(slope);for(const z of [-.35,.35])bar(conveyor,[x,.04,z],[x,y-.05,z],.055,'dark');}
hopper(conveyor,[4.95,2.98,0],[5.08,2.79,0],[.7,.85],[.5,.6]);
const motor=part('conveyor-motor','输送机头部驱动滚筒',2,'安装于输送机头部，为输送带提供驱动。此件为输送驱动，后处理风机另安装于后处理装置顶部。',[4.85,2.83,.55],[1.5,0,4.1],'输送驱动形式示意 · 与后处理顶部风机区分');cyl(motor,[4.85,2.85,0],.14,1,'steel',[Math.PI/2,0,0]);box(motor,[4.85,2.83,.62],[.28,.28,.27],'dark');
const post=part('post','颗粒后处理装置',3,'对发泡颗粒进行后处理，衔接熟化稳定及干燥等后续环节；具体功能配置需确认。',[6,1.7,0],[3,0,0],'宣传页第3页 · 后处理装置');box(post,[6,1.65,0],[2.7,2,2],'steel');box(post,[6,2.73,0],[2.9,.15,2.15],'dark');for(const x of [4.85,7.15])for(const z of [-.8,.8])bar(post,[x,0,z],[x,.7,z],.055,'dark');for(const x of [5.3,6.6])cyl(post,[x,1.65,1.03],.33,.06,'dark',[Math.PI/2,0,0]);
const duct=part('post-duct','顶部风机连接风道',3,'连接后处理装置顶部的风机与机体，表达后处理风路。具体回风方式仍需图纸核对。',[5.8,3.3,.2],[3,2,0],'用户确认风机置于后处理装置上方；风道形式示意');tube(duct,[[6.2,3.28,.2],[5.7,3.28,.2],[5.7,2.78,.2]],.14,'steel');
const blower=part('blower','后处理装置顶部风机',3,'安装于颗粒后处理装置上方，为后处理风路提供气流。',[6.6,3.3,.25],[3,2.3,-1],'用户确认 · 风机安装在颗粒后处理装置上');
box(blower,[6.6,2.85,.2],[1,.09,.85],'dark');cyl(blower,[6.6,3.28,.2],.4,.5,'blue',[Math.PI/2,0,0]);cyl(blower,[6.6,3.28,.46],.23,.025,'dark',[Math.PI/2,0,0]);mesh(blower,new THREE.TorusGeometry(.23,.024,8,32),[6.6,3.28,.48],'steel');cyl(blower,[6.6,3.28,-.24],.18,.35,'dark',[Math.PI/2,0,0]);
const screen=part('screen','筛分装置',4,'按颗粒尺寸进行筛选，衔接成品收集与包装。',[9,1.2,0],[4.4,0,1],'宣传页第3页 · 筛分装置');cyl(screen,[9,1.2,0],.85,.55,'steel');for(const x of [8.4,9.6])for(const z of [-.5,.5])bar(screen,[x,.1,z],[x,.95,z],.05,'dark');
const transferHopper=part('screen-hopper','后处理至筛分上方落料斗',4,'承接后处理装置侧上方出料，通过开放式料斗向下落入筛分装置上方，替代原来的连接管道。',[8.25,2.1,0],[4.1,1.7,1],'用户确认 · 使用料斗连接，出口位于筛分装置上方');
hopper(transferHopper,[8.1,2.3,0],[9,1.62,0],[1.8,1],[.5,.5]);hopper(transferHopper,[9,1.62,0],[9,1.51,0],[.5,.5],[.5,.5]);
for(const z of [-.5,.5])bar(transferHopper,[7.2,2.3,z],[9,2.3,z],.025,'steel');
const sieve=part('sieve','筛网示意',4,'让符合尺寸条件的颗粒通过筛孔；孔径和层数需按筛分要求确认。',[9,1.49,0],[4.4,2.1,1],'结构推定 · 待图纸核对');mesh(sieve,new THREE.TorusGeometry(.8,.045,8,64),[9,1.5,0],'dark',[Math.PI/2,0,0]);for(let i=-6;i<=6;i++){const a=i*.11,l=Math.sqrt(.75*.75-a*a);bar(sieve,[9+a,1.5,-l],[9+a,1.5,l],.008);bar(sieve,[9-l,1.5,a],[9+l,1.5,a],.008);}
const pack=part('pack','出料与收集示意',4,'收集筛分后的颗粒，进入后续打包环节；包装设备不在本版模型范围内。',[10.6,.7,0],[5.4,0,1],'宣传页第3页 · 干燥、筛选打包；外形示意');tube(pack,[[9.7,1.25,0],[10.6,1.1,0],[10.6,.6,0]],.14);box(pack,[10.6,.3,0],[.9,.55,.9],'green');

const flowRoutes=releaseRoutes.map((route,k)=>routedCurve([
 feedSource,feedJunction,[feedPorts[k][0],9.65,.35],feedPorts[k],
 [k?-2.95:-5.1,7.8,0],...route,
 [.5,3,0],[.5,.82,0],[.5,.405,0],[.5,.30,0],[.5,.24,0],[1.2,.24,0],
 [4.9,3.03,0],[5.08,2.79,0],[6,2.1,0],[7.2,2.3,0],[8.1,2.2,0],[9,1.62,0],[9,1.51,0],[9,1.25,0],[10.6,1.1,0],[10.6,.6,0]
],.10));
const connections={revision:'0.2',basis:'用户逐项确认的五处连接修正；尺寸与内部细节仍为示意',feedSource,feedPorts,releaseRoutes,collectorRoof,collectorOutlet:[.5,.405,0],conveyorCatch:{upper:catchUpper,lower:catchLower,belt:[.5,.18,0]},blower:{baseBottom:2.805,postRoof:2.805,center:[6.6,3.28,.2]},screenTransfer:{type:'open-hopper',upper:[8.1,2.3,0],outlet:[9,1.51,0],screenTop:1.5},vesselAssembledLift:1};
model.userData={revision:'0.2',connections};
return {model,parts,systems,shells,flowRoutes,connections};
}
