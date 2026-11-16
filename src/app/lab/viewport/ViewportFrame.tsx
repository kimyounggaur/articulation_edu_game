'use client';
import { useEffect, useState } from 'react';
export default function ViewportFrame(){
 const [size,setSize]=useState({width:360,height:640});
 useEffect(()=>{const q=new URLSearchParams(window.location.search);setSize({width:Math.max(320,Math.min(1400,Number(q.get('width'))||360)),height:Math.max(568,Math.min(1200,Number(q.get('height'))||640))});},[]);
 return <main style={{padding:12}}><p>화면 점검 · {size.width} × {size.height}</p><iframe id="qa-frame" title="눈길 발자국 화면 점검" src="/?open=6&sound=off" style={{display:'block',...size,border:'1px solid #c9d2ea',margin:'12px auto'}}/></main>;
}
