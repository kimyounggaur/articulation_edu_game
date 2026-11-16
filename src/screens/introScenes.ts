import { INTRO, type Pattern } from '../engine/engine';
export interface IntroScene {text:string;type:'walk'|'place'|'compare'|'table'|'end';pattern?:Pattern}
export const INTRO_SCENES:Record<number,IntroScene[]> = Object.fromEntries(Object.entries(INTRO).map(([stage,scenes])=>[stage,scenes.map(scene=>({text:scene.text,type:scene.finish?'end':scene.interaction??'walk',pattern:scene.show??[]}))]));
