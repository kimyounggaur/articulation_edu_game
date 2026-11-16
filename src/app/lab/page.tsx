import { notFound } from 'next/navigation';
import { specOf, KINDS } from '@/engine/engine';
import { Stage } from '@/stage/Stage';
export default function Lab(){
 if(process.env.NODE_ENV!=='development')notFound();
 return <main style={{maxWidth:720,margin:'24px auto',padding:16}}><h1>눈길 발자국 · 견본</h1>{(['none',...KINDS] as const).map(kind=><section key={kind}><h2>{kind}</h2><Stage spec={specOf(kind==='none'?[]:[{kind,scope:'ALL'}])} prints/></section>)}</main>;
}
