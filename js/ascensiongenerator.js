function AscensionGenerator() {

    const
        GENERATOR = "Anne";

    function shuffleSets(random,sets) {
        let
            out = [];

        sets.forEach(set=>{
            out = out.concat(random.shuffle(set));
        });

        return out;
    }

    function generate(database,translator,worldGenerator,language,zone,lore,progress) {

        let
            random = new Random(zone.seed),
            ending;

        ending = worldGenerator.getEnding(progress,language);

        database.setBiomes(zone.allBiomes,zone.allBiomes);

        const
            CREATURESMAP=shuffleSets(random,[
                [
                    
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",

                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",

                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    "+digital",
                    
                    "+credits",
                    "+credits",
                    "+memory",
                    "+past",
                    "+past",
                    "+past"
                ]
            ]);

        let
            text={
                encounterType:"",
                creatureType:"",
                events:"",
                places:""
            },
            eventId = 100,
            eventSet = 0,
            creatureId = 0;

        text.places+="{bold}[label:places]{endbold} (d6+d6)\n";
        for (let i=2;i<13;i++) {
            text.places+="{bold}"+i+".{endbold} [+placeNarrative +"+random.element(zone.allBiomes)+"] ([+placeSize +small]). [+placeGameplay]\n";
        }

        text.encounterType+="{nowordwrap}{bold}[label:encounterType]{endbold} (2d6)\n";
        for (let i=0;i<36;i++) {
            if (i % 6 == 0)
                text.encounterType+="{symbol ruler} {bold}"+((i/6)+1)+"{endbold}\n"
            text.encounterType+="{bold}"+(i%6+1)+".{endbold} [+ascensionNarrative +encounter]";
            if (i%2)
                text.encounterType+="\n";
            else
                text.encounterType+="{tab}";
        }

        // Generate creatures table

        text.creatureType+="{bold}[label:creatureType]{endbold} (2d6)\n";
        text.creatureType+="{nowordwrap}";

        CREATURESMAP.forEach((type,id)=>{
            if (id % 6 == 0) {
                text.creatureType+="{symbol ruler} {bold}"+((id/6)+1)+"{endbold} [+creatureType +average]\n"
                creatureId=1;
            }
            text.creatureType+="{bold}"+creatureId+".{endbold} [+ascensionNarrative +creature "+type+"]";
            if (creatureId%2)
                text.creatureType+="{tab}";
            else
                text.creatureType+="\n";
            creatureId++;
        });
        text.creatureType+="{wordwrap}{symbol ruler} {bold}5-6{endbold} [+creatureType +generator]\n{bold}1-6.{endbold} "+GENERATOR+": \""+ending+"\"\n";

        text.events+="{bold}[label:events]{endbold} (2d6)\n";

        for (let i=0;i<36;i++) {
            eventId++;
            if (eventId>6) {
                eventSet++;
                text.events+="{symbol ruler} {bold}"+(eventSet)+"{endbold}\n";
                eventId=1;
            }
            text.events+="";
            if ((i<18) && lore.events[i])
                text.events+= "{bold}"+(eventId)+".{endbold} [+ascensionNarrative +output] {symbol "+lore.events[i].place.symbol+"} {italic}"+lore.events[i].year+": "+worldGenerator.solveHistory(lore.events[i],language,lore.events[i].action.logLine)+"{enditalic}";
            else if (i%2)
                text.events+= "{bold}"+(eventId)+".{endbold} [+ascensionNarrative +friendly]: [+reward].";
            else {
                text.events+= "{bold}"+(eventId)+"-"+(eventId+1)+".{endbold} [+ascensionNarrative +hostile]. [+fail].";
                i++;
                eventId++;
            }
            text.events+="\n";
        }

        text.events += "{symbol separator}\n{center}{italic}"+translator.translate(language,"manualVersionLabel")+": "+METADATA.gameManualVersion+" - "+translator.translate(language,"gameVersionLabel")+": "+METADATA.gameVersion+"{enditalic}";

        return [
            "{center}{symbol largeLogo}\n\n{bold}"+translator.translate(language,"regionBooklet")+"{endbold}\n\n{bold}"+translator.translate(language,"world")+":{endbold} "+zone.worldName+" {bold}["+translator.translate(language,"ascension")+"]{endbold}\n\n{left}"+
            database.solveString(random,translator,language,text.places),
            database.solveString(random,translator,language,text.encounterType),
            database.solveString(random,translator,language,text.creatureType),
            database.solveString(random,translator,language,text.events)
        ];

    }

    this.generate = (database,translator,worldGenerator,language,zone,lore,progress)=>{
        return generate(database,translator,worldGenerator,language,zone,lore,progress);
    }

}
