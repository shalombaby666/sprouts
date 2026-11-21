(function(root){
 'use strict';
 function validate(data, catalog){
  if(!data || data.app!=='sprouts' || data.version!==1 || !Array.isArray(data.words) || data.words.length!==catalog.length) throw Error('Choose a complete Sprouts backup (version 1).');
  var records=new Map();
  data.words.forEach(function(w){
   if(!w || typeof w.id!=='string' || records.has(w.id) || !Number.isInteger(w.box) || w.box<0 || w.box>6 || !Number.isInteger(w.wrongStreak) || w.wrongStreak<0 || w.wrongStreak>1000000) throw Error('The backup contains invalid word progress.');
   if(w.dueAt!=null && (typeof w.dueAt!=='string' || !Number.isFinite(Date.parse(w.dueAt)))) throw Error('The backup contains an invalid review date.');
   if(w.box>0 && !w.dueAt) throw Error('A review date is missing.');
   records.set(w.id,w);
  });
  var words=catalog.map(function(base){
   var w=records.get(base.id);if(!w)throw Error('The backup belongs to a different word collection.');
   return Object.assign({},base,{box:w.box,wrongStreak:w.wrongStreak,dueAt:w.dueAt||null,lastResult:['correct','wrong'].includes(w.lastResult)?w.lastResult:null});
  });
  var m=data.meta;if(!m || !['streak','totalCorrect','totalWrong'].every(function(k){return Number.isSafeInteger(m[k])&&m[k]>=0;}))throw Error('The backup contains invalid statistics.');
  function date(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0,10)===s;}
  if(!Array.isArray(m.activeDays) || m.activeDays.length>50000 || !m.activeDays.every(date) || (m.lastDate!==null&&!date(m.lastDate)))throw Error('The backup contains invalid activity dates.');
  return {words:words,meta:{streak:m.streak,totalCorrect:m.totalCorrect,totalWrong:m.totalWrong,lastDate:m.lastDate,activeDays:Array.from(new Set(m.activeDays)),quizMode:m.quizMode==='type'?'type':'choice'}};
 }
 root.SproutsProgress={validate:validate};
})(typeof window==='undefined'?globalThis:window);
