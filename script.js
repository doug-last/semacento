import { DICIONARIO } from "./palavras.js";

const PALAVRAS = DICIONARIO.map(element => {
    return element.toLowerCase();
})

const QTDE_PAUPITES = 6;
const LETRAS_POR_PALAVRA = 6;
let paupitesRestantes = QTDE_PAUPITES;
let paupiteAtual = [];
let proximaLetra = 0;
let palavraCorreta = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
console.log(palavraCorreta);
// se a palavra conter acentos, buscar denovo na lista
while (palavraCorreta.normalize('NFD') != palavraCorreta) {
     console.log("palavra com acentos, buscando outra")
    palavraCorreta = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
    console.log(palavraCorreta);
}

console.log(PALAVRAS.indexOf(palavraCorreta));

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < QTDE_PAUPITES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 6; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard()
initScoreBoard()

function initScoreBoard() {

    // document.getElementById("scoreboard").innerHTML = "<b> tentativas: </b>"
    if (localStorage.getItem('vitorias') ) {
        document.getElementById("scoreboard").innerHTML = "<b> vitórias: </b>" + localStorage.getItem('vitorias')
    }
}

function insertLetter (pressedKey) {
    if (proximaLetra === LETRAS_POR_PALAVRA) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    let box = row.children[proximaLetra]
    animateCSS(box,"pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    paupiteAtual.push(pressedKey)
    proximaLetra += 1
}
function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    let box = row.children[proximaLetra - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    paupiteAtual.pop()
    proximaLetra -= 1
}


function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    let guessString = ''
    let rightGuess = Array.from(palavraCorreta) 

    for (const val of paupiteAtual) {
        guessString += val
    }

    if (guessString.length != LETRAS_POR_PALAVRA) {
        toastr.error("Faltam letras!")
        return
    }

    // removido exigência de só aceitar palavras no dicionário,
    // talvez re-adicione com algum dicionário mais completo.
    // if (!PALAVRAS.includes(guessString) ) { 
    //     console.log(PALAVRAS.indexOf(guessString))
    //     toastr.error("Palavra não listada!")
    //     return 
    // }

    for (let i = 0; i < 6; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = paupiteAtual[i]
        
        let letterPosition = palavraCorreta.indexOf(paupiteAtual[i])
        // se a letra estiver certa
        if (letterPosition === -1) {
            letterColor = 'SaddleBrown'
        } else {
            //colore de a letra existe ou está na posição correta
            if (paupiteAtual[i] === palavraCorreta[i]) {
                letterColor = 'green'
            } else {
                letterColor = 'yellow' 
            }

            // palavraCorreta[letterPosition] = "#"
            
        }

        let delay = 100 * i
        setTimeout(()=> {
            animateCSS(box,"flipInX")
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === palavraCorreta) {
        toastr.success("Acertou!")
        // localStorage.setItem('vitorias', QTDE_PAUPITES - paupitesRestantes) 
        let vitorias = JSON.parse(localStorage.getItem("vitorias"));
        localStorage.setItem('vitorias',JSON.stringify(1+vitorias))
        paupitesRestantes = 0
        initScoreBoard()

        return
    } else {
        paupitesRestantes -= 1;
        paupiteAtual = [];
        proximaLetra = 0;

        if (paupitesRestantes === 0) {
            toastr.info("Acabo! melhor sorte na próxima")
            toastr.info(`A palavra correta era: "${palavraCorreta}"`)
            removeKeyBoard();
        }
    }
}

function removeKeyBoard() {
    let keyb = document.getElementById("keyboard-cont");
    while (keyb.firstChild) {
        keyb.removeChild((keyb.firstChild));
    }
}

document.addEventListener("keyup", (e) => {

    if (paupitesRestantes === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && proximaLetra !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-zA-Z]/gi)
    if (!found || found.length > 1 || pressedKey.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del" || key === "<") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});