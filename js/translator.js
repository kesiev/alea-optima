function Translator(resources) {

    const
        BREAK_CACHE = true;

    let
        labels = {};

    this.load = (cb)=>{
        let
            xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = ()=>{
            if (xmlhttp.readyState == 4)
                if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                    labels = JSON.parse(xmlhttp.responseText);
                    for (let k in METADATA)
                        labels[k] = { EN:METADATA[k] };
                    cb();
                }
            else cb();
        };
        xmlhttp.open("GET", resources+(BREAK_CACHE?"?"+Math.random():""), true);
        xmlhttp.send();
    }

    this.translate=(language,label)=>{
        let
            labelData = labels[label];
        if (labelData) {
            if (labelData[language]!=undefined) {
                let
                    translated = labelData[language];
                if (Array.isArray(translated))
                    translated = translated[Math.floor(Math.random()*translated.length)];
                return translated;
            } else {
                console.warn("Missing",language,"translation for label",label,labelData);
                return "{???:LANGUAGE}";
            }
        } else {
            console.warn("Missing label",label);
            return "{???:LABEL}";
        }
    }

}