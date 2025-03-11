function runInterface() {

	const
		FOOTER = "<a href='"+METADATA.gameUrl+"'>"+METADATA.gameName+"</a> - "+METADATA.gameVersion+" - &copy; "+METADATA.gameYear+" by "+METADATA.gameAuthor+" - <a href='learn.html' target=_blank>What is this?</a> -  <a href='"+METADATA.gameDiscord+"' target=_blank>Discord</a> - Sources at <a href='https://"+METADATA.gameSources+"' target=_blank>"+METADATA.gameSources+"</a>";
        SAVEDDATAID = "ALEAOPTIMA",
		LANGUAGE = "EN";

	let
		// --- UI
		busy = false,
		talkBox = document.getElementById("talkbox"),
		talkBoxContent = document.getElementById("talkboxcontent"),
		notesBox = document.getElementById("notesbox"),
		leftPanel = document.getElementById("leftpanel"),
		rightPanel = document.getElementById("rightpanel"),
		inputBoard = document.getElementById("inputboard"),
		inputBoardTitle = document.getElementById("inputboardtitle"),
		inputBoardYes = document.getElementById("inputboardyes"),
		inputBoardYesButton = document.getElementById("inputboardyesbutton"),
		inputBoardNoButton = document.getElementById("inputboardnobutton"),
		inputBoardNo = document.getElementById("inputboardno"),
		inputBoardInput = document.getElementById("inputboardinput"),
		leftPanelTitle = document.getElementById("leftpaneltitle"),
		leftPanelDescription = document.getElementById("leftpaneldescription"),
		rightPanelTitle = document.getElementById("rightpaneltitle"),
		rightPanelDescription = document.getElementById("rightpaneldescription"),
		yesNoBoard = document.getElementById("yesnoboard"),
		yesNoYes = document.getElementById("yesnoyes"),
		yesNoNo = document.getElementById("yesnono"),
		yesButton = document.getElementById("yesbutton"),
		noButton = document.getElementById("nobutton"),
		logo =  document.getElementById("logo"),
		pencil =  document.getElementById("pencil"),
		eraser =  document.getElementById("eraser"),
		startBoard = document.getElementById("startboard"),
		startButton = document.getElementById("startbutton"),
		startBoardButton = document.getElementById("startboardbutton"),
		footer = document.getElementById("footer"),

		destinations = {
			leftPanel:"",
			rightPanel:"",
			yes:"",
			no:"",
			inputBoardYes:"",
			inputBoardNo:"",
			start:""
		},
        savedData,

		// --- Generator
		game = new Game(""),
		generatorData = {};

	yesNoYes.innerHTML = "Yes";
	yesNoNo.innerHTML = "No";
	startBoardButton.innerHTML = "Start";
	footer.innerHTML = FOOTER;

    if (localStorage[SAVEDDATAID]) {
        try {
            savedData = JSON.parse(localStorage[SAVEDDATAID]);
        } catch (e) {
            savedData = 0;
        }
    }

    if (!savedData)
        savedData = {};

    if (!savedData.ascensions)
        savedData.ascensions = {};

    if (!savedData.ascensionTimes)
        savedData.ascensionTimes = 0;

    function saveData() {
        localStorage[SAVEDDATAID] = JSON.stringify(savedData);
    }

	function onInteraction(interaction) {

		if (!busy) {

			let
				delay = 950,
				modes = {
					talkBox:"talkbox ",
					notesBox:"notesbox ",
					inputBoard:"board ",
					leftPanel:"left panel ",
					rightPanel:"right panel ",
					yesNoBoard:"yesno board ",
					startBoard:"start board ",
					logo:"logo disappear",
					pencil:"hidden",
					eraser:"hidden"
				};

			busy = true;

			switch (interaction) {
				case "start":{
					modes.talkBox+="leave";
					modes.logo="logo hidden";

					game.load(()=>{
						setTimeout(()=>{
							busy = false;
							onInteraction("logo");
						},500);
					});
					break;
				}
				case "logo":{
					modes.talkBox+="leave";
					modes.logo="logo appear";
					modes.startBoard+="bottom";
					destinations.start = "endlogo";
					modes.pencil="";
					modes.eraser="";
					break;
				}
				case "endlogo":{
					delay = 0;

					modes.talkBox+="leave";
					game.load(()=>{
						setTimeout(()=>{
							busy = false;
							onInteraction("load");
						},2500);
					});
					break;
				}
				case "load":{
					delay = 0;

					talkBoxContent.innerHTML = "Loading...";
					modes.talkBox+="progress";
					game.load(()=>{
						setTimeout(()=>{
							busy = false;
							onInteraction("intro");
						},1000);
					});
					break;
				}
				case "intro":{
					delay = 0;

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiWelcome");
					setTimeout(()=>{
						busy = false;
						onInteraction("select");
					},2000);
					break;
				}
				case "select":{

					generatorData = {};

					modes.talkBox+="top";
					modes.leftPanel+="show";
					modes.rightPanel+="show";

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiWhoAreYou");

					leftPanelTitle.innerHTML = game.translate(LANGUAGE,"uiANewBorn");
					leftPanelDescription.innerHTML = game.translate(LANGUAGE,"uiANewBornDescription");
					destinations.leftPanel = "newborn";

					rightPanelTitle.innerHTML = game.translate(LANGUAGE,"uiATraveler");
					rightPanelDescription.innerHTML = game.translate(LANGUAGE,"uiATravelerDescription");
					destinations.rightPanel = "travel";
					break;
				}

				// --- Be Born

				case "newborn":{
					modes.talkBox+="top";
					modes.notesBox+="show";
					modes.inputBoard+="show";

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiWhereBorn");
					notesBox.innerHTML = game.translate(LANGUAGE,"uiWhereBornTip");

					inputBoardTitle.innerHTML = game.translate(LANGUAGE,"uiWhereBornWorldName");
					inputBoardInput.setAttribute("placeholder", game.translate(LANGUAGE,"uiWhereBornInputPlaceholder"));
					inputBoardInput.value = generatorData.worldName || "";

					inputBoardYes.innerHTML = game.translate(LANGUAGE,"uiWhereBornYes");
					destinations.inputBoardYes = "newbornconfirm";

					inputBoardNo.innerHTML = game.translate(LANGUAGE,"uiWhereBornNo");
					destinations.inputBoardNo = "select";
					break;
				}
				case "newbornconfirm":{

					generatorData.worldName = inputBoardInput.value;
					generatorData.worldSeed = game.stringToSeedText(generatorData.worldName);

					modes.talkBox+="confirm";
					modes.yesNoBoard+="show";
					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiBornConfirm").replace(/\[name\]/g,generatorData.worldSeed);

					destinations.no = "newborn";
					destinations.yes = "newborngenerate";
					break;
				}
				case "newborngenerate":{
					delay = 0;

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiCreatingWorld");
					modes.talkBox+="progress";

					notesBox.innerHTML = game.translate(LANGUAGE,"uiBornCreatingTip");
					modes.notesBox+="show";
				
					game.generateWorld(LANGUAGE,generatorData.worldSeed,0,()=>{
						busy = false;
						onInteraction("newborngo");
					})
					break;
				}
				case "newborngo":{

					modes.talkBox+="confirm";
					modes.yesNoBoard+="show";
					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiBornReady");

					destinations.no = "select";
					destinations.yes = "newbornwait";
					break;
				}
				case "newbornwait":{
					delay = 0;

					talkBoxContent.innerHTML = "";
					setTimeout(()=>{
						busy = false;
						onInteraction("newborndone");
					},1500);
					break;
				}
				case "newborndone":{
					delay = 0;

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiSeeYou");

					notesBox.innerHTML = game.translate(LANGUAGE,"uiBornTip");
					modes.notesBox+="show";
					modes.pencil="";
					modes.eraser="";

					game.born();
					setTimeout(()=>{
						busy = false;
						onInteraction("select");
					},6000);
					break;
				}

				// --- Travel

				case "travel":{
					modes.talkBox+="top";
					modes.notesBox+="show";
					modes.inputBoard+="show";

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiWhereTravel");
					notesBox.innerHTML = game.translate(LANGUAGE,"uiWhereTravelTip");

					inputBoardTitle.innerHTML = game.translate(LANGUAGE,"uiWhereTravelWorldName");
					inputBoardInput.setAttribute("placeholder", "");
					inputBoardInput.value = generatorData.worldName || "";

					inputBoardYes.innerHTML = game.translate(LANGUAGE,"uiWhereTravelYes");
					destinations.inputBoardYes = "travelconfirm";

					inputBoardNo.innerHTML = game.translate(LANGUAGE,"uiWhereTravelNo");
					destinations.inputBoardNo = "select";
					break;
				}
				case "travelconfirm":{

					generatorData.worldName = inputBoardInput.value;
					generatorData.worldSeed = game.stringToSeedText(generatorData.worldName);

					modes.talkBox+="confirm";
					modes.yesNoBoard+="show";
					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelConfirm").replace(/\[name\]/g,generatorData.worldSeed);

					destinations.no = "travel";
					destinations.yes = "travelgenerate";
					break;
				}
				case "travelgenerate":{
					delay = 0;

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiCreatingWorld");
					modes.talkBox+="progress";

					notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelCreatingTip");
					modes.notesBox+="show";

                    generatorData.endingsCount = game.getEndingsCount();
                    generatorData.newAscension = false;

                    if (savedData.ascensions[generatorData.worldSeed] === undefined) {
                        if (savedData.ascensionTimes < generatorData.endingsCount) {
                            generatorData.newAscension = true;
                            generatorData.ascensionTime = savedData.ascensionTimes;
                        } else
                            generatorData.ascensionTime = generatorData.endingsCount-1;
                    } else {
                        generatorData.ascensionTime = savedData.ascensions[generatorData.worldSeed];
                        if (generatorData.ascensionTime >= generatorData.endingsCount)
                            generatorData.ascensionTime = generatorData.endingsCount-1;
                    }

					game.generateWorld(LANGUAGE,generatorData.worldSeed,generatorData.ascensionTime,()=>{
						busy = false;
						onInteraction("travelaskregion");
					})
					break;
				}
				case "travelaskregion":{
					modes.talkBox+="top";
					modes.notesBox+="show";
					modes.inputBoard+="show";

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelRegion");
					notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelRegionTip");

					inputBoardTitle.innerHTML = game.translate(LANGUAGE,"uiTravelRegionCode");
					inputBoardInput.setAttribute("placeholder", "");
					inputBoardInput.value = generatorData.regionCode || "";

					inputBoardYes.innerHTML = game.translate(LANGUAGE,"uiTravelRegionYes");
					destinations.inputBoardYes = "travelaskregionconfirm";

					inputBoardNo.innerHTML = game.translate(LANGUAGE,"uiTravelRegionNo");
					destinations.inputBoardNo = "select";
					break;
				}
				case "travelaskregionconfirm":{
					let
						destination;

					delay = 0;

					generatorData.regionCode = inputBoardInput.value.toUpperCase().trim();

					if (game.isRegionValid(generatorData.regionCode)) {
						destination = "travelaskdirection";
						talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelRegionFound");
					} else {
						destination = "travelaskregion";
						talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelRegionNotFound");
						notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelRegionNotFoundTip");
						modes.notesBox+="show";
					}
					
					setTimeout(()=>{
						busy = false;
						onInteraction(destination);
					},2000);
					break;
				}
				case "travelaskdirection":{
					modes.talkBox+="top";
					modes.notesBox+="show";
					modes.inputBoard+="show";

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelDestination");
					notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationTip");

					inputBoardTitle.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationCode");
					inputBoardInput.setAttribute("placeholder", "");
					inputBoardInput.value = generatorData.directionCode || "";

					inputBoardYes.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationYes");
					destinations.inputBoardYes = "travelaskdirectionconfirm";

					inputBoardNo.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationNo");
					destinations.inputBoardNo = "select";
					break;
				}
				case "travelaskdirectionconfirm":{
					let
						destination,
						directionId;

					delay = 0;

					generatorData.directionCode = inputBoardInput.value.toUpperCase().trim();
					directionId = game.getRegionCodeDirectionId(generatorData.regionCode,generatorData.directionCode);

					if (directionId) {
						if (directionId == "ascend") {
							modes.talkBox+="excited";
							destination = "travelascend";
                            talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationAscend");
						} else {
                            generatorData.isAscension = false;
							destination = "travelgo";
							talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationOk");
						}
					} else {
						destination = "travelaskdirection";
						talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationFail");
						notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelDestinationFailTip");
						modes.notesBox+="show";
					}
					
					setTimeout(()=>{
						busy = false;
						onInteraction(destination);
					},2000);
					break;
				}
				case "travelgo":{
					modes.talkBox+="confirm";
					modes.yesNoBoard+="show";
					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelReady");

					destinations.no = "select";
					destinations.yes = "travelwait";
					break;
				}
				case "travelascend":{
					modes.talkBox+="confirm excited";
					modes.yesNoBoard+="show";
                    if (generatorData.ascensionTime)
					    talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelAscendAgainReady");
                    else
                        talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiTravelAscendReady");

					destinations.no = "select";
					destinations.yes = "travelwait";
					break;
				}
				case "travelwait":{
					delay = 0;

					talkBoxContent.innerHTML = "";
					setTimeout(()=>{
						busy = false;
						onInteraction("traveldone");
					},1500);
					break;
				}
				case "traveldone":{
					delay = 0;

					talkBoxContent.innerHTML = game.translate(LANGUAGE,"uiSeeYou");

					notesBox.innerHTML = game.translate(LANGUAGE,"uiTravelTip");
					modes.notesBox+="show";
					modes.pencil="";
					modes.eraser="";

					game.travel(generatorData.regionCode,generatorData.directionCode);
                    if (generatorData.newAscension) {
                        savedData.ascensions[generatorData.worldSeed] = generatorData.ascensionTime;
                        savedData.ascensionTimes++;
                        saveData();
                    }

					setTimeout(()=>{
						busy = false;
						onInteraction("select");
					},6000);
					break;
				}
					
			}

			talkBox.className = modes.talkBox;
			notesBox.className = modes.notesBox;
			inputBoard.className = modes.inputBoard;
			leftPanel.className = modes.leftPanel;
			rightPanel.className = modes.rightPanel;
			yesNoBoard.className = modes.yesNoBoard;
			logo.className = modes.logo;
			startBoard.className = modes.startBoard;
			pencil.className = modes.pencil;
			eraser.className = modes.eraser;

			if (delay)
				setTimeout(()=>{
					busy = false;
				},delay);
		}

	}
	
	leftPanel.onclick=()=>{
		onInteraction(destinations.leftPanel);
	}

	rightPanel.onclick=()=>{
		onInteraction(destinations.rightPanel);
	}

	yesButton.onclick=()=>{
		onInteraction(destinations.yes);
	}

	noButton.onclick=()=>{
		onInteraction(destinations.no);
	}

	startButton.onclick=()=>{
		onInteraction(destinations.start);
	}

	inputBoardYesButton.onclick=()=>{
		onInteraction(destinations.inputBoardYes);
	}

	inputBoardNoButton.onclick=()=>{
		onInteraction(destinations.inputBoardNo);
	}

	onInteraction("start");

	document.body.onresize = ()=>{
		document.body.scrollLeft = 0;
		document.body.scrollTop = 0;
	}
}
