function Database(resources) {

    const
        BREAK_CACHE = true;

    let
        biomes = [],
        allBiomes,
        data = [],
        sessionId = 0,
        nextId = 1;

    function matchTags(filter,rowTags) {
        for (let i=0;i<filter.length;i++) {
            let
                operator = filter[i][0],
                value = filter[i].substr(1);
            switch (operator) {
                case "+":{
                    if (rowTags.indexOf(value) == -1)
                        return false;
                    break;
                }
                case "-":{
                    if (rowTags.indexOf(value) != -1)
                        return false;
                    break;
                }
                default:{
                    return false;
                }
            }
        }
        return true;
    }

    function entryByTags(random,filter) {
        let
            match,
            hasBiome,
            minHits,
            hits = [ [], [], [] ];

        data.forEach(row=>{

            if (matchTags(filter,row.tags)) {

                if (row._SESSION == sessionId)
                    hits[2].push(row);
                else if ((minHits === undefined) || (row._HITS < minHits)) {
                    hits[1] = hits[1].concat(hits[0]);
                    hits[0] = [ row ];
                    minHits = row._HITS;
                } else if (row._HITS == minHits)
                    hits[0].push(row);
                else
                    hits[1].push(row);
           
            }

        });

        hits = hits.map(list=>{
            let
                map = {};
            list.forEach(row=>{
                let
                    slot = "none";
                allBiomes.forEach(biome=>{
                    if (row.tags.indexOf(biome)!=-1) {
                        hasBiome = true;
                        slot = biome;
                    }
                });
                if (!map[slot])
                    map[slot]=[];
                map[slot].push(row)
            })
            return map;
        });

        if (hasBiome) {
            for (let i=0;i<hits.length;i++) {
                for (let j=0;j<biomes.length;j++)
                    if (hits[i][biomes[j].name]) {
                        match = random.element(hits[i][biomes[j].name]);
                        biomes[j].hits++;
                        if (match._SESSION == sessionId)
                            console.warn("Reusing",match,"for same booklet",filter);
                        if (match) {
                            match._HITS++;
                            match._SESSION = sessionId;
                        }
                        biomes.sort((a,b)=>{
                            if (a.hits>b.hits) return 1; else
                            if (a.hits<b.hits) return -1; else
                            return 0;
                        })
                        return match;
                    }
            }
        } else {
            for (let i=0;i<hits.length;i++) {
                if (hits[i].none) {
                    match = random.element(hits[i].none);
                    if (match) {
                        match._HITS++;
                        match._SESSION = sessionId;
                    }
                    return match;
                }
            }
        }
        return false;  

    }

    function solveString(random,translator,language,str) {
        let
            run;
        do {
            run = false;
            str = str.replace(/\[([^\]]+)\]/g,(m,m1)=>{
                let
                    args = m1.split(":");

                if (args[0] == "label")
                    return translator.translate(language,args[1]);
                else {
                    let
                        mods = args[1] ? args[0].trim().split(" ") : null,
                        tags = args[1] || args[0],
                        found = entryByTags(random,tags.trim().split(" ")),
                        out;
                    if (found) {
                        if (!found.value) {
                            console.warn("Missing value for",found);
                            return "{???:VALUE}"
                        }
                        if (found.value.battleTarget) {
                            let
                                value = found.value;
                            
                            return "{symbol battleSymbol}"+
                                (value.battlePre ? (value.battleTarget-value.battlePre)+"-" : "")+
                                "{bold}"+value.battleTarget+"{endbold}"+
                                (value.battlePost ? "-"+(value.battleTarget+value.battlePost) : "")+
                                " {symbol woundSymbol}"+value.wound+" {symbol socialSymbol}"+
                                (value.socialPre ? (value.socialTarget-value.socialPre)+"-" : "")+
                                "{bold}"+value.socialTarget+"{endbold}"+
                                (value.socialPost ? "-"+(value.socialTarget+value.socialPost) : "");
                        }
                        if (!found.value[language]) {
                            console.warn("Missing language",language,"for",found);
                            return "{???:LANGUAGE}"
                        }
                        run = true;
                        out = found.value[language];

                        if (mods) {
                            if (mods.indexOf("capitalize") !== -1)
                                out = out[0].toUpperCase()+out.substr(1);
                        }
                        
                        return out;
                    } else {
                        console.warn("Tags ["+tags+"] not matching data");
                        return "{???}"
                    }
                }
            })
        } while (run);
        return str;
    }

    this.reset=()=>{
        sessionId = 0;
        data.forEach(row=>{
            row._HITS = 0;
            row._SESSION = 0;
        })
    }

    this.setBiomes = (all,b)=>{
        sessionId++;
        allBiomes = all;
        biomes = b.map(biome=>{
            return { name:biome, hits:0 };
        })
        biomes.push({ name:"none", hits:0 });
    }

    this.load = (cb)=>{
        if (resources.length) {
            let
                xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = ()=>{
                if (xmlhttp.readyState == 4)
                    if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                        JSON.parse(xmlhttp.responseText).forEach(row=>{
                            row._ID = nextId;
                            row._HITS = 0;
                            nextId++;
                            data.push(row);
                        })
                        this.load(cb);
                    }
                else this.load(cb);
            };
            xmlhttp.open("GET", resources.pop()+(BREAK_CACHE?"?"+Math.random():""), true);
            xmlhttp.send();
        } else cb();
    }

    this.entryByTags=(random,filter)=>{
        return entryByTags(random,filter);
    }

    this.solveString=(random,translator,language,string)=>{
        return solveString(random,translator,language,string);
    }

}