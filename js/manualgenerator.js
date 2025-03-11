function ManualGenerator(resources) {

    const
        COVERS = 20,
        BREAK_CACHE = true;

    let
        loadingManual,
        manuals = {};

    this.load = (cb)=>{
        if (resources.length) {
            loadingManual = resources.pop();
            let
                xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = ()=>{
                if (xmlhttp.readyState == 4)
                    if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                        manuals[loadingManual.language] = xmlhttp.responseText;
                        this.load(cb);
                    }
                else this.load(cb);
            };
            xmlhttp.open("GET", loadingManual.file+(BREAK_CACHE?"?"+Math.random():""), true);
            xmlhttp.send();
        } else cb();
    }

    this.generate = (translator,language,seed)=>{

        let
            random = new Random(seed),
            list = [];

        for (let i=0;i<COVERS;i++)
            list.push(i);

        cover1 = random.removeElement(list);
        cover2 = random.removeElement(list);

        return [
            "{nomultipage}{sticker coverArt"+cover1+" 5 46}{sticker coverArt"+cover2+" 32.3 46 1}{center}{symbol manualCover}{moveup 9}"+translator.translate(language,"version")+" "+METADATA.gameManualVersion,
            manuals[language].replace(/\[([^\]]+)\]/g,(m,m1)=>{
                return translator.translate(language,m1);
            }),
            "{center}{symbol characterSheet}"
        ]
    };

}