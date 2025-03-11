function WorldGenerator(resources) {

    const
        CONNECTION_ATTEMPTS = 100,
        SEEDROOT=0,
        MAXSEEDLENGTH=9,
        NAVIGATIONCODES_COPIES = 2,
        DEFAULTSEEDWORD = "ALEA",
        SEEDLETTERS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        CODELETTERS="123456789ABCDEFGHKLMNPQRSTUVWXYZ",
        YEARREFERENCES="ADEFGHIJKLMNOPQRTUVWXYZ",
        YEARMODES=[
            {
                start:[1000,5000],
                prefix:"b.",
                multiply:-1,
                step:[2,6]
            },{
                start:[0,5000],
                prefix:"a.",
                multiply:1,
                step:[2,6]
            }
        ],
        OPPOSITES = {
            north:"south",
            south:"north",
            east:"west",
            west:"east"
        },
        DIRECTIONCODES = {
            north:"N",
            south:"S",
            east:"E",
            west:"W"
        },
        BIOMEMAPS = [
            {
                biomes:"ABCD",
                map:[
                    [ [ "AB"       ], [ "A."       ], [ "AC"       ] ],
                    [ [ "B."       ], [ "AD", "BC" ], [ "C."       ] ],
                    [ [ "BD"       ], [ "D."       ], [ "CD"       ] ]
                ]
            },{
                biomes:"ABCD",
                map:[
                    [ [ "A."       ], [ "AC"       ], [ "C."       ] ],
                    [ [ "AB"       ], [ "AD", "BC" ], [ "CD"       ] ],
                    [ [ "B."       ], [ "BD"       ], [ "D."       ] ]
                ]
            }
        ],
        CELLCODES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        ZONECODELENGTH = 6,
        BREAK_CACHE = true;

    let
        worldDatabase;

    this.load = (cb)=>{
        let
            xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = ()=>{
            if (xmlhttp.readyState == 4)
                if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                    worldDatabase = JSON.parse(xmlhttp.responseText);
                    cb();
                }
            else cb();
        };
        xmlhttp.open("GET", resources+(BREAK_CACHE?"?"+Math.random():""), true);
        xmlhttp.send();
    }

    function addEntity(entities,nameGenerator,cell,entityType) {
        let
            entityData = worldDatabase.entitiesById[entityType],
            entity = {
                name:nameGenerator.generate(entityData.type),
                type:entityType,
                data:entityData,
                isAlive:true,
                x:cell.x,
                y:cell.y,
                visitedCells:[cell],
                bannedActionTypes:[]
            };

        entities.push(entity);
        return entity;
    }

    function generateCode(random,length,cache) {
        let
            out;

        do {
            out = "";
            while (out.length<length)
                out += random.element(CODELETTERS);
        } while (cache[out]);

        cache[out] = true;

        return out;
        
    }

    function generateName(nameGenerator,type,cache) {
        let
            out;

        do {
            out = nameGenerator.generate(type);
        } while (cache[out]);

        cache[out] = true;

        return out;
        
    }

    function pickActivity(random,list) {
        if (!list.length)
            worldDatabase.activities.forEach(activity=>{
                list.push(activity);
            })
        return random.removeElement(list);
    }

    function addZoneCode(list,prefix,code,times) {
        let
            code1 = prefix+"1:"+code.substr(0,code.length/2),
            code2 = prefix+"2:"+code.substr(code.length/2);
        for (let i=0;i<times;i++) {
            list.push(code1);
            list.push(code2);
        }
    }

    this.generateBookletData=(random,worldMap,regionGenerator,ascensionGenerator,database,translator,worldGenerator,language,lore,progress)=>{
        let
            cells = worldMap.getCells();

        random.shuffle(cells);

        cells.forEach(cell=>{
            cell.bookletData = regionGenerator.generate(database,translator,worldGenerator,language,cell,lore);
        });

        worldMap.ascension.bookletData = ascensionGenerator.generate(database,translator,worldGenerator,language,cells[0],lore,progress);

    }

    this.initialize=(database)=>{
        database.reset();
    }

    this.addBiomes=(random,worldMap)=>{

        let
            availableBiomes = [],
            biomeMap = random.element(BIOMEMAPS),
            biomes = {};

        for (let i=0;i<biomeMap.biomes.length;i++) {
            if (!availableBiomes.length)
                worldDatabase.biomes.forEach(biome=>{
                    availableBiomes.push(biome);
                })
            biomes[biomeMap.biomes[i]]=random.removeElement(availableBiomes);
        }

        for (let y=0;y<biomeMap.map.length;y++)
            for (let x=0;x<biomeMap.map[y].length;x++) {
                let
                    mix = random.element(biomeMap.map[y][x]),
                    cellBiomes = [],
                    cell = worldMap.map[y][x];

                for (let i=0;i<mix.length;i++)
                    if (biomes[mix[i]])
                        cellBiomes.push(biomes[mix[i]]);

                cell.allBiomes=worldDatabase.biomes;
                cell.biomes=cellBiomes;

            }

        worldMap.ascension = { allBiomes: worldDatabase.biomes, biomes:[ "ascension" ] };

    }

    this.addWorldData=(worldMap,seed,worldName)=>{
        let
            cells = worldMap.getCells();

        cells.forEach(cell=>{
            cell.seed = seed+cell.index+1;
            cell.worldName = worldName;
        });

        worldMap.idCache = {};
    }

    this.stringToSeedText=(str)=>{
        let
            out = "";
        str = str ? str.toUpperCase() : "";
        for (let i=0;i<str.length;i++)
            if (SEEDLETTERS.indexOf(str[i])!=-1)
                out+=str[i];
        out=out.substr(0,MAXSEEDLENGTH);
        if (!out) out=DEFAULTSEEDWORD;
        return out;
    }

    this.textToSeed=(text)=>{
        let
            seed=SEEDROOT,
            base=1;
        text = this.stringToSeedText(text);
        for (let i=0;i<text.length;i++) {
            let
                position=SEEDLETTERS.indexOf(text[i])+1;
            if (position>0) {
                seed+=base*position;
                base*=SEEDLETTERS.length;
            }
        }
        return seed;
    }

    this.addAscension = (random,worldMap)=>{
        let
            cells = worldMap.getCells();

        random.element(cells).isAscension = true;
    }

    this.assignCodes = (random,worldMap)=>{
        let
            ascendCells,
            cells = worldMap.getCells();

        cells.forEach(cell=>{
            cell.zoneCodes = [];
            cell.codes = {};
            cell.connections.forEach(c=>{
                let
                    prefix = DIRECTIONCODES[c.to],
                    code = cell.availableCodes[prefix];
                addZoneCode(cell.zoneCodes,prefix,code,NAVIGATIONCODES_COPIES);
                cell.codes[code] = c;
            });
            if (cell.isAscension)
                cell.codes[worldMap.ascensionCode] = { to:"ascend", cell:{ isAscend:true } };
        });

        for (let i=0;i<worldMap.ascensionCode.length;i++) {
            let
                cell;
            if (!ascendCells || (ascendCells.length == 0))
                ascendCells = worldMap.getCells();
            cell = random.removeElement(ascendCells);
            cell.zoneCodes.push("A"+(i+1)+":"+worldMap.ascensionCode[i]);
        }

    }

    this.addCellCodes = (random,worldMap)=>{
        let
            cells = worldMap.getCells(),
            nameGenerator = new NameGenerator(random);

        worldMap.ascensionCode = generateCode(random,cells.length,worldMap.idCache);

        cells.forEach(cell=>{
            cell.availableCodes = {};
            cell.name = generateName(nameGenerator,"place",worldMap.idCache);
            cell.nameId = cell.name.toUpperCase();
            for (let i=0;i<CELLCODES.length;i++)
                cell.availableCodes[CELLCODES[i]] = generateCode(random,ZONECODELENGTH,worldMap.idCache);
        });

    }

    this.logConnections = (worldMap)=>{
        let out="";
        worldMap.map.forEach(row=>{
            let
                r1="", r2="", r3="", r4="", r5="";
            row.forEach(cell=>{
                if (cell) {
                    let
                        conn = {};
                    if (cell.connections)
                        cell.connections.forEach(c=>conn[c.to]=true);

                    if (!cell.connections)
                        console.warn("UNCONNECTED");

                    if (conn.north) r1+="+-|-+"; else r1+="+---+";
                    r2+="|   |";
                    if (conn.west) r3+="-"; else r3+="|";
                    r3+=" "+(cell.isAscension ? "^" : " ")+" ";
                    if (conn.east) r3+="-"; else r3+="|";
                    r4+="|   |";
                    if (conn.south) r5+="+-|-+"; else r5+="+---+";
                } else {
                    r1+="     ";
                    r2+="     ";
                    r3+="     ";
                    r4+="     ";
                    r5+="     ";
                }
            })

            out+=r1+"\n"+r2+"\n"+r3+"\n"+r4+"\n"+r5+"\n";

        })

        console.log("\n"+out);
    }

    this.addConnections = (random,worldMap)=>{

        let
            attempts = CONNECTION_ATTEMPTS,
            path,
            cells = worldMap.getCells();

        do {

            let
                startCell = random.element(cells);
            
            path = [ startCell ];
            startCell.isConnected = true;

            cells.forEach(cell=>{
                delete cell.connections;
            })

            do {
                
                let
                    availableConnections = [];

                path.forEach(cell=>{
                    if (!cell.connections || (cell.connections.length<2))
                        for (let side in cell.directions) {
                            let
                                destination = cell.directions[side];
                            if (!destination.connections)
                                availableConnections.push({ side:side, from:cell, to:destination });
                        }
                })

                if (availableConnections.length) {
                    let
                        connection = random.element(availableConnections);

                    if (!connection.from.connections)
                        connection.from.connections = [];
                    if (!connection.to.connections)
                        connection.to.connections = [];

                    connection.from.connections.push({ to:connection.side, cell:connection.to });
                    connection.to.connections.push({ to:OPPOSITES[connection.side], cell:connection.from });
                    
                    path.push(connection.to);

                } else
                    break;

            } while (true);

        } while ((path.length!=cells.length)&&attempts--);

        return (path.length==cells.length);
        
    }

    this.addLore = (random,worldMap,entitiesCount,turns)=>{

        let
            nameGenerator = new NameGenerator(random),
            cells = worldMap.getCells(),
            entities = [],
            activities = [],
            yearMode = random.element(YEARMODES),
            yearStep = yearMode.step[0]+random.integer(yearMode.step[1]-yearMode.step[0]),
            time = 0,
            history = {
                yearMode:yearMode,
                yearStart:yearMode.start[0]+random.integer(yearMode.start[1]-yearMode.start[0]),
                yearLabel:yearMode.prefix+random.element(YEARREFERENCES)+".",
                events:[]
            };

        for (let i=0;i<entitiesCount;i++)
            addEntity(entities,nameGenerator,random.removeElement(cells),random.element(worldDatabase.entitiesId));

        for (let i=0;i<turns;i++) {
            entities.forEach(entity=>{
                if (entity.isAlive) {

                    let
                        cell = worldMap.map[entity.y][entity.x],
                        destination,
                        destinations = [];

                    // Move

                    cell.destinations.forEach(destination=>{
                        if (entity.visitedCells.indexOf(destination) == -1)
                            destinations.push(destination);
                    });

                    if (destinations.length) {
                        destination = random.element(destinations);
                        entity.visitedCells.push(destination);
                    } else
                        destination = random.element(cell.destinations);

                    entity.x = destination.x;
                    entity.y = destination.y;

                    // Interact

                    if (worldDatabase.events[entity.type]) {
                        let
                            actions = worldDatabase.events[entity.type],
                            options = [];

                        entities.forEach(otherEntity=>{
                            if ((otherEntity !== entity) && otherEntity.isAlive && (otherEntity.x == entity.x) && (otherEntity.y == entity.y))
                                actions.forEach(action=>{
                                    if (
                                        (action.withTypes.indexOf(otherEntity.type) != -1) &&
                                        (entity.bannedActionTypes.indexOf(action.type) == -1) &&
                                        (otherEntity.bannedActionTypes.indexOf(action.type) == -1)
                                    ) {
                                        options.push({ action: action, withEntity:otherEntity });
                                    }
                                })
                        });

                        // Decide action
                        
                        if (options.length) {

                            let
                                option,
                                historyLine,
                                withEntity,
                                action;

                            option = random.element(options);
                            withEntity = option.withEntity;
                            action = option.action;
                            historyLine = {
                                time:i,
                                year:(history.yearStart+(yearMode.multiply*time))+" "+history.yearLabel,
                                place:destination,
                                entities:[ entity, withEntity ],
                                action:action
                            };

                            time++;

                            switch (option.action.type) {
                                case "winConflict":{
                                    withEntity.isAlive = false;
                                    break;
                                }
                                case "loseConflict":{
                                    entity.isAlive = false;
                                    break;
                                }
                                case "generate":{
                                    let
                                        childType,
                                        child;
                                    entity.bannedActionTypes.push("generate");
                                    withEntity.bannedActionTypes.push("generate");
                                    if (random.bool())
                                        childType = entity.type;
                                    else
                                        childType = withEntity.type;
                                    child = addEntity(entities,nameGenerator,destination,childType);
                                    historyLine.entities.push(child);
                                    break;
                                }
                            }

                            if (!destination.history)
                                destination.history = [];

                            destination.history.push(historyLine);
                            history.events.push(historyLine);

                        }

                    }

                }
            });
            time+=yearStep;
        }

        cells = worldMap.getCells();

        cells.forEach(cell=>{
            if (!cell.history)
                cell.activity = pickActivity(random,activities);
        });

        return history;

    }

    this.getEndingsCount=()=>{
        return worldDatabase.endings.length;
    }

    this.getEnding=(id,language)=>{
        if (!id)
            id = 0;
        if (worldDatabase.endings[id])
            return worldDatabase.endings[id][language];
        else
            return worldDatabase.endings[worldDatabase.endings.length-1][language];
    }

    this.solveHistory=(entry,language,line)=>{
        return line[language].replace(/\[([^\]]+)\]/g,(m,m1)=>{
            let
                placeholder = m1.split(":"),
                entity = entry.entities[parseInt(placeholder[1])-1];

            switch (placeholder[0]) {
                case "name":{
                    return entity.name;
                }
                case "title":{
                    return entity.data[language].replace(/\[name\]/g,(m,m1=>entity.name));
                }
                default:{
                    console.warn("Invalid entity placeholder",m1);
                }
            }
        });
    }

}