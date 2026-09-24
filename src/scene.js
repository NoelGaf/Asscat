import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {islands} from './game.js';
const palette={grass:0x88ac69,grassLight:0xa4bd79,rock:0xa3997f,trunk:0x897552,leaf:0x659c70,leafLight:0x96b77b,cream:0xffedc7,orange:0xd99854,dark:0x34463f,mint:0x73bdb1};
const materials=new Map();function mat(c){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:1,flatShading:true}));return materials.get(c);}
const ballGeo=new T.IcosahedronGeometry(1,1),boxGeo=new T.BoxGeometry(1,1,1),coneGeo=new T.ConeGeometry(1,1,6);
function shape(parent,geo,color,pos,scale){const m=new T.Mesh(geo,mat(color));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const ball=(p,c,pos,scale)=>shape(p,ballGeo,c,pos,scale),box=(p,c,pos,scale)=>shape(p,boxGeo,c,pos,scale);
export function animal(dog=false,coat=palette.orange){const g=new T.Group(),body=new T.Group();g.add(body);
 ball(body,coat,[0,.65,.05],[.48,.49,.67]);ball(body,palette.cream,[0,.52,-.39],[.33,.31,.2]);
 const head=new T.Group();head.position.set(0,1.13,-.43);body.add(head);ball(head,coat,[0,0,0],[.56,.47,.47]);
 for(const side of [-1,1]){if(dog){const ear=ball(head,0x6b6257,[side*.5,-.07,.03],[.18,.4,.21]);ear.rotation.z=side*.25;}else{const ear=shape(head,coneGeo,coat,[side*.35,.43,.01],[.23,.47,.24]);ear.rotation.z=side*-.14;shape(head,coneGeo,0xde9c88,[side*.35,.45,-.105],[.115,.23,.04]);}
 ball(head,palette.cream,[side*.17,-.18,-.38],[.2,.16,.14]);ball(head,0x2a3935,[side*.23,.05,-.405],[.07,.105,.045]);ball(head,0xfffcdf,[side*.21,.08,-.441],[.023,.025,.015]);}
 ball(head,dog?0x34463f:0x9d6c66,[0,-.12,-.53],[.09,.065,.055]);
 const legs=[];for(const x of [-.28,.28])for(const z of [-.32,.42]){const leg=new T.Group();leg.position.set(x,.45,z);body.add(leg);ball(leg,coat,[0,-.13,0],[.15,.28,.17]);ball(leg,palette.cream,[0,-.34,-.035],[.19,.12,.24]);legs.push(leg);}
 const tail=new T.Group();tail.position.set(0,.72,.57);tail.rotation.x=.45;body.add(tail);ball(tail,coat,[0,.32,0],[.12,.47,.12]);ball(tail,dog?coat:0xb37741,[0,.7,-.06],[.14,.16,.16]);
 box(body,dog?0xad6c58:palette.mint,[0,.91,-.32],[.87,.13,.47]);if(!dog){const scarf=box(body,palette.mint,[.37,.76,.17],[.2,.13,.6]);scarf.rotation.y=-.25;}
 const wings=[];if(!dog)for(const side of [-1,1]){const wing=new T.Group();wing.position.set(side*.35,.95,.03);body.add(wing);for(let i=0;i<4;i++){const feather=ball(wing,0xffedbf,[side*(.25+i*.19),0,.1+i*.13],[.48-i*.035,.075,.16]);feather.rotation.y=-side*.35;}wing.visible=false;wings.push(wing);}
 g.userData={body,head,legs,tail,wings};return g;
}
export function animateAnimal(g,time,speed=0,flying=false){const u=g.userData;if(!u.legs)return;u.body.position.y=speed>.1?Math.sin(time*13)*.035:Math.sin(time*2)*.018;u.legs.forEach((leg,i)=>leg.rotation.x=flying?.6:Math.sin(time*13+(i===0||i===3?0:Math.PI))*Math.min(.55,speed*.09));u.tail.rotation.z=Math.sin(time*3)*.2;u.wings.forEach((w,i)=>{w.visible=flying;w.rotation.z=(i===0?1:-1)*(.25+Math.sin(time*16)*.4);});}
export function makeScene(canvas,game){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new T.Scene();scene.background=new T.Color(0xdde3ce);scene.fog=new T.Fog(0xdde3ce,45,115);
 const camera=new T.PerspectiveCamera(48,1,.1,180);const hemi=new T.HemisphereLight(0xfff7dd,0x6d8e76,2.8);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffe4ae,3.3);sun.position.set(-15,30,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.001;sun.shadow.normalBias=.07;scene.add(sun,sun.target);
 const world=new T.Group();scene.add(world);
 function tree(x,y,z,s=1){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(s);world.add(g);const trunk=box(g,palette.trunk,[0,1.3,0],[.32,2.6,.32]);trunk.rotation.z=.07;for(let i=0;i<3;i++){const branch=box(g,palette.trunk,[i%2?.5:-.4,1.9+i*.3,0],[.2,1.2,.2]);branch.rotation.z=i%2?-.6:.7;}ball(g,palette.leaf,[0,3.15,0],[1.55,1.5,1.25]);ball(g,palette.leafLight,[-.7,3.55,.1],[1.05,.85,1.05]);ball(g,0x7ba675,[.95,2.95,.1],[.9,.85,.95]);}
 islands.forEach((p,i)=>{const g=new T.Group();g.position.set(p.x,p.y,p.z);world.add(g);const rock=shape(g,new T.CylinderGeometry(p.r*.94,p.r*.4,4,9),palette.rock,[0,-2.25,0],[1,1,1]);rock.rotation.y=i*.7;shape(g,new T.CylinderGeometry(p.r,p.r*.95,.65,12),i%2?palette.grassLight:palette.grass,[0,-.32,0],[1,1,1]);
 for(let j=0;j<5;j++){const a=j*2.39+i;const r=p.r*.8;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(j<2)tree(p.x+x,p.y,p.z+z,.65+j*.15);else{ball(g,0x76955d,[x,.23,z],[.7,.4,.65]);for(let k=0;k<3;k++){const flower=shape(g,coneGeo,k%2?0xe6bd6b:0xe7ddac,[x+k*.27,.55,z],[.13,.25,.13]);flower.rotation.z=.2;}}}
 // Pale stepping stones make the intended route readable from above.
 for(let j=0;j<5;j++)ball(g,0xbac29a,[Math.sin(j)*.45,.025,3-j*1.4],[.5,.065,.38]);
 if(i>0){box(g,palette.trunk,[p.r-1.4,1.3,1],[.12,2.6,.12]);const flag=box(g,palette.mint,[p.r-1,2.35,1],[.9,.5,.07]);flag.userData.isFlag=true;}
 });
 // Distant floating gardens, outside the playable path.
 for(let i=0;i<19;i++){const side=i%2?1:-1,x=side*(22+(i%3)*12),z=15-i*9,y=-4-(i%4)*2;const g=new T.Group();g.position.set(x,y,z);world.add(g);shape(g,new T.CylinderGeometry(4+(i%3),1,6,6),0xb0b69b,[0,-3,0],[1,1,1]);shape(g,new T.CylinderGeometry(4+(i%3),4,.3,8),0x9bb88e,[0,0,0],[1,1,1]);if(i%2)tree(x,y,z,.8);}
 // Soft clusters of low-poly clouds sit below the islands.
 const cloudMat=new T.MeshStandardMaterial({color:0xfff3d8,roughness:1,flatShading:true});for(let i=0;i<35;i++){const g=new T.Group();g.position.set(Math.sin(i*9.2)*40,-9+(i%3),18-i*4.5);for(let j=0;j<3;j++){const m=new T.Mesh(ballGeo,cloudMat);m.position.set(j*2.3,Math.sin(j*2),0);m.scale.set(4,1.3,2.3);g.add(m);}world.add(g);}
 // The treehouse is the visible destination.
 const home=new T.Group(),goal=islands[6];home.position.set(goal.x,goal.y,goal.z-3);world.add(home);box(home,0x947a55,[0,1.2,.5],[.8,2.4,.8]);box(home,0xd9bc82,[0,2.4,0],[3.5,2.5,2.5]);const roof=shape(home,new T.ConeGeometry(2.8,1.6,4),0x4b8170,[0,4.25,0],[1,1,1]);roof.rotation.y=Math.PI/4;box(home,0x4a6654,[0,1.9,1.28],[.8,1.5,.1]);for(const x of [-1,1])box(home,0xffe3a0,[x,2.7,1.28],[.55,.55,.1]);box(home,0x829464,[0,.12,2],[3,.2,2.5]);tree(goal.x-3,goal.y,goal.z-4,1.4);
 const gate=new T.Group();gate.position.set(goal.x,goal.y,goal.z-1.5);world.add(gate);for(const x of [-1.8,1.8])box(gate,0x58735e,[x,1.2,0],[.17,2.4,.17]);for(let i=0;i<7;i++){const pennant=shape(gate,coneGeo,i%2?0xe7c482:0x78ad95,[-1.55+i*.51,2.05,0],[.25,.45,.08]);pennant.rotation.z=Math.PI;}
 // Batch static scenery by material to keep mobile draw calls modest.
 world.updateMatrixWorld(true);const batches=new Map();world.traverse(o=>{if(!o.isMesh)return;const list=batches.get(o.material)||[];const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();list.push(geo.applyMatrix4(o.matrixWorld));batches.set(o.material,list);});world.clear();for(const [material,geometries] of batches){const merged=mergeGeometries(geometries);const mesh=new T.Mesh(merged,material);mesh.castShadow=material!==cloudMat;mesh.receiveShadow=true;world.add(mesh);geometries.forEach(g=>g.dispose());}
 const cat=animal();scene.add(cat);const shadow=new T.Mesh(new T.CircleGeometry(.57,24),new T.MeshBasicMaterial({color:0x344c35,transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 const dogs=game.dogs.map(()=>{const a=animal(true,0x8c8374);scene.add(a);return a;});
 const kittens=game.kittens.map((k,i)=>{const a=animal(false,[0xe8d9ad,0x9ba8a0,0xcba17d][i]);a.scale.setScalar(.55);a.position.set(k.x,k.y,k.z);a.rotation.y=.4;scene.add(a);const heart=ball(a,0xdd9a7f,[0,3,0],[.22,.22,.16]);a.userData.marker=heart;return a;});
 const fish=game.pickups.map(f=>{const g=new T.Group();ball(g,0xefca75,[0,0,0],[.3,.17,.11]);const tail=shape(g,coneGeo,0xefca75,[.33,0,0],[.19,.28,.09]);tail.rotation.z=Math.PI/2;ball(g,0x52614c,[-.13,.03,.1],[.022,.022,.012]);g.position.set(f.x,f.y,f.z);scene.add(g);return g;});
 const particles=[];const particleGeo=new T.IcosahedronGeometry(.08,0);function burst(x,y,z,color=0xffd889){for(let i=0;i<12&&particles.length<96;i++){const m=new T.Mesh(particleGeo,mat(color));m.position.set(x,y+.7,z);scene.add(m);particles.push({m,v:new T.Vector3((Math.random()-.5)*4,Math.random()*4,(Math.random()-.5)*4),life:.7});}}
 let quality=true;function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?58:48;camera.updateProjectionMatrix();}resize();
 const target=new T.Vector3(),desired=new T.Vector3();let initialized=false;
 function render(dt,time){const p=game.player;cat.position.set(p.x,p.y,p.z);let da=((p.angle-cat.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;cat.rotation.y+=da*Math.min(1,dt*14);cat.visible=p.inv<=0||Math.sin(time*30)>-.3;animateAnimal(cat,time,Math.hypot(p.vx,p.vz),p.flying);
 dogs.forEach((g,i)=>{const d=game.dogs[i];g.visible=d.alive;g.position.set(d.x,d.y,d.z);g.rotation.y=Math.atan2(-Math.cos(d.phase)*2.7,Math.sin(d.phase)*1.5);animateAnimal(g,time,3);});kittens.forEach((g,i)=>{g.visible=!game.kittens[i].got;animateAnimal(g,time+i);g.userData.marker.position.y=3+Math.sin(time*3+i)*.15;});fish.forEach((g,i)=>{const f=game.pickups[i];g.visible=!f.got;g.position.y=f.y+Math.sin(time*2+i)*.12;g.rotation.y=time*.7+i;});
 let below=null;for(const island of islands)if(Math.hypot(p.x-island.x,p.z-island.z)<island.r&&p.y>=island.y-.1&&(!below||below.y<island.y))below=island;shadow.visible=!!below;if(below){shadow.position.set(p.x,below.y+.04,p.z);shadow.scale.setScalar(Math.max(.5,1-(p.y-below.y)*.05));}
 if(game.mode==='menu'){desired.set(14,11,17);target.set(-1,1,-6);}else{desired.set(p.x+3.5,p.y+9.5,p.z+(innerWidth<innerHeight?13.5:12.5));target.set(p.x,p.y+.8,p.z-3);}
 camera.position.lerp(desired,initialized?1-Math.exp(-5*dt):1);camera.lookAt(target);initialized=true;sun.position.set(p.x-15,p.y+30,p.z+12);sun.target.position.set(p.x,p.y,p.z-6);sun.target.updateMatrixWorld();
 for(let i=particles.length-1;i>=0;i--){const a=particles[i];a.life-=dt;a.v.y-=dt*7;a.m.position.addScaledVector(a.v,dt);a.m.scale.setScalar(Math.max(0,a.life/.7));if(a.life<=0){scene.remove(a.m);particles.splice(i,1);}}
 renderer.render(scene,camera);}
 function setQuality(){quality=!quality;renderer.setPixelRatio(quality?Math.min(devicePixelRatio,1.6):1);renderer.shadowMap.enabled=quality;resize();return quality;}
 return {render,resize,burst,setQuality,renderer};
}
