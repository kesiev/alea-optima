const
    DEBUG = false,
    ALLOWED_TAGS=[
        "bold",
        "endbold",
        "ENDQUOTE",
        "STARTQUOTE",
        "symbol agilitySymbol",
        "symbol battleSymbol",
        "symbol fixSymbol",
        "symbol healSymbol",
        "symbol socialSymbol",
        "symbol woundSymbol",
        "symbol emojiGrin",
        "symbol emojiBuild",
        "symbol emojiBomb",
        "symbol emojiHeart",
        "symbol emojiSad",
        "symbol emojiFist",
        "symbol emojiChallenge",
        "symbol emojiShock",
        "symbol emojiTime",
        "symbol thankYouBanner",
    ];

var
    debugData = "",
    XLSX = require("xlsx"),
    FS = require('fs'),
    workbook = XLSX.readFile("data.ods");

function cleanSentence(sentence) {
    if (typeof sentence == "string") {
        sentence = sentence
            .replace(/…/g,"...")
            .replace(/“/g,"\"")
            .replace(/”/g,"\"")
            .replace(/’/g,"'");
        sentence.replace(/\{([^}]+)\}/g,(m,m1)=>{
            if (ALLOWED_TAGS.indexOf(m1) == -1)
                console.log("Invalid",m1,"symbol in sentence:",sentence);
        });
        return sentence;
    } else
        return sentence;
        
}

function isQuoteMarked(sentence) {
    if (typeof sentence == "string") {
        let
            ok = true;
        sentence.replace(/"([^"]+)"/g,(m,m1)=>{
            if (m1!="[code]") {
                if (!m1.startsWith("{STARTQUOTE}"))
                    ok = false;
                if (!m1.endsWith("{ENDQUOTE}"))
                    ok = false;
            }
        })
        return ok;
    } else
        return true;
        
}

