export const STEP=1/120;
import {levels,contains} from './levels.js';
export {levels};
export const islands=levels[0].surfaces;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const approach=(v,t,s)=>v<t?Math.min(t,v+s):Math.max(t,v-s);
export class Game {
 constructor(){this.levelIndex=0;this.reset();}
 get level(){return levels[this.levelIndex];}
 get surfaces(){return this.level.surfaces;}
 reset(levelIndex=this.levelIndex){this.levelIndex=Math.max(0,Math.min(levels.length-1,levelIndex));const islands=this.surfaces;this.goalHint=0;this.mode='menu';this.time=0;this.hearts=3;this.fish=0;this.rescued=0;this.checkpoint=0;this.events=[];this.player={x:0,y:0,z:3,vx:0,vy:0,vz:0,grounded:true,coyote:.1,buffer:0,flight:3,spent:false,flying:false,inv:0,angle:Math.PI};this.kittens=[1,3,5].map((n,i)=>({island:n,x:islands[n].x+(i===2?1:-1)*Math.min(3,islands[n].r-1),z:islands[n].z-1,name:['Miso','Mochi','Bean'][i],y:islands[n].y,got:false}));this.dogs=[1,2,3,4,5,6].map((n,i)=>({island:n,x:islands[n].x+2,z:islands[n].z+1,y:islands[n].y,phase:i*2,alive:true}));this.pickups=[];islands.forEach((p,i)=>{for(let j=0;j<5;j++)this.pickups.push({x:p.x+Math.sin(j*.8)*2,z:p.z+3-j*1.3,y:p.y+.9,got:false});if(i<6){const q=islands[i+1];for(let j=1;j<4;j++){const t=j/4;this.pickups.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t,y:p.y+(q.y-p.y)*t+2.2,got:false});}}});}
 start(levelIndex=this.levelIndex){this.reset(levelIndex);this.mode='playing';}
 emit(type,data={}){this.events.push({type,...data});}
 jump(){if(this.mode!=='playing')return;const p=this.player;if(p.grounded||p.coyote>0){p.vy=9;p.grounded=false;p.coyote=0;this.emit('jump');}else if(!p.spent){p.flying=true;p.spent=true;p.flight=3;p.buffer=0;this.emit('fly');}else{p.buffer=.12;}}
 respawn(){const islands=this.surfaces;const p=this.player,c=islands[this.checkpoint];Object.assign(p,{x:c.x,y:c.y,z:c.z+2,vx:0,vy:0,vz:0,grounded:true,coyote:.1,buffer:0,flight:3,spent:false,flying:false,inv:2});}
 hurt(fall=false){const p=this.player;if(p.inv>0&&!fall)return;this.hearts--;this.emit('hurt');if(this.hearts<=0){this.mode='lost';return;}this.respawn();}
 retry(){this.hearts=3;this.respawn();this.mode='playing';}
 step(dt,input={x:0,z:0,rise:false}){if(this.mode!=='playing')return;const islands=this.surfaces;this.time+=dt;const p=this.player;const oldY=p.y;p.inv=Math.max(0,p.inv-dt);p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.grounded?.1:Math.max(0,p.coyote-dt);let ix=input.x||0,iz=input.z||0;const length=Math.hypot(ix,iz);if(length>1){ix/=length;iz/=length;}const speed=p.flying?8:7;
 p.vx=approach(p.vx,ix*speed,dt*(p.grounded?38:20));p.vz=approach(p.vz,iz*speed,dt*(p.grounded?38:20));
 if(length>.05)p.angle=Math.atan2(-ix,-iz)+Math.PI;
 if(p.flying){p.flight=Math.max(0,p.flight-dt);p.vy=approach(p.vy,input.rise?2.6:-1.5,dt*18);if(p.flight<1e-8){p.flight=0;p.flying=false;this.emit('empty');}}
 else p.vy=Math.max(-24,p.vy-23*dt);
 const oldX=p.x,oldZ=p.z;p.x+=(p.vx+(!p.grounded?(this.level.wind||0):0))*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.grounded=false;
 // One-way platform tops: land only when crossing a top while descending.
 if(p.vy<=0){for(let i=0;i<islands.length;i++){const s=islands[i];if(contains(s,p.x,p.z,.25)&&oldY>=s.y-.03&&p.y<=s.y){p.y=s.y;p.vy=0;p.grounded=true;p.flying=false;p.spent=false;p.flight=3;if(i>this.checkpoint){this.checkpoint=i;this.hearts=Math.min(3,this.hearts+1);this.emit('checkpoint',{name:s.name});}if(p.buffer>0){p.buffer=0;this.jump();}break;}}}
 // Crates are solid on their sides and tops, unlike one-way route surfaces.
 for(const o of this.level.obstacles){const inside=Math.abs(p.x-o.x)<o.w/2+.38&&Math.abs(p.z-o.z)<o.d/2+.38;if(!inside)continue;const top=o.y+o.h;if(p.vy<=0&&oldY>=top-.02&&p.y<=top){p.y=top;p.vy=0;p.grounded=true;p.flying=false;p.spent=false;p.flight=3;}else if(p.y<top-.02&&p.y+1.5>o.y){if(Math.abs(oldX-o.x)>=o.w/2+.37){p.x=oldX;p.vx=0;}else{p.z=oldZ;p.vz=0;}}}
 for(const spring of this.level.springs){if(p.grounded&&Math.hypot(p.x-spring.x,p.z-spring.z)<.9){p.vy=14;p.grounded=false;p.coyote=0;this.emit('spring');}}
 if(p.y<-16){this.hurt(true);return;}
 for(const d of this.dogs){if(!d.alive)continue;d.phase+=dt*.75;const s=islands[d.island];d.x=s.x+Math.sin(d.phase)*Math.min(2.7,s.r-1);d.z=s.z+Math.cos(d.phase)*1.5;
 if(Math.hypot(p.x-d.x,p.z-d.z)<1.05&&p.y<d.y+1.15&&p.y+1.3>d.y){if(p.vy<0&&oldY>d.y+.8){d.alive=false;p.vy=7;p.grounded=false;this.emit('bonk',{x:d.x,y:d.y,z:d.z});}else this.hurt();if(this.mode!=='playing')return;}}
 for(const f of this.pickups)if(!f.got&&Math.hypot(p.x-f.x,p.y+.7-f.y,p.z-f.z)<1.1){f.got=true;this.fish++;this.emit('fish',{...f});}
 for(const k of this.kittens)if(!k.got&&Math.hypot(p.x-k.x,p.y-k.y,p.z-k.z)<1.5){k.got=true;this.rescued++;this.emit('kitten',{name:k.name,x:k.x,y:k.y,z:k.z});}
 const goal=islands[6];if(Math.hypot(p.x-goal.x,p.z-(goal.z-2))<2&&Math.abs(p.y-goal.y)<1){if(this.rescued===3){this.mode='won';this.emit('win');}else if(!this.goalHint||this.time-this.goalHint>5){this.goalHint=this.time;this.emit('missing');}}
 }
}
