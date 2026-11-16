import { notFound } from 'next/navigation';
import ViewportFrame from './ViewportFrame';
export default function Viewport(){if(process.env.NODE_ENV!=='development')notFound();return <ViewportFrame/>;}