function isCompleteSentence(sentence) {
    if (typeof sentence == "string")
        return ((sentence.match(/\"/g)||[]).length % 2)==0
    else
        return true;
}

function isEndSentence(sentence) {
    if (typeof sentence == "string")
        return (
            sentence.endsWith(".") ||
            sentence.endsWith("!") ||
            sentence.endsWith("?") ||
            sentence.endsWith("\"") 
        );
    else
        return true;
}

function tableToDatabase(out,workbook,tests,table) {
    let
        data = XLSX.utils.sheet_to_json(workbook.Sheets[table], {header: 1});

    for (let i=1;i<data.length;i++) {
        let
            doImport = true,
            isValid = false,
            readRow = data[i],
            row = { tags:[ table ], value:{} };
        for (let id=0;id<data[0].length;id++) {
            let
                column = data[0][id];
            if (column && doImport) {
                let
                    logRoot = "Table "+table+" Row "+i+" Column "+id;
                if (readRow[id])
                    switch (column) {
                        case "Tag":{
                            row.tags.push(readRow[id]);
                            isValid = true;
                            break;
                        }
                        case "creatureType":{
                            row.tags.push(readRow[id]);
                            row.value[column] = readRow[id];
                            isValid = true;
                            break;
                        }
                        default:{
                            if (readRow[id]) {
                                let
                                    value = cleanSentence(readRow[id]);
                                if (!isCompleteSentence(value))
                                    console.log(logRoot+": \""+value+"\" is not a complete sentence");
                                if (tests.checkAscension && (row.tags.indexOf("ascension")!=-1)) {
                                    if (!isEndSentence(value))
                                        console.log(logRoot+": \""+value+"\" ascension sentence should end as a sentence");
                                } else {
                                    if (tests.endSentence && !isEndSentence(value))
                                        console.log(logRoot+": \""+value+"\" should end as a sentence");
                                    if (tests.doNotEndSentence && isEndSentence(value))
                                        console.log(logRoot+": \""+value+"\" shouldn't end as a sentence");
                                    if (tests.markQuotes && !isQuoteMarked(value))
                                        console.log(logRoot+": "+value+" should have all quotes marked");
                                }
                                row.value[column] = value;
                                isValid = true;
                            }
                            break;
                        }
                    }
            } else
                doImport = false;
        };
        if (isValid)
            out.push(row);
    }
    return out;
}


function labelsToDatabase(workbook) {
    let
        labels =  XLSX.utils.sheet_to_json(workbook.Sheets.label, {header: 1}),
        out = { },
        data;

    for (let i=1;i<labels.length;i++) {
        let
            entity = labels[i];

        labels[0].forEach((column,id)=>{
            switch (column) {
                case "ID":{
                    if (entity[id]) {
                        data = {};
                        out[entity[id]] = data;
                    }
                    break;
                }
                default:{
                    let
                        value = cleanSentence(entity[id]);

                    if (value)
                        if (!data[column])
                            data[column] = value;
                        else {
                            if (typeof data[column] == "string")
                                data[column] = [ data[column] ];
                            data[column].push(value);
                        }
                }
            }
                
        });

    };

    return out;

}

function parseLoreLine(indent,line,must,may) {
    let
        placeholders = {
            "name:1": "[AAA]",
            "title:1": "[AAA] the [111]",
            "name:2": "[BBB]",
            "title:2": "[BBB] the [222]",
            "name:3": "[CCC]",
            "title:3": "[CCC] the [333]",
        },
        unused=[];
        must.forEach(tag=>{
        unused.push(tag);
    })
    for (let k in line) {
        let
            solved = line[k].replace(/\[([^\]]+)\]/g,(m,m1)=>{
                if ((must.indexOf(m1) == -1) && (may.indexOf(m1) == -1)) {
                    console.log("Placeholder",m1,"not allowed for sentece",line[k]);
                    return "???";
                } else {
                    let
                        pos = unused.indexOf(m1);
                    if (pos!==-1)
                        unused.splice(pos,1);
                    return placeholders[m1];
                }
            });
        if (unused.length)
            console.log("Unused tags",unused,"for sentence",line[k]);
        if (DEBUG)
            debugData+=indent+solved+"\n";
    }
}

function checkLoreEvent(entity,event) {
    let
        loglineTagsMust,
        loglineTagsMay,
        legacyTagsMust,
        legacyTagsMay;
    switch (event.type) {
        case "generate":{
            loglineTagsMust = [ "title:1", "title:2", "title:3" ];
            loglineTagsMay = [];
            legacyTagsMust = [];
            legacyTagsMay = ["name:1","name:2","name:3","title:1","title:2","title:3"];
            break;
        }
        case "normal":{
            loglineTagsMust = [ "title:1", "title:2" ];
            loglineTagsMay = [];
            legacyTagsMust = [];
            legacyTagsMay = ["name:1","name:2","title:1","title:2"];
            break;
        }
        case "loseConflict":{
            loglineTagsMust = [ "title:1", "title:2" ];
            loglineTagsMay = [ "name:1" ];
            legacyTagsMust = [];
            legacyTagsMay = ["name:1","name:2","title:1","title:2"];
            break;
        }
        case "winConflict":{
            loglineTagsMust = [ "title:1", "title:2" ];
            loglineTagsMay = [ "name:1" ];
            legacyTagsMust = [];
            legacyTagsMay = ["name:1","name:2","title:1","title:2"];
            break;
        }
    }

    debugData += "\n\n## "+entity+" "+event.type+" with "+event.withTypes.join(", ")+"\n";
    parseLoreLine("",event.logLine,loglineTagsMust,loglineTagsMay);
    event.legacy.forEach(event=>{
        parseLoreLine(" - ",event,legacyTagsMust,legacyTagsMay);
    });
}

function worldToDatabase(workbook) {
    let
        events =  XLSX.utils.sheet_to_json(workbook.Sheets.loreEvent, {header: 1}),
        entities = XLSX.utils.sheet_to_json(workbook.Sheets.loreEntity, {header: 1}),
        biomes = XLSX.utils.sheet_to_json(workbook.Sheets.biome, {header: 1}),
        activities = XLSX.utils.sheet_to_json(workbook.Sheets.activity, {header: 1}),
        endings = XLSX.utils.sheet_to_json(workbook.Sheets.ascensionEndings, {header: 1}),
        eventData,
        out = { biomes:[], activities:[], entitiesId:[], entitiesById:{}, events:{}, endings:[] };

    for (let i=1;i<entities.length;i++) {
        let
            entityId,
            entity = entities[i],
            data = {};

        entities[0].forEach((column,id)=>{
            let
                logRoot = "Table loreEntity Row "+id;
            switch (column) {
                case "ID":{
                    entityId = entity[id];
                    break;
                }
                case "Type":{
                    data.type = entity[id];
                    break;
                }
                default:{
                    let
                        value = cleanSentence(entity[id]);
                    if (!isCompleteSentence(value))
                        console.log(logRoot+": \""+value+"\" lore entity should not be a complete sentence");
                    data[column] = value;
                }
            }
                
        });

        out.entitiesId.push(entityId);
        out.entitiesById[entityId] = data;        
    };

    for (let i=1;i<events.length;i++) {
        let
            isValid = false,
            event = events[i],
            line = {},
            eventMap = {};
        
        events[0].forEach((column,id)=>{
            let
                logRoot = "Table loreEvent Row "+id;
            eventMap[column] = event[id];
            switch (column) {
                case "Type":
                case "ID2":
                case "ID1":{
                    break;
                }
                default:{
                    if (event[id]) {
                        let
                            value = cleanSentence(event[id]);
                        if (!isCompleteSentence(value))
                            console.log(logRoot+": \""+value+"\" lore event should be a complete sentence");
                        line[column] = value;
                        isValid = true;
                    }
                }
            }
        });

        if (eventMap.ID1) {
            if (!out.events[eventMap.ID1])
                out.events[eventMap.ID1] = [];
            eventData = {
                withTypes:eventMap.ID2.split(","),
                type:eventMap.Type,
                logLine:line,
                legacy:[]
            };
            out.events[eventMap.ID1].push(eventData);
        } else if (isValid)
            eventData.legacy.push(line);
    };

    for (let i=1;i<biomes.length;i++)
        if (biomes[i][0])
            out.biomes.push(cleanSentence(biomes[i][0]));

    for (let i=1;i<activities.length;i++)
        if (activities[i][0])
            out.activities.push(cleanSentence(activities[i][0]));

    for (let i=1;i<endings.length;i++) {
        let
            ending = endings[i],
            data = {};

        endings[0].forEach((column,id)=>{
            data[column] = cleanSentence(ending[id]);
        });

        out.endings.push(data);
    };

    for (let k in out.events) {
        out.events[k].forEach(event=>{
            checkLoreEvent(k,event);
        });
    }
    

    return out;

}

function addLine(prefix,lines,value,label,over,overlabel) {
    let
        line = prefix+" - "+value+" **"+label+"**";
    if (overlabel)
        line += " (~"+Math.floor(value/over)+" "+overlabel+")";
    lines.push(line);
}

function makeStats(data,world,labels) {
    
    let
        lines = [],
        counts = {
            byBiome:{},
            byBiomeStats:{},
            byKeyTag:{}
        },
        biomes = [];

    world.biomes.forEach(biome=>{
        biomes.push(biome);
    })
    biomes.push("ascensionNarrative");

    let
        loreEvents = 0,
        loreNarratives = 0;
    for (let k in world.events) {
        loreEvents+=world.events[k].length;
        world.events[k].forEach(element=>{
            loreNarratives+=element.legacy.length;
        })
    }

    data.forEach(row=>{
        let
            rowBiome = "noBiome",
            keytag = row.tags[0];

        biomes.forEach(biome=>{
            if (row.tags.indexOf(biome)!=-1)
                rowBiome = biome;
        })
        row.tags.forEach(tag=>{
            if (!counts[tag]) counts[tag]=0;
            counts[tag]++;
            if (!counts.byBiome[rowBiome]) counts.byBiome[rowBiome]={};
            if (!counts.byBiome[rowBiome][tag]) counts.byBiome[rowBiome][tag]=0;
            counts.byBiome[rowBiome][tag]++;
        })

        if (!counts.byKeyTag[keytag]) counts.byKeyTag[keytag]=0;
        counts.byKeyTag[keytag]++;
    });

    biomes.forEach(biome=>{
        if (!counts.byBiomeStats[biome]) counts.byBiomeStats[biome]={};
        for (let k in counts.byBiome[biome]) {
            let
                value = counts.byBiome[biome][k];
            if (!counts.byBiomeStats[k])
                counts.byBiomeStats[k]={ min:value, max:value, sum:0 };
            if (counts.byBiomeStats[k].min > value)
                counts.byBiomeStats[k].min = value;
            if (counts.byBiomeStats[k].max < value)
                counts.byBiomeStats[k].max = value;
            counts.byBiomeStats[k].sum+=value;
        }
    })

    biomes.forEach(biome=>{
        for (let k in counts.byBiome[biome]) {
            let
                min = counts.byBiomeStats[k].min,
                max = counts.byBiomeStats[k].max,
                sum = counts.byBiomeStats[k].sum,
                avg = sum/world.biomes.length,
                label;

            if (min == max)
                label = min;
            else
                label = "~"+Math.floor(avg)+" ("+min+"-"+max+")";
            counts.byBiomeStats[k].label = label;
        }
    });

    // console.log(JSON.stringify(counts));

    lines.push("# Database");
    lines.push("");
    lines.push("This is a summary of what's into _Alea Optima_. **Obvious spoilers!**");
    
    lines.push(""); lines.push("## World");
    addLine("",lines,world.biomes.length,"Biomes");

    lines.push(""); lines.push("## Gameplay");
    addLine("",lines,counts.byKeyTag.test,"Tests",counts.stat,"per stat");
    addLine("",lines,counts.byKeyTag.reward,"Positive rewards");
    addLine("",lines,counts.byKeyTag.fail,"Negative rewards");
    addLine("",lines,counts.byKeyTag.neutral,"Neutral rewards");

    lines.push(""); lines.push("## Places");
    addLine("",lines,counts.byKeyTag.placeSize,"Sizes");
    addLine("",lines,counts.byKeyTag.placeGameplay,"Interactions");
    addLine("",lines,counts.byKeyTag.placeNarrative,"Descriptions");
    addLine("  ",lines,counts.byBiome.noBiome.placeNarrative,"Cross-biome");
    addLine("  ",lines,counts.byBiomeStats.placeNarrative.label,"Per biome");

    lines.push(""); lines.push("## Encounters");

    lines.push(""); lines.push("### Creatures");
    addLine("",lines,counts.byKeyTag.creatureNarrative,"Creatures");
    addLine("  ",lines,counts.byBiome.noBiome.creatureNarrative,"Cross-biome");
    addLine("  ",lines,counts.byBiomeStats.creatureNarrative.label,"Per biome");
    addLine("",lines,counts.byKeyTag.creatureType,"Stat tiers");

    lines.push(""); lines.push("### Types");
    addLine("",lines,counts.byKeyTag.encounterType,"Types");
    addLine("  ",lines,counts.byBiome.noBiome.neutral,"Suggesting neutrality");
    addLine("  ",lines,counts.byBiome.noBiome.dangerous,"Suggesting danger");

    lines.push(""); lines.push("## Events");
    addLine("",lines,counts.byKeyTag.helperNarrative,"Positive narrative lines");
    addLine("  ",lines,counts.byBiome.noBiome.helperNarrative,"Cross-biome");
    addLine("  ",lines,counts.byBiomeStats.helperNarrative.label,"Per biome");
    addLine("",lines,counts.byKeyTag.hazardNarrative,"Negative narrative lines");
    addLine("  ",lines,counts.byBiome.noBiome.hazardNarrative,"Cross-biome");
    addLine("  ",lines,counts.byBiomeStats.hazardNarrative.label,"Per biome");
    addLine("",lines,counts.byKeyTag.neutralNarrative,"Neutral narrative lines");
    addLine("  ",lines,counts.byBiome.noBiome.neutralNarrative,"Cross-biome");
    addLine("  ",lines,counts.byBiomeStats.neutralNarrative.label,"Per biome");

    lines.push(""); lines.push("### Activities");
    addLine("",lines,world.activities.length,"Types");
    addLine("",lines,counts.activityNarrative,"Narrative lines",world.activities.length,"per type");
    addLine("",lines,counts.activityGameplay,"Interactions",world.activities.length,"per type");

    lines.push(""); lines.push("### Lore");
    addLine("",lines,world.entitiesId.length,"Entity types");
    addLine("",lines,loreEvents,"Interactions",world.entitiesId.length,"per entity type");
    addLine("",lines,loreNarratives,"Narrative lines",loreEvents,"per interaction");

    lines.push(""); lines.push("### Navigation");
    addLine("",lines,counts.byKeyTag.navigationNarrative,"Narrative bits");

    lines.push(""); lines.push("## ???");
    
    addLine("",lines,world.endings.length,"???");
    addLine("",lines,counts.byBiome.ascensionNarrative.output,"O̷u̸t̴p̷u̸t̶ ̸m̷o̶d̶e̶l̸s");
    addLine("",lines,counts.byBiome.ascensionNarrative.color,"C̷o̸l̷o̸r̸s");
    addLine("",lines,counts.byBiome.ascensionNarrative.thing,"T̷h̷i̴n̶g̷s");
    addLine("",lines,counts.byBiome.ascensionNarrative.actions,"A̸c̶t̵i̴o̵n̷s");
    addLine("",lines,counts.byBiome.ascensionNarrative.place,"P̷l̶a̶c̵e̴s");
    addLine("",lines,counts.byBiome.ascensionNarrative.hostile,"H̴o̵s̷t̵i̷l̶e̵s");
    addLine("",lines,counts.byBiome.ascensionNarrative.friendly,"F̵r̷i̶e̵n̸d̴s̴");
    addLine("",lines,counts.byBiome.ascensionNarrative.positive,"P̵o̴s̴i̷t̵i̶v̸e̷ ̵f̵e̸e̷l̶i̷n̸g̵s");
    addLine("",lines,counts.byBiome.ascensionNarrative.negative,"N̵e̵g̵a̵t̸i̸v̴e̵ ̴f̶e̶e̸l̷i̷n̵g̵s");
    addLine("",lines,counts.byBiome.ascensionNarrative.creature,"C̵r̴e̵a̴t̶u̸r̴e̴s̵");
    addLine("",lines,counts.byBiome.ascensionNarrative.encounter,"E̸n̴c̴o̸u̵n̶t̷e̷r̴s̷");

    return lines.join("\n");

}

let
    data = [],
    world,
    labels;

tableToDatabase(data,workbook,{ doNotEndSentence:true },"test");
tableToDatabase(data,workbook,{ doNotEndSentence:true },"reward");
tableToDatabase(data,workbook,{ doNotEndSentence:true },"stat");
tableToDatabase(data,workbook,{ endSentence:true },"hazard");
tableToDatabase(data,workbook,{ doNotEndSentence:true },"activityGameplay");
tableToDatabase(data,workbook,{ doNotEndSentence:true },"fail");
tableToDatabase(data,workbook,{ doNotEndSentence:true },"neutral");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"helperNarrative");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"hazardNarrative");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"neutralNarrative");
tableToDatabase(data,workbook,{ doNotEndSentence:true, markQuotes:true },"ascensionNarrative");

tableToDatabase(data,workbook,{ doNotEndSentence:true },"encounterType");

tableToDatabase(data,workbook,{ doNotEndSentence:true },"placeSize");
tableToDatabase(data,workbook,{ doNotEndSentence:true, checkAscension:true, markQuotes:true },"placeNarrative");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"placeGameplay");
tableToDatabase(data,workbook,{ doNotEndSentence:true, markQuotes:true },"creatureNarrative");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"navigationNarrative");
tableToDatabase(data,workbook,{ endSentence:true, markQuotes:true },"activityNarrative");

tableToDatabase(data,workbook,{ endSentence:true },"creatureType");

world = worldToDatabase(workbook)
labels = labelsToDatabase(workbook)
stats = makeStats(data,world,labels);

FS.writeFileSync('../../database/data.json', JSON.stringify(data));
FS.writeFileSync('../../database/world.json', JSON.stringify(world));
FS.writeFileSync('../../database/labels.json', JSON.stringify(labels));
FS.writeFileSync('../../DATABASE.md', stats);

if (DEBUG)
    FS.writeFileSync('debug.md', debugData);

console.log("Database updated.");