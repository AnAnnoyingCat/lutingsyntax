import * as vscode from 'vscode';

import { lutingToken } from '../Language/myTokenParser';

export function tokensToString(tokens: lutingToken[]): string{
	let returnString = "";
	for (var token of tokens){
		returnString = returnString.concat(token.content.toString());
	}
	return returnString;
}

export function equalTokens(t1s: lutingToken[], t2s: lutingToken[]): boolean{
	if (t1s.length !== t2s.length){
		return false;
	}
	for (let i = 0; i < t1s.length; i++){
		if (t1s[i].type !== t2s[i].type || t1s[i].content !== t2s[i].content){
			return false;
		}
	}
	return true;
}

export function expandDefinitions(tokens: lutingToken[]): string{
	removeComments(tokens);
	let res: string = "";
	const definitionLookup: { [key: string] : string } = {};
	let inDefinition: number = 0;
	let currentDefinition: string[] = [];
	for (var token of tokens){

		if (inDefinition > 0){
			if (!(token.type === 'end-definition' || token.type === 'start-definition' || token.type === 'predefined-section')){
				currentDefinition[currentDefinition.length-1] = currentDefinition[currentDefinition.length-1].concat(token.content.toString());
			}
		}
		//now we finally take care of any new definitions or definitions which need expanding
		if (token.type === 'start-definition'){
			const defName = token.content.match(/[A-Z]/);
			if (defName){
				currentDefinition.push(defName[0].toString());
			} else {
				console.error("Tried to create a new definition without a name!");
			}
			inDefinition++;
		} else if (token.type === 'predefined-section'){
			//a defined section! let's expand it!
			const defName = token.content.match(/[A-Z]/);
			const repetitions = token.content.match(/\d+/);
			if (defName){
				const definedValue = definitionLookup[defName[0].toString()].toString();
				if (repetitions){
					if (inDefinition > 0){
						for (let i = 0; i < +repetitions; i++){
							currentDefinition[currentDefinition.length-1] = currentDefinition[currentDefinition.length-1].concat(definedValue);
						}
					} else {
						for (let i = 0; i < +repetitions; i++){
							res = res.concat(definedValue);
							
						}
					}
				} else {
					if (inDefinition > 0){
						currentDefinition[currentDefinition.length-1] = currentDefinition[currentDefinition.length-1].concat(definedValue);
					} else {
						res = res.concat(definedValue);
					}
				}
			}
		} else if (token.type === 'end-definition'){
			//how many times we want the current definition to be written initially
			const repetitions = token.content.match(/\d+/);
			inDefinition--;
			//the name of the new definition is defined as the first character of the last definition.
			const newDefName = currentDefinition[inDefinition].substring(0, 1);
			//the definition itself is saved right afterwards
			const newDefinition = currentDefinition[inDefinition].substring(1);
			//remove the definition from the array
			currentDefinition.splice(inDefinition);
			definitionLookup[newDefName] = newDefinition;
			if (repetitions){
				for (let i = 0; i < +repetitions[0]; i++){
					if (inDefinition > 0){
						currentDefinition[currentDefinition.length-1] = currentDefinition[currentDefinition.length-1].concat(definitionLookup[newDefName]);
					} else {
						res = res.concat(definitionLookup[newDefName.toString()].toString());
					}	
				}
			} else {
				if (inDefinition > 0){
						currentDefinition[currentDefinition.length-1] = currentDefinition[currentDefinition.length-1].concat(definitionLookup[newDefName]);
				} else {
					res = res.concat(definitionLookup[newDefName.toString()].toString());
				}	
			}
		} else {
			if (inDefinition === 0){
				res = res.concat(token.content.toString());
			}
		}
	}
	return res;
}

export function removeComments(tokens: lutingToken[]): lutingToken[]{
	for (let i = 0; i < tokens.length; i++){
		if (tokens[i].type === 'comment'){
			tokens.splice(i, 1);
			i--;
		}
	}
	return tokens;
}

export function finalizeLuting(tokens: lutingToken[]): string{
	removeComments(tokens);
	return tokensToString(tokens);
}

export function expandTimings(tokens: lutingToken[]): lutingToken[]{
	//only works on lutings which had their definition expanded!
	let currentTime = "1";
	for (let i = 0; i < tokens.length; i++){
		if (tokens[i].type === 'time'){
			const newTime = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
			if (newTime){
				currentTime = newTime[0].toString();
				tokens.splice(i, 1);
				i--;
			} else {
				console.error("didn't find new time hryElp");
			}
		} else if (tokens[i].type === 'note'){
			const frac = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
			if (!frac){
				//note has no fraction
				const note = tokens[i].content.match(/([a-g]'?|r)/);
				if (note){
					const newNote = note[0].toString().concat(currentTime);
					tokens[i].content = newNote;
				}
			}
		} else if (tokens[i].type === 'chord'){
			const frac = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
			if (!frac){
				//chord has no fraction
				const chord = tokens[i].content.match(/[^)]+/);
                const closingBracket = tokens[i].content.match(/\)/);
				if (chord && closingBracket){
					const newNote = chord[0].toString().concat(closingBracket[0].toString(), currentTime);
					tokens[i].content = newNote;
				}
			}
		} else if (tokens[i].type ==='new-voice'){
			currentTime = "1";
		}
	}

	return tokens;
}