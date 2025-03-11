import { pipeline } from "@xenova/transformers";
import * as fs from "fs";

const extractor = await pipeline(
	"feature-extraction",
	"Xenova/all-MiniLM-L6-v2"
);

const
	DEBUG = false,
	THRESHOLD = 0.79,
	SENTENCESGROUPS_SIZE = 200,
	SKIP_TAGS = [
		"loreEntity",
		"activity",
		"navigationNarrative",
		"activityGameplay",
		"stat",
		"test",
		"reward",
		"fail",
		"neutral",
		"placeSize",
		"placeGameplay",
		"creatureType",
		"ascensionNarrative"
	];

let
		dataJson = fs.readFileSync('../../database/data.json', 'utf8'),
		data = JSON.parse(dataJson),
		worldJson = fs.readFileSync('../../database/world.json', 'utf8'),
		world = JSON.parse(worldJson),
		sentences = [],
		out = "",
		isCacheDirty = false,
		cache = {};

if (fs.existsSync('cache.json')) {
	let
		cacheJson = fs.readFileSync('cache.json', 'utf8');
	cache = JSON.parse(cacheJson);
}

async function addToCache(sentence) {
	if (!cache[sentence]) {
		console.log("Adding to cache: ",sentence);
		isCacheDirty = true;
		const response = await extractor([ sentence ], { pooling: "mean", normalize: true } );
		cache[sentence] = Array.from(response.data);
	}
}

function isEntryValid(entry) {
	let
		ok = true;
	entry.tags.forEach(tag=>{
		if (SKIP_TAGS.indexOf(tag)!=-1)
			ok = false;
	})
	return ok;
}

function cleanSentence(sentence) {
	return sentence
		.replace(/\[code\]/g,"a code")
		.replace(/\{STARTQUOTE\}/g,"")
		.replace(/\{ENDQUOTE\}/g,"")
		.replace(/\[name:1\]/g,"Anne")
		.replace(/\[title:1\]/g,"Anne the Wizard")
		.replace(/\[name:2\]/g,"Bill")
		.replace(/\[title:2\]/g,"Bill the Warrior")
		.replace(/\[name:3\]/g,"Carol")
		.replace(/\[title:3\]/g,"Carold the Witch")
		.replace(/\[\+ascensionNarrative \+negative\]/g,"negative")
		.replace(/\[\+ascensionNarrative \+positive\]/g,"positive")
		.replace(/\[\+ascensionNarrative \+actions\]/g,"performs")
		.replace(/\[\+ascensionNarrative \+thing\]/g,"thing")
		.replace(/\[\+ascensionNarrative \+things\]/g,"things")
		.replace(/\[\+ascensionNarrative \+color\]/g,"color")
		.replace(/\[\+ascensionNarrative \+place\]/g,"place")
		.replace(/\{symbol [^}]+\}/g,"a symbol");
}

function dotProduct(vecA, vecB){
	let product = 0;
	for(let i=0;i<vecA.length;i++){
			product += vecA[i] * vecB[i];
	}
	return product;
}

function magnitude(vec){
	let sum = 0;
	for (let i = 0;i<vec.length;i++){
			sum += vec[i] * vec[i];
	}
	return Math.sqrt(sum);
}

function cosineSimilarity(vecA,vecB){
	return dotProduct(vecA,vecB)/ (magnitude(vecA) * magnitude(vecB));
}

// --- Evaluate

for (let i=0;i<data.length;i++) {
	let
		row = data[i];
	if (isEntryValid(row) && row.value.EN) {
		let
			id = cleanSentence(row.value.EN);
		sentences.push({ sentence:row.value.EN, id:id});
		await addToCache(id);
	}
}

for (let k in world.events) {
	for (let x=0;x<world.events[k].length;x++) {
		for (let j=0;j<world.events[k][x].legacy.length;j++) {
			let
				sentence = world.events[k][x].legacy[j].EN,
				id = cleanSentence(sentence);
			sentences.push({ sentence:sentence, id:id});
			await addToCache(id);
		}
	}
}

out += "## Similar sentences\n\n";

sentences.forEach((from,idFrom)=>{
	let
		ranks = [];
	sentences.forEach((to,idTo)=>{
		if (idFrom != idTo) {
			let
				score = cosineSimilarity(cache[from.id],cache[to.id]);
			if (score > THRESHOLD)
				ranks.push({ sentence:to.sentence, score:score });
		}
	})
	ranks.sort((a,b)=>{
		if (a.score > b.score) return -1;
		else if (b.score > a.score) return 1;
		else return 0;
	});
	if (ranks.length) {
		out+=from.sentence+"\n";
		for (let i=0;i<3;i++)
			if (ranks[i])
				out+=" - "+ranks[i].sentence+" ("+ranks[i].score+")\n";
		out+="\n";
	}
})

if (DEBUG) {
	out+="## All sentences\n\n";
	sentences.forEach((data,id)=>{
		if (id && (id %  SENTENCESGROUPS_SIZE == 0))
			out+="\n---\n\n";
		out+=cleanSentence(data.sentence)+"\n";
	})
}

fs.writeFileSync("results.md",out);

// --- Save cache

if (isCacheDirty)
	fs.writeFileSync("cache.json",JSON.stringify(cache));

console.log("Done.");