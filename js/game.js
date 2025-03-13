function Game(rootPath) {
    
    const
        DEBUG = false,
        FILEPREFIX = "AleaOptima";

    let
        isLoaded = false,
        generatedId,
        generatedSeed,
        worldMap,
        manual,
        template = new SVGTemplate(rootPath+"svg/model.svg",'l'),
        templateMap = new SVGTemplate(rootPath+"svg/map.svg",'l'),
        worldGenerator = new WorldGenerator(rootPath+"database/world.json"),
        translator = new Translator(rootPath+"database/labels.json"),
        manualGenerator = new ManualGenerator([
            { language:"EN", file:rootPath+"database/manual-EN.txt" }
        ]),
        database = new Database([
            rootPath+"database/data.json"
        ]);

    function generateWorld(debug,language,seed,progress) {

        worldGenerator.initialize(database);

        let
            worldName = worldGenerator.stringToSeedText(seed),
            worldSeed = worldGenerator.textToSeed(worldName),

            regionGenerator = new RegionGenerator(),
            ascensionGenerator = new AscensionGenerator(),

            random = new Random(worldSeed);

        worldMap = new WorldMap(worldSeed,3,3);

        // World data

        worldGenerator.addWorldData(worldMap,worldSeed,worldName);

        // Connect regions

        worldGenerator.addConnections(random,worldMap);

        // General purpose codes

        worldGenerator.addCellCodes(random,worldMap);

        // Biomes

        worldGenerator.addBiomes(random,worldMap);

        // Lore

        let lore = worldGenerator.addLore(random,worldMap,6,20);

        // Navigation

        worldGenerator.addAscension(random,worldMap);
        worldGenerator.assignCodes(random,worldMap);

        // Generate booklets

        worldGenerator.generateBookletData(random,worldMap,regionGenerator,ascensionGenerator,database,translator,worldGenerator,language,lore,progress);

        // Generate manual

        manual = manualGenerator.generate(translator,language,worldSeed);

        // Logs

        if (debug) {

            worldGenerator.logConnections(worldMap);

            lore.events.forEach(line=>{
                console.log(line.year+" - @"+line.time+" at "+line.place.x+","+line.place.y+": "+worldGenerator.solveHistory(line,language,line.action.logLine));
                /*
                line.action.legacy.forEach(legacy=>{
                    console.log("   - ",worldGenerator.solveHistory(line,language,legacy))
                })
                */
            });

            let
                cells = worldMap.getCells();

            cells.forEach(cell=>{
                console.log("-- Cell",cell.name,"("+cell.x+","+cell.y+")");
                for (let k in cell.codes)
                    console.log("  Direction",cell.codes[k].to,"Code:",k);
            })
        }

    }

    function getRegionCell(id) {
        let
            cells = worldMap.getCells(),
            found;

        if (!id) id="";
        id = id.trim().toUpperCase();

        cells.forEach(cell=>{
            if (cell.nameId == id)
                found = cell;
        })

        return found;
    }

    function getRegionDirection(id,code) {
        let
            cell = getRegionCell(id);        

        if (cell && cell.codes[code])
            return cell.codes[code];
    }

    function printBooklet(pages, printMode) {
        let
            out = {
                stats:[],
                svg:0
            };
            svg = new SVG(template),
            bookletPrinter = new BookletPrinter(svg, printMode),
            atPage = 0;

        pages.forEach(section=>{
            let
                stats = bookletPrinter.print(atPage,section);
            out.stats.push(stats);
            atPage = stats.toPage;
        });

        bookletPrinter.finalize();

        out.svg = svg;

        svg.finalize();

        return out;
    }

    this.getEndingsCount=()=>{
        return worldGenerator.getEndingsCount();
    }

    this.translate=(language,label)=>{
        return translator.translate(language,label);
    }

    this.load = (onl)=>{
        if (isLoaded)
            onl();
        else {
            manualGenerator.load(_=>{
            translator.load(_=>{
            worldGenerator.load(_=>{
            database.load(_=>{
            templateMap.load(_=>{
            template.load(_=>{
                isLoaded = true;
                onl();
            })})})})})});
        }
    }

    this.stringToSeedText=(text)=>{
        return worldGenerator.stringToSeedText(text);
    }

    this.generateWorld=(language,seed,progress,cb)=>{

        let
            newId = seed+"-"+language+"-"+progress;

        setTimeout(()=>{

            if (newId == generatedId)
                cb();
            else {
        
                generateWorld(DEBUG,language,seed,progress);

                // Callback

                generatedId = newId;
                generatedSeed = seed;
                cb();

            }

        },2000);

    }

    this.born=(settings)=>{
        let
            book = new PDFBook(),
            cells = worldMap.getCells(),
            cell = cells[Math.floor(Math.random()*cells.length)],
            map = new SVG(templateMap);

        map.finalize();

        book.addPage(printBooklet(manual, settings.printMode+"Manual").svg);
        book.addPage(printBooklet(cell.bookletData, settings.printMode+"Region").svg);
        book.addPage(map);

        book.downloadPDF(FILEPREFIX+"-born-"+generatedSeed+"-"+cell.name+".pdf");

    }

    this.isRegionValid=(id)=>{
        return !!getRegionCell(id);        
    }

    this.getRegionCodeDirectionId=(id,code)=>{
        let
            direction = getRegionDirection(id,code);
        return direction && direction.to;
    }

    this.travel=(id,code,settings)=>{
        let
            book = new PDFBook(),
            direction = getRegionDirection(id,code),
            cell = direction.cell,
            map = new SVG(templateMap);

        map.finalize();

        if (direction.to == "ascend") {
            book.addPage(printBooklet(worldMap.ascension.bookletData, settings.printMode+"Region").svg);
            book.addPage(map);
            book.downloadPDF(FILEPREFIX+"-travel-"+generatedSeed+"-ASCENSION.pdf");
        } else {
            book.addPage(printBooklet(cell.bookletData, settings.printMode+"Region").svg);
            book.addPage(map);
            book.downloadPDF(FILEPREFIX+"-travel-"+generatedSeed+"-"+cell.name+".pdf");
        }

    }

    this.benchmark=(debug,addManual,language,progress,seed,settings)=>{

        let
            out = {
                booklets:[],
                stats:{ history:0, noHistory:0 }
            };

        generateWorld(debug,language,seed,progress);

        let
            cells = worldMap.getCells(),
            row;

        cells.forEach(cell=>{
            if (cell.history)
                out.stats.history++;
            else
                out.stats.noHistory++;
            row = printBooklet(cell.bookletData, settings.printMode+"Region");
            row.data = cell.bookletData;
            out.booklets.push(row);
        });

        row = printBooklet(worldMap.ascension.bookletData, settings.printMode+"Region");
        row.data = worldMap.ascension.bookletData;
        out.booklets.push(row);

        if (addManual) {
            let
                map = new SVG(templateMap);

            map.finalize();
            
            row = printBooklet(manual, settings.printMode+"Manual");
            row.data = manual;
            row.isManual = true;
            out.booklets.push(row);

            out.booklets.push({ svg:map, isMap:true });
        }

        return out;
        
    }

    this.downloadCharacterSheets=(language)=>{
        let
            book = new PDFBook(),
            map = new SVG(templateMap);

        map.finalize();

        book.addPage(printBooklet([
            "{nomultipage}{center}{symbol characterSheetsCover}{moveup 9}"+translator.translate(language,"version")+" "+METADATA.gameManualVersion,
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}",
            "{nomultipage}{center}{symbol characterSheet}"
        ], "bookletManual").svg);

        book.downloadPDF("character-sheets.pdf");

    }

}