import { getD1 } from "@/db";
const colors = ['yellow','pink','green','blue','purple','orange'];
const headers = {'Cache-Control':'no-store'};
export async function GET(request: Request) {
 try {
  const url = new URL(request.url), before=url.searchParams.get('before');
  if(before && !/^\d+$/.test(before)) return Response.json({error:'Invalid page.'},{status:400,headers});
  const db=getD1();
  const query=before ? db.prepare('SELECT id, message, color, created_at AS createdAt FROM messages WHERE id < ? ORDER BY id DESC LIMIT 61').bind(Number(before)) : db.prepare('SELECT id, message, color, created_at AS createdAt FROM messages ORDER BY id DESC LIMIT 61');
  const {results}=await query.all();
  return Response.json({notes:results.slice(0,60),hasMore:results.length>60},{headers});
 }catch(error){console.error('Read messages failed',error);return Response.json({error:'The wall is temporarily unavailable. Please try again.'},{status:503,headers});}
}
export async function POST(request: Request) {
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin) return Response.json({error:'Please post from this site.'},{status:403,headers});
 let data: Record<string, unknown> | null;
 try{ data=await request.json() as Record<string, unknown> | null; }catch{return Response.json({error:'Please enter a valid message.'},{status:400,headers});}
 if(!data || typeof data.message!=='string' || !data.message.trim() || data.message.trim().length>500 || typeof data.color!=='string' || !colors.includes(data.color) || typeof data.requestId!=='string' || !/^[0-9a-f-]{36}$/i.test(data.requestId))return Response.json({error:'Write 1–500 characters and choose a note color.'},{status:400,headers});
 try{
  const db=getD1();
  await db.prepare('INSERT INTO messages (request_id, message, color, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(request_id) DO NOTHING').bind(data.requestId,data.message.trim(),data.color,new Date().toISOString()).run();
  const note=await db.prepare('SELECT id, message, color, created_at AS createdAt FROM messages WHERE request_id = ?').bind(data.requestId).first();
  return Response.json({note},{status:201,headers});
 }catch(error){console.error('Post message failed',error);return Response.json({error:'Your note couldn’t be posted. Your message is still here—please try again.'},{status:503,headers});}
}
