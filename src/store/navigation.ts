import { create } from 'zustand';
export type Route = {screen:'home'|'free'|'records'|'settings'} | {screen:'intro';stage:number} | {screen:'mission';id:string;seed:number};
export const useNavigation = create<{route:Route;setRoute:(route:Route)=>void}>((set)=>({route:{screen:'home'},setRoute:(route)=>set({route})}));
