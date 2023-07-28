const testWordList = ["Apple","Aboon","Admix","Agony","Alack","Allee","Ambry","Amide","Amigo","Amole","Ankle","Anole","Apeek","Argle","Arson","Aviso","Azure","Bilge","Biner","Blain","Blent","Blini","Blite","Boche","Bogle","Borty","Bourg","Bouse","Bract","Brail","Bream","Brume","Burgh","Caput","Carny","Cedis","Cello","Chary","Chela","Chide","Chine","Chive","Chrom","Chyle","Cibol","Clang","Claro","Clefs","Cline","Clove","Clupe","Coati","Coder","Coign","Canoe","Enoch","Cooee","Corgi","Cotta","Couth","Crake","Crone","Cruse","Crypt","Cubeb","Cubit","Cupid","Cusks","Cutty","Cymae","Cymar","Cyton","Dashi","Decry","Derat","Dhole","Dizen","Djinn","Dolce","Donut","Dower","Duple","Duvet","Eclat","Edema","Elain","Emeer","Enate","Elise","Epact","Ephas","Erode","Erugo","Angel","Jonas","Fable","Fiche","Flair","Flong","Flume","Fluty","Gamic", "Gaper", "Gator", "Gault", "Gauze", "Gavel", "Giddy", "Gismo", "Gleet", "Glint"];

let wordList = {valid: [], playable: []};

const rating = {
    unknown: 0,
    incorrect: 1,
    present: 2,
    correct: 3,
};

function startGame(round) {
    let {
        attemptCount,
        userAttempts,
        highlightedRows,
        keyboard,
        answer,
        status,
    } = loadOrStartGame();

    while (attemptCount <= round && status === "in-progress") {
        let currentGuess = prompt("Guess a five letter word: ");
        if (isInputCorrect(currentGuess)) {
            const highlightedCharacters = getCharactersHighlight(
                currentGuess,
                answer
            );
            highlightedRows.push(highlightedCharacters);
            keyboard = updateKeyboardHighlights(
                keyboard,
                currentGuess,
                highlightedCharacters
            );
            status = updateGameStatus(
                currentGuess,
                answer,
                attemptCount,
                round - 1
            );
            attemptCount = attemptCount + 1;
            saveGame({
                attemptCount,
                userAttempts,
                highlightedRows,
                keyboard,
                status,
            });
        } else {
            retry(currentGuess);
        }
    }
    if (status === "success") {
        alert("Congratulations");
    } else {
        alert(`The word is ${answer}`);
    }
}

function isInputCorrect(word) {
    return wordList.playable.includes(word) || wordList.valid.includes(word);
}

function retry(word) {
    alert(`${word} is not in word list`);
}

function getCharactersHighlight(word, answer) {
    const charactersArray = word.split("");
    const result = [];

    charactersArray.forEach((character, index) => {
        if (character === answer[index]) {
            result.push("correct");
        } else if (answer.includes(character)) {
            result.push("present");
        } else {
            result.push("absent");
        }
    });

    return result;
}

function getKeyboard() {
    const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");
    const entries = [];
    for (const alphabet of alphabets) {
        entries.push([alphabet, "unknown"]);
    }
    return Object.fromEntries(entries);
}

function updateKeyboardHighlights(
    keyboard,
    currentGuess,
    highlightedCharacter
) {

    const newKeyboard = Object.assign({}, keyboard);

    for (let i = 0; i < highlightedCharacter.length; i++) {
        const character = currentGuess[i];
        const nextStatus = highlightedCharacter[i];
        const nextRating = rating[nextStatus];
        const previousStatus = newKeyboard[character];
        const previousRating = rating[previousStatus];

        if (nextRating > previousRating) {
            newKeyboard[character] = nextStatus;
        }
    }

    return newKeyboard;
}

function updateGameStatus(currentGuess, answer, attemptCount, round) {
    if (currentGuess === answer) {
        return "success";
    }
    if (attemptCount === round) {
        return "failure";
    }
    return "in-progress";
}

function saveGame(gameState) {
    window.localStorage.setItem("WORDLE", JSON.stringify(gameState));
}

function getTodaysAnswer() {
    const offsetFromDate = new Date(2023, 0, 1).getTime();
    const today = new Date().getTime();
    const msOffset = today - offsetFromDate;
    const daysOffset = msOffset / 1000 / 60 / 60 / 24;
    const answerIndex = Math.floor(daysOffset);
    return wordList.playable[answerIndex];
}

function isToday(timestamp) {
    const today = new Date();
    const check = new Date(timestamp);
    return today.toDateString() === check.toDateString();
}

async function loadOrStartGame(debug) {
    wordList = await fetch("./src/fixtures/words.json")
        .then(response => {
            return response.json();
        })
        .then(json => {
            return json;
        });

    let answer;

    if (debug) {
        answer = testWordList[0];
    } else {
        answer = getTodaysAnswer();
    }
    const prevGame = JSON.parse(window.localStorage.getItem("PREFACE_WORDLE"));

    if (prevGame && isToday(prevGame.timestamp)) {
        return {
            ...prevGame,
            answer,
        };
    }
    return {
        attemptCount: 0,
        userAttempts: [],
        highlightedRows: [],
        keyboard: getKeyboard(),
        answer,
        status: "in-progress",
    };
}