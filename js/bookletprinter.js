
function BookletPrinter(svg, printMode) {

    const
        WORDSPACING=0.5,
        LINESPACING=-0.2,
        TEXTGAP=0.9,
        EMPTYLINESIZE=1,
        PAGES = {
            settings:{
                modelId:"defaultText",
                wordSpacing:WORDSPACING,
                boldWordSpacing:WORDSPACING,
                italicWorldSpacing:WORDSPACING,
                fantasyWorldSpacing:WORDSPACING,
                lineSpacing:LINESPACING,
                textGap:TEXTGAP,
                verticalAlignment:"top",
                horizontalAlignment:"left"
            },
            models:{
                bookletManual:{
                    pages:[
                        {
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:148.500,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:148.500,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:105,
                            angle:0
                        }
                    ],
                    remove:[ "page-borders", "page-pamphlet", "page-pamphlet-manual" ]
                },
                bookletRegion:{
                    pages:[
                        {
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:148.500,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:105,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:148.500,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:5,
                            angle:180
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:105,
                            angle:0
                        }
                    ],
                    remove:[ "page-borders", "page-pamphlet", "page-pamphlet-manual" ]
                },
                pamphletManual:{
                    pages:[
                        {
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:5,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:5,
                            y:105,
                            angle:0
                        },{
                            id:"column",
                            contentId:"columnContent",
                            x:76.750,
                            y:5,
                            angle:0
                        },{
                            id:"column",
                            contentId:"columnContent",
                            x:148.500,
                            y:5,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:5,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:220.250,
                            y:105,
                            angle:0
                        }
                    ],
                    remove:[ "page-borders", "page-edges", "page-pamphlet" ]
                },
                pamphletRegion:{
                    pages:[
                        {
                            id:"column",
                            contentId:"columnContent",
                            x:5,
                            y:5,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:5,
                            angle:0
                        },{
                            id:"page",
                            contentId:"pageContent",
                            x:76.750,
                            y:105,
                            angle:0
                        },{
                            id:"column",
                            contentId:"columnContent",
                            x:148.500,
                            y:5,
                            angle:0
                        },{
                            id:"column",
                            contentId:"columnContent",
                            x:220.250,
                            y:5,
                            angle:0
                        }
                    ],
                    remove:[ "page-borders", "page-edges", "page-pamphlet-manual" ]
                }
            }
        };

    let
        SIZERATIO = 1,
        ITALICSPACING = 0,
        FANTASYSPACING = 0,
        FANTASYYGAP = 0.5,
        root = svg.node.getElementsByTagName("svg")[0];
        bboxWidth = root.getBBox().width;

    // Firefox gets different sizes

    if (bboxWidth>10000) {
        SIZERATIO = 0.01;
        ITALICSPACING = -1.4;
    }

    function cloneNodeBy(into,id,newid,dx,dy,rotate,flipx,before) {
        let
            org,
            edgex=0,
            edgey=0,
            edgewidth=0,
            edge,
            ex,
            ey;

        if (typeof id == "string") org=svg.getById(id);
        else org=id;

        const
            copy=svg.copyNode(org);

        if (newid) svg.setId(copy,newid);

        for (let i=0;i<copy.childNodes.length;i++)
            if (copy.childNodes[i].setAttribute) {
                let node=copy.childNodes[i];
                node.removeAttribute("transform");
                if (!edge && (node.tagName=="rect")) {
                    edge=node;
                    edgex=svg.getNum(node,"x");
                    edgey=svg.getNum(node,"y");
                    edgewidth=svg.getNum(node,"width");
                    edgeheight=svg.getNum(node,"height");
                }
            }

        ex=dx-edgex;
        ey=dy-edgey;
        svg.moveNodeAt(copy,0,0);

        if (rotate)
            copy.setAttribute("transform","translate("+ex+","+ey+") rotate("+rotate+","+(edgex+edgewidth/2)+","+(edgey+edgeheight/2)+")");
        else if (flipx)
            copy.setAttribute("transform","translate("+(ex+edgex*2+edgewidth)+","+ey+") scale(-1,1)");
        else
            copy.setAttribute("transform","translate("+ex+","+ey+")");

        if (edge) copy.removeChild(edge);

        if (before)
            svg.insertBefore(before,copy);
        else if (into)
            into.appendChild(copy);
        else
            svg.insertBefore(org,copy);

        return copy;
    }

    function measureNode(node) {
        let box=node.getBBox();
        return {
            x:box.x*SIZERATIO,
            y:box.y*SIZERATIO,
            width:box.width*SIZERATIO,
            height:box.height*SIZERATIO
        };
    }

    function pagesPrint(pageModels,startPage,text) {

        text=text+"";

        let
            settings = pageModels.settings,
            orgTextNode=svg.getById(settings.modelId),
            normalTextNode=cloneNodeBy(0,orgTextNode,0,0,0),
            boldTextNode=cloneNodeBy(0,orgTextNode,0,0,0),
            italicTextNode=cloneNodeBy(0,orgTextNode,0,0,0),
            fantasyTextNode=cloneNodeBy(0,orgTextNode,0,0,0),
            horizontalAlignment=settings.horizontalAlignment,
            wordSpacing=settings.wordSpacing,
            nextWordSpacing=settings.wordSpacing,
            word="",
            lines=[],
            lineId=-1,
            cursorX=0,
            cursorY=0,
            oy=0,
            lineHeight=0,
            contentWidth=0,
            contentHeight=0,
            tag=false,
            bold=false,
            italic=false,
            fantasy=false,
            i=0,
            isDirty,
            currentPage=startPage,
            printFailed = false,
            wordWrap = true,
            multiPage = true,
            minColSpacing,
            x, y,
            pageX, pageY,
            page;

        let newPage=()=>{
            let
                placeHolder,
                nextPage = pageModels.models[printMode].pages[currentPage];
            if (nextPage) {
                page=cloneNodeBy(0,nextPage.id,0,nextPage.x,nextPage.y,nextPage.angle);
                currentPage++;
                placeHolder = getPlaceholder(nextPage.contentId,page);
                width = placeHolder.width;
                height = placeHolder.height;
                pageX = x = placeHolder.x;
                pageY = y = placeHolder.y;
                isDirty = false;
            } else {
                printFailed = true;
                x = 0;
                y = 0;
            }
        }

        let renderPage=()=>{
            
            switch (settings.verticalAlignment) {
                case "center":{
                    oy=y+(height-contentHeight)/2;
                    break;
                }
                case "bottom":{
                    oy=y+(height-contentHeight);
                    break;
                }
                default:{
                    oy=y;
                }
            }
    
            lines.forEach(line=>{
                let ox=0;
                switch (line.horizontalAlignment) {
                    case "center":{
                        ox=x+(width-line.width)/2;
                        break;
                    }
                    case "right":{
                        ox=x+width-line.width;
                        break;
                    }
                    default:{
                        ox=x;
                    }
                }
                line.boxes.forEach(box=>{
                    let
                        dx=box.x+ox,
                        dy=oy+line.y+(line.height-box.size.height)/2;
                    if (box.text) {
                        let node=cloneNodeBy(page,orgTextNode,0,dx,dy+box.size.height-settings.textGap+box.dy);
                        disableKerning(node);
                        svg.setText(node,box.text);
                        if (box.bold) setBold(node);
                        else if (box.italic) setItalic(node);
                        else if (box.fantasy) setFantasy(node);
                    }
                    if (box.symbol)
                        cloneNodeBy(page,box.symbol,0,dx,dy);
                });
                
            });

            lines.length = 0;
        }

        let disableKerning=(node)=>{
            node.setAttribute("style",node.getAttribute("style")+";font-kerning: none;");
        }

        let measureSymbol=(node)=>{
            let
                rect=node.querySelector("rect");
            if (rect)
                return measureNode(rect);
        }

        let setBold=(node)=>{
            let span=node.querySelector("tspan");
            span.setAttribute("style",span.getAttribute("style").replace(/font-family:[^;]+/,"font-family:Utmtimesbold"));
            span.setAttribute("style",span.getAttribute("style").replace(/font-size:[0-9\.]*/,"font-size:2.70"));
            // span.setAttribute("style",span.getAttribute("style").replace("font-weight:normal","font-weight:bold"));
        }

        let setItalic=(node)=>{
            let span=node.querySelector("tspan");
            span.setAttribute("style",span.getAttribute("style").replace(/font-family:[^;]+/,"font-family:Utmtimesitalic"));
            span.setAttribute("style",span.getAttribute("style").replace("font-style:normal","font-style:italic"));
            span.setAttribute("style",span.getAttribute("style").replace(/font-size:[0-9\.]*/,"font-size:2.70"));
        }

        let setFantasy=(node)=>{
            let span=node.querySelector("tspan");
            span.setAttribute("style",span.getAttribute("style").replace(/font-family:[^;]+/,"font-family:LswDrachenklaueRegular"));
            span.setAttribute("style",span.getAttribute("style").replace(/font-size:[0-9\.]*/,"font-size:2.90"));
            span.setAttribute("style",span.getAttribute("style")+";letter-spacing:0");
        }

        let printWord=()=>{
            if (word) {
                let node=0;
                if (tag) {
                    let parts=word.split(" ");
                    switch (parts[0]) {
                        case "symbol":{
                            node={
                                symbol:parts[1],
                                size:measureSymbol(svg.getById(parts[1]))
                            }
                            break;
                        }
                        case "sticker":{
                            cloneNodeBy(page,svg.getById(parts[1]),0,pageX+parseFloat(parts[2]),pageY+parseFloat(parts[3]),0,!!parts[4]);
                            break;
                        }
                        case "space":{
                            node={
                                size:{
                                    width:parseFloat(parts[1]),
                                    height:1
                                }
                            }
                            break;
                        }
                        case "moveup":{
                            cursorY-=parseFloat(parts[1]);
                            break;
                        }
                        case "bold":{
                            bold=true;
                            break;
                        }
                        case "endbold":{
                            bold=false;
                            break;
                        }
                        case "italic":{
                            italic=true;
                            break;
                        }
                        case "enditalic":{
                            italic=false;
                            break;
                        }
                        case "fantasy":{
                            fantasy=true;
                            break;
                        }
                        case "endfantasy":{
                            fantasy=false;
                            break;
                        }
                        case "tab":{
                            let
                                dx = width/2,
                                distance = dx - cursorX;
                            if ((minColSpacing === undefined) || (distance<minColSpacing))
                                minColSpacing = distance;
                            cursorX = width/2;
                            break;
                        }
                        case "nowordwrap":{
                            wordWrap = false;
                            break;
                        }
                        case "wordwrap":{
                            wordWrap = true;
                            break;
                        }
                        case "nomultipage":{
                            multiPage = false;
                            break;
                        }
                        case "multipage":{
                            multiPage = true;
                            break;
                        }
                        case "left":
                        case "right":
                        case "center":{
                            horizontalAlignment = parts[0];
                            if (lines.length)
                                lines[lines.length-1].horizontalAlignment = parts[0];
                            break;
                        }
                        case "moveback":{
                            cursorX-=parseFloat(parts[1]);
                            if (cursorX<0)
                                cursorX = 0;
                            break;
                        }
                    }
                } else {
                    let
                        size,
                        dy = 0;
                    if (bold) {
                        nextWordSpacing=settings.boldWordSpacing;
                        svg.setText(boldTextNode,word);
                        size=measureNode(boldTextNode);
                    } else if (italic) {
                        nextWordSpacing=settings.italicWorldSpacing+ITALICSPACING;
                        svg.setText(italicTextNode,word);
                        size=measureNode(italicTextNode);
                    } else if (fantasy) {
                        nextWordSpacing=settings.fantasyWorldSpacing+FANTASYSPACING;
                        svg.setText(fantasyTextNode,word);
                        size=measureNode(fantasyTextNode);
                        dy = FANTASYYGAP;
                    } else {
                        nextWordSpacing=settings.wordSpacing;
                        svg.setText(normalTextNode,word);
                        size=measureNode(normalTextNode);
                    }
                    node={
                        text:word,
                        bold:bold,
                        italic:italic,
                        fantasy:fantasy,
                        size:size,
                        dy:dy
                    };
                }
                if (node) {
                    if (cursorX) cursorX+=wordSpacing;
                    wordSpacing = nextWordSpacing;
                    if (wordWrap && (cursorX+node.size.width>width))
                        newLine();
                    if (multiPage && isDirty && (cursorY+node.size.height>height)) {
                        renderPage();
                        newPage();
                        lineId=-1;
                        cursorX=0;
                        cursorY=0;
                        newLine();
                    }
                    node.x=cursorX;
                    lines[lineId].boxes.push(node);
                    lineHeight=Math.max(lineHeight,node.size.height);
                    cursorX+=node.size.width;
                    isDirty = true;
                }
                word="";
            }
        }

        let closeLine=()=>{
            lines[lineId].width=cursorX;
            lines[lineId].height=lineHeight;
            contentWidth=Math.max(contentWidth,cursorX);
        }

        let newLine=()=>{
            if (lineId!=-1) closeLine();
            lineId++;
            if (lineId>0) cursorY+=(lineHeight||EMPTYLINESIZE)+settings.lineSpacing;
            cursorX=0;
            lineHeight=0;
            lines.push({
                horizontalAlignment:horizontalAlignment,
                y:cursorY,
                width:0,
                height:0,
                boxes:[]
            });
            
        }

        disableKerning(normalTextNode);
        disableKerning(boldTextNode);
        disableKerning(italicTextNode);

        setBold(boldTextNode);
        setItalic(italicTextNode);
        setFantasy(fantasyTextNode);

        if (!page)
            newPage();

        newLine();

        while (i<text.length) {
            let ch=text[i];
            switch (ch) {
                case " ":{
                    if (tag) word+=ch;
                    else printWord();
                    break;
                }
                case "\n":{
                    if (!tag) {
                        printWord();
                        newLine();
                    }
                    break;
                }
                case "{":{
                    printWord();
                    tag=true;
                    break;
                }
                case "}":{
                    if (tag) {
                        printWord();
                        tag=false;
                    } else word+=ch;
                    break;
                }
                default:{
                    word+=ch;
                }
            }
            i++;
        }

        if (word) printWord();
        closeLine();
        contentHeight=cursorY+lineHeight;

        renderPage();

        svg.delete(normalTextNode);
        svg.delete(boldTextNode);
        svg.delete(italicTextNode);
        svg.delete(fantasyTextNode);

        return {
            failed:printFailed,
            fromPage:startPage,
            toPage:currentPage,
            pageHeight:height,
            cursorY:cursorY,
            spaceLeft:height-cursorY,
            minColSpacing:minColSpacing
        };

    }

    function getPlaceholder(id,parent) {
        let
            node=svg.getById(id,parent),
            measure = measureNode(node);
        node.parentNode.removeChild(node);
        return measure;
    }

    this.print=(atPage,booklet)=>{
        return pagesPrint(PAGES,atPage,booklet);
    }

    this.finalize=()=>{
        PAGES.models[printMode].remove.forEach(remove=>{
            svg.deleteById(remove);
        })
    }
    

}
