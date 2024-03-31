import * as vscode from 'vscode';
import axios from 'axios';
import * as querystring from 'querystring';
import * as fs from 'fs';
import * as path from 'path';
import { lutingToken, provideLutingTokensFromString } from './Language/myTokenParser';
import { expandDefinitions, removeComments } from './helperFunctions';
import { PriorityQueue } from './Language/priorityQueue';
import * as helper from "./helperFunctions";

class Graph {
	private n: number;               // number of vertices
	private m: number;               // number of edges
	private degrees: number[];       // degrees[i]: the degree of vertex i
	private edges: { [key: number]: number[] };       // edges[i]: the endpoints of the edges of vertex i
	private weights: { [key: number]: number[] };     // weights[i]: the weights of the edges of vertex i
	private content: string[];	 	 // content[i]: the content of the i-th vertex

	constructor(n: number) {
		this.n = n;
		this.m = 0;
		this.degrees = new Array(n).fill(0);
		this.edges = {};
		this.weights = {};
		this.content = new Array(n).fill("");
	}

	// Add an edge between vertices u and v with weight w
	addEdge(u: number, v: number, w: number): void {
		if (!this.edges[u]) {
			this.edges[u] = [];
			this.weights[u] = [];
		}
		this.edges[u].push(v);
		this.weights[u].push(w);
		this.degrees[u]++;
		this.m++;
	}

	// Set the content of vertex i
	setContent(i: number, content: string): void {
		this.content[i] = content;
	}

	// Get the content of vertex i
	getContent(i: number): string {
		return this.content[i];
	}

	// Get the number of vertices
	getVerticesCount(): number {
		return this.n;
	}

	// Get the number of edges
	getEdgesCount(): number {
		return this.m;
	}

	// Get the degree of vertex v
	getDegree(v: number): number {
		return this.degrees[v];
	}

	// Get the endpoints of the edges incident to vertex v
	getEdges(v: number): number[] {
		return this.edges[v] || [];
	}

	// Get the weights of the edges incident to vertex v
	getWeights(v: number): number[] {
		return this.weights[v] || [];
	}
}

/**
 * Generates a multi-graph from the given luting tokens
 * @param tokens The luting tokens to generate the multi-graph from
 * @returns The generated multi-graph
 */
function getMultiGraph(tokens: lutingToken[], timingsArray: string[]): Graph {
    
	let mergedGraph = new Graph(tokens.length * timingsArray.length + 1);

	//adding horizontal edges
	for (let m = 0; m < timingsArray.length; m++) {
		for (let n = 0; n < tokens.length; n++) {
			let tk = tokens[n];
			let currTiming = timingsArray[m];
			if (getDuration(tk) === currTiming) {
				tk = removeDuration(tk);
			}
			// Calculate the index in the merged graph
			let index = tokens.length * m + n;
			// Set the content of the vertex
			mergedGraph.setContent(index, tk.content);
			
			if (n > 0) {
				if (tokens[n - 1].type === 'note' || tokens[n - 1].type === 'chord') {
					let weight = mergedGraph.getContent(index - 1).length;
					mergedGraph.addEdge(index - 1, index, weight);
				} else {
					mergedGraph.addEdge(index - 1, index, 0);
				}
			}
		}
		// Connect the last node of each individual graph to the final node
		let finalNodeIndex = tokens.length * timingsArray.length;
		let lastCurrentNodeIndex = tokens.length * (m + 1) - 1;
		mergedGraph.addEdge(lastCurrentNodeIndex, finalNodeIndex, mergedGraph.getContent(lastCurrentNodeIndex).length);
	}

	// Adding vertical edges
	for (let n = 0; n < tokens.length; n++) {
		for (let m = 0; m < timingsArray.length; m++) {
			let currentIdx = tokens.length * m + n;

			// Add vertical edges to nodes in subsequent subgraphs
			for (let k = m + 1; k < timingsArray.length; k++) {
				let nextTimingIdx = tokens.length * k + n;
				let fwdWeight = timingsArray[k].length + 1.1;
				let bwdWeight = timingsArray[m].length + 1.1;
				mergedGraph.addEdge(currentIdx, nextTimingIdx, fwdWeight);
				// Add the reverse edge for bidirectional connection
				mergedGraph.addEdge(nextTimingIdx, currentIdx, bwdWeight);
			}
		}
	}
	return mergedGraph;
}

/**
 * Reconstructs the luting from the given path in the merged graph
 * @param mergedGraph The merged graph to reconstruct the luting from
 * @param path The path in the merged graph
 * @returns The reconstructed luting from the given path
 */
function reconstructLutingFromPath(mergedGraph: Graph, path: number[], timings: string[]): string {
    let reconstructedLuting = "";
    const verticesPerSubgraph = Math.floor(mergedGraph.getVerticesCount() / timings.length);

    for (let i = 0; i < path.length - 2; i++) {
        const currentIndex = path[i];
        const nextIndex = path[i + 1];

        if (nextIndex - currentIndex === 1) {
            // Consecutive indices
            const token = mergedGraph.getContent(currentIndex);
            reconstructedLuting += token;
        } else {
            // Jump
            const nextSubgraphIndex = Math.floor(nextIndex / verticesPerSubgraph);
            const nextSubgraphTiming = timings[nextSubgraphIndex];
            reconstructedLuting += "t" + nextSubgraphTiming;
        }
    }

    // Add the last token
    const lastToken = mergedGraph.getContent(path[path.length - 2]);
    reconstructedLuting += lastToken;

    return reconstructedLuting;
}

/**
 * Generates the best timing placements for the given luting tokens
 * @param tokens The luting tokens to generate the best timing placements for
 * @returns The best timing placements for the given luting tokens
 */

