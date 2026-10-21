import {ages} from './content.js';
export function getAge(id){return ages.find(age=>age.id===id)||ages[0]}
export function headerDecision({delta,y,menuOpen,hidden,focusWithin=false}){if(menuOpen||focusWithin||y<40)return false;if(Math.abs(delta)<12)return hidden;return delta>0}
