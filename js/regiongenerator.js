function RegionGenerator() {

    const
        QUOTES_ENCODED = 1,
        QUOTES_MATCHER = /\{STARTQUOTE\}([^\{]+)\{ENDQUOTE\}/g;

    function shuffleSets(random,sets) {
        let
            out = [];

        sets.forEach(set=>{
            out = out.concat(random.shuffle(set));
        });

        return out;
    }

    function generate(database,translator,worldGenerator,language,zone,lore) {

        let
            random = new Random(zone.seed),
            uniqueEvent;

        database.setBiomes(zone.allBiomes,zone.biomes);

        if (zone.history) {
            let
                history = random.element(zone.history),
                legacy = random.element(history.action.legacy);
            uniqueEvent = { text:worldGenerator.solveHistory(history,language,legacy) };
        } else if (zone.activity) {
            uniqueEvent = { tags:"+activityNarrative +"+zone.activity, outcomeTags:"+activityGameplay +"+zone.activity };
        } else {
            uniqueEvent = { tags:"+neutralNarrative +someoneElse", outcomeTags:"+neutral +someoneElse" };
        }

        const
            ENCOUNTERMAP=shuffleSets(random,[
                [
                
                    // --- Quiet zone

                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+helpful",

                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+neutral",
                    "+helpful",

                    // --- Quiet / Mixed zone

                    "+neutral",
                    "+neutral",
                    "+helpful",
                    "+helpful",
                    "+dangerous",
                    "+dangerous"

                ],[

                    // --- Mixed zone

                    "+neutral",
                    "+neutral",
                    "+helpful",
                    "+helpful",
                    "+dangerous",
                    "+dangerous",

                    // --- Dangerous zone

                    "+dangerous",
                    "+dangerous",
                    "+dangerous",
                    "+dangerous",
                    "+dangerous",
                    "+dangerous",

                    // --- Jolly zone

                    "+dangerous",
                    "+dangerous",
                    "+dangerous",
                    "+dangerous",
                    "+dangerous"

                ],[
                    "+any"
                ]
            ]),
            CREATURESMAP=shuffleSets(random,[
                [
                    // --- Quiet zone
                    "+average",
                    "+average",
                    "+social",
                ],[
                    // --- Action zone
                    "+trained",
                    "+trained",
                    "+strong"
                ]
            ]),
            PLACESMAP=shuffleSets(random,[
                [
                    { size:"+medium", gameplayTags:["+difficultMovement", "+withResources", "+testFullHealth" ] },
                    { size:"+medium", gameplayTags:[ "+withResources", "+testPartialHealth" ] },
                    { size:"+poi", narrativeTags:"+noHealth", gameplayTags:[ "+socialEncounter" ] },
                    { size:"+small", narrativeTags:"+noHealth", gameplayTags:[ "+viewAround", "+withResources" ] },
                    { size:"+medium", narrativeTags:"+noHealth", gameplayTags:[ "+difficultMovement", "+withResources" ] },
                    { size:"+medium", narrativeTags:"+noHealth", gameplayTags:[ "+testMovement" ] },
                    { size:"+medium", narrativeTags:"+quiet +noHealth", gameplayTags:[ "+withResources" ] },
                    { size:"+large", narrativeTags:"+noHealth", gameplayTags:[ "+battling" ] }
                ],[
                    { size:"+small", narrativeTags:"+noHealth", gameplayTags:[ "+blocking" ] },
                    { size:"+medium", narrativeTags:"+noHealth", gameplayTags:[ "+noMeeting", "+dangerous" ] },
                    zone.isAscension ? { size:"+small", narrativeTags:"+ascension" } : { size:"+medium", narrativeTags:"+normal" }
                ]
            ]),
            EVENTSMAP=shuffleSets(random,[
                [
                    { tags:"+hazardNarrative +severe +health +debuff", outcomeTags:"+fail +severe +health +debuff" },

                    { tags:"+hazardNarrative +light +any +debuff", outcomeTags:"+fail +light +any +debuff" },
                    { tags:"+hazardNarrative +medium +any +debuff", outcomeTags:"+fail +medium +any +debuff" },
                    { tags:"+hazardNarrative +medium +debuff", outcomeStatTags:"+stat", outcomeTags:"+fail +medium +debuff" },
                    { tags:"+hazardNarrative +medium +debuff", outcomeStatTags:"+stat", outcomeTags:"+fail +medium +debuff" },
                    { tags:"+hazardNarrative +severe +any +debuff", outcomeTags:"+fail +severe +any +debuff" },

                    { tags:"+hazardNarrative +light +health", outcomeTags:"+fail +light +health" },
                    { tags:"+hazardNarrative +light +health", outcomeTags:"+fail +light +health" },
                    { tags:"+hazardNarrative +medium +health", outcomeTags:"+fail +medium +health" },
                    { tags:"+hazardNarrative +severe +health", outcomeStatTags:"+stat", outcomeTags:"+fail +severe +health" },

                    { tags:"+helperNarrative +light +heal", outcomeTags:"+reward +light +heal"  },
                    { tags:"+helperNarrative +light +heal", outcomeTags:"+reward +light +heal"  },
                    { tags:"+helperNarrative +light +heal", outcomeTags:"+reward +light +heal"  },
                    { tags:"+helperNarrative +light +heal", outcomeTags:"+reward +light +heal"  },
                    { tags:"+helperNarrative +strong +heal", outcomeTags:"+reward +strong +heal"  },

                    { tags:"+helperNarrative +active", testStatTags:"+stat", testTags:"+oncePerZone", outcomeStatTags:"+stat", outcomeTags:"+reward +increaseStat" },
                    { tags:"+helperNarrative +active", testStatTags:"+stat", testTags:"+oncePerZone", outcomeStatTags:"+stat", outcomeTags:"+reward +increaseStat" },
                    { tags:"+helperNarrative +active", testStatTags:"+stat", testTags:"+test", outcomeTags:"+reward +buff +anyLocal" },
                    { tags:"+helperNarrative +active", testStatTags:"+stat", testTags:"+test", outcomeStatTags:"+stat", outcomeTags:"+reward +buff"  },
                    { tags:"+helperNarrative +passive", outcomeStatTags:"+stat", outcomeTags:"+reward +buff"  },
                    { tags:"+helperNarrative +passive", outcomeStatTags:"+stat", outcomeTags:"+reward +buff"  },

                    { tags:"+neutralNarrative +reroll", outcomeTags:"+neutral +reroll" },
                    { tags:"+neutralNarrative +shortcut", outcomeStatTags:"+stat", outcomeTags:"+neutral +noEncounter"  },
                    { tags:"+neutralNarrative +someoneElse", outcomeTags:"+neutral +someoneElse" },
                    { tags:"+neutralNarrative +someoneElse", outcomeTags:"+neutral +someoneElse" },
                    { tags:"+neutralNarrative +someoneElse", outcomeTags:"+neutral +someoneElse" },

                    { tags:"+helperNarrative +xp", outcomeTags:"+reward +xp"  },
                    { tags:"+hazardNarrative +critical", outcomeTags:"+fail +critical"  },
                    { tags:"+hazardNarrative +critical", outcomeTags:"+fail +critical"  },

                    uniqueEvent
                ]
            ]);

        let
            text={
                encounterType:"",
                creatureType:"",
                events:"",
                places:""
            },
            eventSet = 1,
            eventId = 100;

        // Generate events table

        text.events+="{bold}[label:events]{endbold} (2d6)\n";
        text.events+="{symbol ruler} {bold}1{endbold}\n{bold}1-6.{endbold} [+hazardNarrative +orientation] [+fail +orientation]\n";
        EVENTSMAP.forEach((event,id)=>{
            eventId++;

            if (eventId>6) {
                eventSet++;
                text.events+="{symbol ruler} {bold}"+(eventSet)+"{endbold}\n";
                eventId=1;
            }
            
            if (event.text)
                text.events+="{bold}"+(eventId)+".{endbold} "+event.text+"\n";
            else {

                let
                    tags,
                    narrativeTags,
                    line = "";
    
                if (event.testTags) {
                    tags="+test "+event.testTags;
                    if (event.testStatTags) {
                        let
                            tag = database.entryByTags(random,event.testStatTags.split(" "));
                        if (tag) {
                            tags+=" +"+tag.value.stat;
                            narrativeTags = "+"+tag.value.stat;
                        }
                    }
                    line+="["+tags+"] ";
                    tags = "";
                } else {
                    tags = "capitalize:";
                }

                tags+=event.outcomeTags;
                if (event.outcomeStatTags) {
                    let
                        tag = database.entryByTags(random,event.outcomeStatTags.split(" "));
                    if (tag) {
                        tags+=" +"+tag.value.stat;
                        if (!narrativeTags)
                            narrativeTags = "+"+tag.value.stat;
                    }
                }
                line+="["+tags+"].\n";

                text.events+="{bold}"+(eventId)+".{endbold} ["+event.tags+(narrativeTags ? " "+narrativeTags : "")+"]{CODESLOT} "+line;

            }

        });

        text.events += "{symbol separator}{center}{italic}"+translator.translate(language,"manualVersionLabel")+": "+METADATA.gameManualVersion+" - "+translator.translate(language,"gameVersionLabel")+": "+METADATA.gameVersion+"{enditalic}";

        // Generate places table

        text.places+="{bold}[label:places]{endbold} (d6+d6)\n";
        PLACESMAP.forEach((place,id)=>{
            text.places+="{bold}"+(id+2)+".{endbold} [+placeNarrative "+place.size+(place.narrativeTags ? " "+place.narrativeTags : "")+(place.gameplayTags ? " "+place.gameplayTags.join(" ") : "")+"] ([+placeSize "+place.size+"]). ";
            if (place.gameplayTags)
                place.gameplayTags.forEach(tag=>{
                    text.places+="[+placeGameplay "+tag+"] "
                });
            text.places=text.places.substr(0,text.places.length-1)+"\n";
        });

        // Generate encounter table

        text.encounterType+="{nomultipage}{nowordwrap}{bold}[label:encounterType]{endbold} (2d6)\n";
        ENCOUNTERMAP.forEach((type,id)=>{
            if (id % 6 == 0)
                text.encounterType+="{symbol ruler} {bold}"+(id/6+1)+"{endbold}\n"
            text.encounterType+="{bold}"+(id%6+1)+".{endbold} [+encounterType "+type+"]"
            if (id%2)
                text.encounterType+="\n";
            else
                text.encounterType+="{tab}";
        });

        // Generate creatures table

        text.creatureType+="{nomultipage}{nowordwrap}{bold}[label:creatureType]{endbold} (2d6)\n";
        CREATURESMAP.forEach((type,id)=>{
            text.creatureType+="{symbol ruler} {bold}"+(id+1)+"{endbold} [+creatureType "+type+"]\n"
            for (let j=0;j<6;j++) {
                text.creatureType+="{bold}"+(j+1)+".{endbold} [+creatureNarrative "+type+"]"
                if (j%2)
                    text.creatureType+="\n";
                else
                    text.creatureType+="{tab}";
            }
        });

        // Apply navigation codes

        let
            codeSlots = [],
            quoteSlot = [],
            codeReplaces = {},
            codeTags = [ "+navigationNarrative", "+code" ];

        for (let t in text) {
            let
                pos = 0;
            codeReplaces[t] = [];
            text[t].replace(/\{CODESLOT\}/g,m=>{
                codeSlots.push({ text:t, pos:pos });
                codeReplaces[t][pos]="";
                pos++;
            });
        }

        zone.zoneCodes.forEach(code=>{
            let
                placeholder = random.removeElement(codeSlots),
                text = database.entryByTags(random,codeTags);
            if (text)
                text = text.value[language].replace(/\[code\]/g,code);
            else
                text = code+".";
            codeReplaces[placeholder.text][placeholder.pos]=" "+text;
        });

        for (let t in text) {
            let
                pos = 0;
            text[t]=text[t].replace(/\{CODESLOT\}/g,m=>{
                let
                    text = codeReplaces[t][pos];
                pos++;
                return text;
            });
        }

        // Generate contents

        let
            pages=[
                "{center}{symbol largeLogo}\n\n{bold}"+translator.translate(language,"regionBooklet")+"{endbold}\n\n{bold}"+translator.translate(language,"world")+":{endbold} "+zone.worldName+" {bold}"+translator.translate(language,"region")+":{endbold} "+zone.name+"{symbol "+zone.symbol+"}\n\n{left}"+
                database.solveString(random,translator,language,text.places),
                database.solveString(random,translator,language,text.encounterType),
                database.solveString(random,translator,language,text.creatureType),
                database.solveString(random,translator,language,text.events)
            ];

        // Add fantasy translations

        let
            quotesToEncode = [],
            quotesReplaces = {},
            pos;

        pages.forEach((page,id)=>{
            pos = 0;
            quotesReplaces[id] = [];
            page.replace(QUOTES_MATCHER,(m,m1)=>{
                quotesToEncode.push({ page:id, pos:pos });
                quotesReplaces[id][pos]=m1;
                pos++;
            });
        });

        for (let i=0;i<QUOTES_ENCODED;i++) {
            let
                slot = random.removeElement(quotesToEncode);

            if (slot) {
                quotesReplaces[slot.page][slot.pos] = quotesReplaces[slot.page][slot.pos].replace(/([a-zA-Z])/g,(m,m1)=>{
                    return "{fantasy}"+m1+"{endfantasy}{moveback 0.65}";
                })
            }

        }

        pages = pages.map((page,id)=>{
            pos = 0;
            return page.replace(QUOTES_MATCHER,(m,m1)=>{
                let
                    text = quotesReplaces[id][pos];
                pos++;
                return text;
            });
        });


        return pages;

    }

    this.generate = (database,translator,worldGenerator,language,zone,lore)=>{
        return generate(database,translator,worldGenerator,language,zone,lore);
    }

}