export function generateBestTimingPlacements(tokens: lutingToken[]): lutingToken[] {
    const newVoicePositions = helper.getLutingIndicesOf(tokens, [new lutingToken("|", "new-voice")]);
	removeComments(tokens);
    const voices: string[] = [];

    let startIndex = 0;
    for (const newIndex of newVoicePositions) {
        const voiceTokens = tokens.slice(startIndex, newIndex);
        const voiceLuting = provideLutingTokensFromString(expandDefinitions(voiceTokens));
        const timings = getOccurringTimings(voiceLuting);
        const timingsArray = Array.from(timings).sort();
        const mergedGraph = getMultiGraph(voiceLuting, timingsArray);
        const path = dijkstra(mergedGraph);
        const reconstructedLuting = reconstructLutingFromPath(mergedGraph, path, timingsArray);
        voices.push(reconstructedLuting);

        startIndex = newIndex + 1; // Move to the next voice
    }

    // Process the last voice
    const lastVoiceTokens = tokens.slice(startIndex);
    const lastVoiceLuting = provideLutingTokensFromString(expandDefinitions(lastVoiceTokens));
    const lastVoiceTimings = getOccurringTimings(lastVoiceLuting);
    const lastVoiceTimingsArray = Array.from(lastVoiceTimings).sort();
    const lastVoiceMergedGraph = getMultiGraph(lastVoiceLuting, lastVoiceTimingsArray);
    const lastVoicePath = dijkstra(lastVoiceMergedGraph);
    const lastVoiceReconstructedLuting = reconstructLutingFromPath(lastVoiceMergedGraph, lastVoicePath, lastVoiceTimingsArray);
    voices.push(lastVoiceReconstructedLuting);

    return provideLutingTokensFromString(voices.join("|"));
}


/**
 * Dijkstra's algorithm to find the shortest path from vertex 0 to vertex n in the given graph
 * @param graph The graph to perform Dijkstra's algorithm on
 * @returns The shortest path from vertex 0 to vertex n
 */
function dijkstra(graph: Graph): number[] {
    const n = graph.getVerticesCount();
    const distances = new Array(n).fill(Number.MAX_VALUE);
    const visited = new Array(n).fill(false);
    const previous = new Array(n).fill(-1);

    distances[0] = 0;

    // Create a priority queue
    const pq = new PriorityQueue<{ vertex: number; distance: number }>((a, b) => a.distance - b.distance);

    // Add the source vertex to the priority queue
    pq.push({ vertex: 0, distance: 0 });

    while (!pq.isEmpty()) {
        const { vertex: minIndex, distance: minDistance } = pq.pop()!; // Adjust pop function return value

        if (visited[minIndex]) {
            continue;
        }

        visited[minIndex] = true;

        const edges = graph.getEdges(minIndex);
        const weights = graph.getWeights(minIndex);

        for (let k = 0; k < edges.length; k++) {
            const v = edges[k];
            const w = weights[k];

            if (!visited[v] && minDistance + w < distances[v]) {
                distances[v] = minDistance + w;
                previous[v] = minIndex;

                // Enqueue the updated distance to the priority queue
                pq.push({ vertex: v, distance: distances[v] });
            }
        }
    }

    const path = [];
    let current = n - 1;
    while (current !== -1 && current !== undefined) {
        path.unshift(current);
        current = previous[current];
    }
    return path;
}


/**
 * Returns a set of all the timings that occur in the luting
 * @param tokens The array of lutingTokens to analyze
 * @returns A set of all the timings that occur in the luting
 */

function getOccurringTimings(tokens: lutingToken[]): Set<string>{
	let res = new Set<string>();
	res.add("1");
	for (let t of tokens){
		if (t.type === 'note' || t.type === 'chord'){
			res.add(getDuration(t).toString());
		}
	}
	return res;
}

/**
 * Expands all notes into their fully written out durations
 * @param tokens The array of lutingTokens to expand
 * @returns The array of expanded tokens.
 */
function expandTimings(tokens: lutingToken[]): lutingToken[]{
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
			//Match chord
			const chord = tokens[i].content.match(/[^)]+/);
			const closingBracket = tokens[i].content.match(/\)/);
			let trailingFrac;
			if (chord && closingBracket){
				trailingFrac = tokens[i].content.substring(chord[0].length + 1).match(/^(\d+\/\d+|\d+|\/\d+)/);
			}
			if (!trailingFrac){
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

/**
 * Returns duration of current chord or note
 * @param token 
 * @returns Duration as string
 */
function getDuration(token: lutingToken): string{
	if (token.type === 'note'){
		const frac = token.content.match(/(\d+\/\d+|\d+|\/\d+)/);
		if (frac){
			return frac[0];
		}
	} else if (token.type === 'chord'){
		const chord = token.content.match(/[^)]+/);
		const closingBracket = token.content.match(/\)/);
		let trailingFrac;
		if (chord && closingBracket){
			let subs = token.content.substring(chord[0].length + 2);
			trailingFrac = token.content.substring(chord[0].length + 1).match(/^(\d+\/\d+|\d+|\/\d+)/);
		}
		if (trailingFrac){
			return trailingFrac[0];
		}
	}
	return "";
}

/**
 * Returns duration of current chord or note
 * @param token 
 * @returns lutingToken without the timing
 */
function removeDuration(token: lutingToken): lutingToken{
	if (token.type === 'note'){
		const note = token.content.match(/^[a-g]'?|r/);
		if (note){
			return new lutingToken(note[0], 'note');
		}
	} else if (token.type === 'chord'){
		const chord = token.content.match(/[^)]+/);
		const closingBracket = token.content.match(/\)/);
		if (chord && closingBracket){
			return new lutingToken(chord[0].concat(closingBracket[0]), 'chord');
		}
	}
	return token;
}
