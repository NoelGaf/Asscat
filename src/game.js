export const STEP=1/120;
export const islands=[
 {x:0,z:0,y:0,r:8,name:'Whisker Meadow'},
 {x:-3,z:-16,y:1,r:6,name:'Clover Crossing'},
 {x:4,z:-32,y:2,r:6.5,name:'Cloudstep Canyon'},
 {x:-3,z:-49,y:2.5,r:6.5,name:'The Wind Gardens'},
 {x:3,z:-66,y:3,r:6,name:'Dogwatch Heights'},
 {x:-2,z:-82,y:4,r:6.5,name:'Sunflower Reach'},
 {x:2,z:-99,y:4,r:8,name:'Cat Haven'}
];
export const kittenDefs=[{island:1,x:-6,z:-17,name:'Miso'},{island:3,x:-6,z:-50,name:'Mochi'},{island:5,x:1,z:-83,name:'Bean'}];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const approach=(v,t,s)=>v<t?Math.min(t,v+s):Math.max(t,v-s);
export class Game {
 constructor(){this.reset();}
 reset(){this.mode='menu';this.time=0;this.hearts=3;this.fish=0;this.rescued=0;this.checkpoint=0;this.events=[];this.player={x:0,y:0,z:3,vx:0,vy:0,vz:0,grounded:true,coyote:.1,buffer:0,flight:3,spent:false,flying:false,inv:0,angle:0};this.kittens=kittenDefs.map(k=>({...k,got:false,y:islands[k.island].y}));this.dogs=[1,2,3,4,5,6].map((n,i)=>({island:n,x:islands[n].x+2,z:islands[n].z+1,y:islands[n].y,phase:i*2,alive:true}));this.pickups=[];islands.forEach((p,i)=>{for(let j=0;j<5;j++)this.pickups.push({x:p.x+Math.sin(j*.8)*2,z:p.z+3-j*1.3,y:p.y+.9,got:false});if(i<6){const q=islands[i+1];for(let j=1;j<4;j++){const t=j/4;this.pickups.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t,y:p.y+(q.y-p.y)*t+2.2,got:false});}}});}
 start(){this.reset();this.mode='playing';}
 emit(type,data={}){this.events.push({type,...data});}
 jump(){if(this.mode!=='playing')return;const p=this.player;if(p.grounded||p.coyote>0){p.vy=9;p.grounded=false;p.coyote=0;this.emit('jump');}else if(!p.spent){p.flying=true;p.spent=true;p.flight=3;p.buffer=0;this.emit('fly');}else{p.buffer=.12;}}
 respawn(){const p=this.player,c=islands[this.checkpoint];Object.assign(p,{x:c.x,y:c.y,z:c.z+2,vx:0,vy:0,vz:0,grounded:true,coyote:.1,buffer:0,flight:3,spent:false,flying:false,inv:2});}
 hurt(fall=false){const p=this.player;if(p.inv>0&&!fall)return;this.hearts--;this.emit('hurt');if(this.hearts<=0){this.mode='lost';return;}this.respawn();}
 retry(){this.hearts=3;this.respawn();this.mode='playing';}
 step(dt,input={x:0,z:0,rise:false}){if(this.mode!=='playing')return;this.time+=dt;const p=this.player;const oldY=p.y;p.inv=Math.max(0,p.inv-dt);p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.grounded?.1:Math.max(0,p.coyote-dt);let ix=input.x||0,iz=input.z||0;const length=Math.hypot(ix,iz);if(length>1){ix/=length;iz/=length;}const speed=p.flying?8:7;
 p.vx=approach(p.vx,ix*speed,dt*(p.grounded?38:20));p.vz=approach(p.vz,iz*speed,dt*(p.grounded?38:20));
 if(length>.05)p.angle=Math.atan2(-ix,-iz);
 if(p.flying){p.flight=Math.max(0,p.flight-dt);p.vy=approach(p.vy,input.rise?2.6:-1.5,dt*18);if(p.flight<1e-8){p.flight=0;p.flying=false;this.emit('empty');}}
 else p.vy=Math.max(-24,p.vy-23*dt);
 p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.grounded=false;
 // One-way platform tops: land only when crossing a top while descending.
 if(p.vy<=0){for(let i=0;i<islands.length;i++){const s=islands[i];if(Math.hypot(p.x-s.x,p.z-s.z)<s.r-.25&&oldY>=s.y-.03&&p.y<=s.y){p.y=s.y;p.vy=0;p.grounded=true;p.flying=false;p.spent=false;p.flight=3;if(i>this.checkpoint){this.checkpoint=i;this.hearts=Math.min(3,this.hearts+1);this.emit('checkpoint',{name:s.name});}if(p.buffer>0){p.buffer=0;this.jump();}break;}}}
 if(p.y<-16){this.hurt(true);return;}
 for(const d of this.dogs){if(!d.alive)continue;d.phase+=dt*.75;const s=islands[d.island];d.x=s.x+Math.sin(d.phase)*2.7;d.z=s.z+Math.cos(d.phase)*1.5;
 if(Math.hypot(p.x-d.x,p.z-d.z)<1.05&&p.y<d.y+1.15&&p.y+1.3>d.y){if(p.vy<0&&oldY>d.y+.8){d.alive=false;p.vy=7;p.grounded=false;this.emit('bonk',{x:d.x,y:d.y,z:d.z});}else this.hurt();if(this.mode!=='playing')return;}}
 for(const f of this.pickups)if(!f.got&&Math.hypot(p.x-f.x,p.y+.7-f.y,p.z-f.z)<1.1){f.got=true;this.fish++;this.emit('fish',{...f});}
 for(const k of this.kittens)if(!k.got&&Math.hypot(p.x-k.x,p.y-k.y,p.z-k.z)<1.5){k.got=true;this.rescued++;this.emit('kitten',{name:k.name,x:k.x,y:k.y,z:k.z});}
 const goal=islands[6];if(Math.hypot(p.x-goal.x,p.z-(goal.z-2))<2&&Math.abs(p.y-goal.y)<1){if(this.rescued===3){this.mode='won';this.emit('win');}else if(!this.goalHint||this.time-this.goalHint>5){this.goalHint=this.time;this.emit('missing');}}
 }
}
