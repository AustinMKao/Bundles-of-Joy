"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Pin, Heart, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const colors = {yellow:'#fff3a3',pink:'#ffc8dd',green:'#d3edb3',blue:'#c4e5fa',purple:'#ded0f8',orange:'#ffdab1'};
type Color=keyof typeof colors;
type Note={id:number;message:string;color:Color;createdAt:string};
const samples=[
 {id:'welcome1',message:'A little good goes a long way. Leave some here for the next person.',color:'yellow' as Color},
 {id:'welcome2',message:'You don’t have to have it all figured out to take the next small step.',color:'blue' as Color},
 {id:'welcome3',message:'Today’s tiny joy: a warm cup of tea and five minutes to myself.',color:'pink' as Color},
 {id:'welcome4',message:'Someone out there is glad you exist. Let this be your reminder.',color:'green' as Color},
 {id:'welcome5',message:'A good day doesn’t have to be a perfect day.',color:'purple' as Color},
 {id:'welcome6',message:'What made you smile today? Pin a little piece of it to the wall.',color:'orange' as Color},
];
export default function Home(){
 const [notes,setNotes]=useState<Note[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[hasMore,setHasMore]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const requestId=useRef<string>('');
 async function load(older=false){
 try{setLoadError(''); const response=await fetch('/api/messages'+(older&&notes.length?'?before='+notes[notes.length-1].id:''));const result=await response.json() as {notes:Note[];hasMore:boolean;error?:string};if(!response.ok)throw new Error(result.error);setNotes(current=>older?[...current,...result.notes]:result.notes);setHasMore(result.hasMore); }catch(e){setLoadError(e instanceof Error?e.message:'Unable to load messages.');}finally{setLoading(false);}
 }
 async function post(input:{message:string;color:Color}){
 if(!input||typeof input.message!=='string'||!input.message.trim()||input.message.trim().length>500||!Object.keys(colors).includes(input.color))throw new Error('Write 1–500 characters and choose a note color.');
 requestId.current ||= crypto.randomUUID();
 const response=await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,requestId:requestId.current})});const result=await response.json() as {note:Note;error?:string};if(!response.ok)throw new Error(result.error);setNotes(current=>[result.note,...current.filter(n=>n.id!==result.note.id)]);requestId.current='';setNotice('Your little bundle of joy is on the wall.');return result.note;
 }
 useEffect(()=>{void load();},[]);
 useEffect(()=>{
 const context=(document as Document & {modelContext?:{registerTool:Function}}).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();
 try{Promise.resolve(context.registerTool({name:'post_encouraging_message',title:'Post a message to the wall',description:'Publish a good moment or encouraging message to the shared wall, and update the visible notes.',inputSchema:{type:'object',properties:{message:{type:'string',minLength:1,maxLength:500},color:{type:'string',enum:Object.keys(colors)}},required:['message','color'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async(input:{message:string;color:Color})=>{const note=await post(input);return {id:note.id,status:'posted'};}},{signal:lifecycle.signal})).catch(console.error);}catch(e){console.error(e);}return()=>lifecycle.abort();
 },[]);
 const [open,setOpen]=useState(false),[message,setMessage]=useState(''),[color,setColor]=useState<Color>('yellow');
 return <main><header className="site-header"><a className="brand" href="/" aria-label="Bundles of Joy home"><Heart size={25}/><span>Bundles of Joy<span className="brand-dot">.</span></span></a><button className="add-button" onClick={()=>setOpen(true)}><Plus size={18}/> Add a message</button></header>
 <section className="wall-heading"><div><p className="eyebrow">A LITTLE GOOD, SHARED.</p><h1>The joy is in the little things.</h1><p className="intro">Good moments. Kind words. A little encouragement.<br/>There’s room for yours on the wall.</p></div><span className="wall-label"><Heart size={15}/> Made brighter by you</span></section>
 <p className="notice" role="status">{notice}</p>{loadError&&<p className="notice error" role="alert">{loadError} <button onClick={()=>load()}>Try again</button></p>}<section className="board" aria-label="Wall of encouraging messages"><div className="notes">{[...notes,...samples].map((note,i)=><article key={note.id} className="sticky" style={{background:colors[note.color], transform:`rotate(${[-2,1.5,-1,2,-1.5,1][i%6]}deg)`}}><Pin className="note-pin" size={18}/><p>{note.message}</p><footer><span>{typeof note.id==='string'?'From Bundles of Joy':'A little joy, shared'}</span>{'createdAt' in note&&<time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</time>}</footer></article>)}</div>{loading&&<p className="board-state" role="status">Gathering little joys…</p>}{hasMore&&<div className="load-more"><button disabled={loading} onClick={()=>{setLoading(true);void load(true);}}>More little joys</button></div>}</section>
 <footer className="page-footer">A small note can make someone’s day. <Heart size={14}/></footer>
 <Dialog open={open} onOpenChange={next=>{if(!saving)setOpen(next)}}><DialogContent className="composer"><DialogTitle className="composer-title">Leave a little joy.</DialogTitle><DialogDescription>A good moment, a kind word, or something that inspires you.</DialogDescription><form onSubmit={async e=>{e.preventDefault();if(saving)return;setSaving(true);setError('');try{await post({message,color});setMessage('');setOpen(false);}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setSaving(false);}}}><label className="field-label" htmlFor="message">Your message</label><textarea disabled={saving} id="message" style={{background:colors[color]}} value={message} onChange={e=>{setMessage(e.target.value);requestId.current='';}} maxLength={500} placeholder="Something good happened today…"/><div className="counter">{message.length}/500</div><fieldset><legend>Pick a note color</legend><div className="swatches">{Object.entries(colors).map(([name,hex])=><label className="swatch" key={name} style={{background:hex}}><input disabled={saving} type="radio" name="color" value={name} checked={color===name} onChange={()=>{setColor(name as Color);requestId.current='';}}/><span className="sr-only">{name}</span>{color===name&&<Check size={19}/>}</label>)}</div></fieldset>{error&&<p className="error" role="alert">{error}</p>}<div className="form-footer"><span>Little words. Big difference.</span><button className="add-button" disabled={!message.trim()||saving} type="submit"><Pin size={16}/> {saving?'Posting…':'Post'}</button></div></form></DialogContent></Dialog>
 </main>
}
