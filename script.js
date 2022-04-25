import { DICIONARIO } from "./palavras.js";

const PALAVRAS = DICIONARIO.map(element => {
    return element.toLowerCase();
})

const QTDE_PAUPITES = 6;
const LETRAS_POR_PALAVRA = 6;
let paupitesRestantes = QTDE_PAUPITES;
let paupiteAtual = [];
var proximaLetra = 0;
var palavraCorreta = JSON.parse(localStorage.getItem("palavraCorreta"))

function novaPalavra() {
    let palavraCorreta = "Ç";
    // se a palavra conter acentos, buscar denovo na lista
    while (palavraCorreta.normalize('NFD') != palavraCorreta) {
        console.log("buscando outra palavra")
        palavraCorreta = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
        console.log(palavraCorreta);
    }
    return palavraCorreta;
}

if (!verificaValidade()) { //se a validade expirou, troca a palavra.
    localStorage.setItem( 'palavraCorreta',JSON.stringify(novaPalavra() ) )
    palavraCorreta = JSON.parse(localStorage.getItem("palavraCorreta"))
}
if (JSON.parse(localStorage.getItem("terminou")) ){
    console.log("terminou, removendo teclado")
    removeKeyBoard()
}

function atualizarJogo() {
    if (!verificaValidade()) //atualiza somente se a palavra mudou.
        location.reload();
}


function verificaValidade() { //só troca palavra se tiver expirada/inválida
    if ( 
         (Number(JSON.parse(localStorage.getItem("validadeData"))) == new Date().getDate())
         && ( Number(JSON.parse(localStorage.getItem("validadeHora"))) == new Date().getHours() )
         && ( JSON.parse(localStorage.getItem("palavraCorreta")) == palavraCorreta )
         && ( JSON.parse(localStorage.getItem("palavraCorreta") ) )
         ) {
            console.log("ainda válido: " + JSON.parse(localStorage.getItem("validadeData")) +" h "+JSON.parse(localStorage.getItem("validadeHora")) + " p: " + JSON.parse(localStorage.getItem("palavraCorreta"))  )
            return true; //retorna true caso esteja válida
    } else {
        localStorage.setItem( 'validadeData',JSON.stringify( new Date().getDate() ) )
        localStorage.setItem( 'validadeHora',JSON.stringify( new Date().getHours() ) )
        localStorage.setItem( 'terminou',JSON.stringify(false ) )
        localStorage.removeItem("paupites");
        console.log("nova validade: " + JSON.parse(localStorage.getItem("validadeData")) +" h "+JSON.parse(localStorage.getItem("validadeHora")) + " p: " )
        return false;
    }
}

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < QTDE_PAUPITES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < LETRAS_POR_PALAVRA; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            box.id=j
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard()
initScoreBoard()


function selecionaLetra(e) {
    desSelecionaTudo()
    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    if (!e) {
        return
    }
    e.style.border = "5px solid"
    let box = row.children[proximaLetra]
    animateCSS(box,"pulse")
}
function desSelecionaTudo() {
    let board = document.getElementById("game-board");
    for (let i=0; i<LETRAS_POR_PALAVRA;i++) {
        let row = board.children[i]
        for (let i = 0; i < 6; i++) {
            row.children[i].style.border = ""
        }
    }
}

document.getElementById("game-board").addEventListener('click', (e) => {
    if (e.target.className == "letter-box" || e.target.className == "letter-box filled-box" ){
        if (e.target.parentNode == document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]) {
            selecionaLetra(e.target)
        }
    }
})
function initScoreBoard() {
    let vitorias = Number(localStorage.getItem('vitorias'))
    let desVitorias = Number(localStorage.getItem('desvitorias'))
    let Jogados = desVitorias+vitorias
    if (vitorias) {
        document.getElementById("scoreboard").innerHTML = "<b> vitórias: </b>" + vitorias  + " em " + Jogados + " jogos."
    }
}

function removeKeyBoard() {
    let keyb = document.getElementById("keyboard-cont");
    while (keyb.firstChild) {
        keyb.removeChild((keyb.firstChild));
    }
    document.getElementById("keyboard-cont").innerHTML = "<b> Palavra correta: </b> <b>" + palavraCorreta + ".</b>" + "<br> Nova palavra a cada hora"
    setInterval(atualizarJogo,10000) 
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
    proximaLetra = Number(proximaLetra)+1
    selecionaLetra(row.children[proximaLetra])
}
function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    if (proximaLetra < LETRAS_POR_PALAVRA && row.children[proximaLetra].classList.contains("filled-box")) {
        var box = row.children[proximaLetra]
        box.textContent = ""
        box.classList.remove("filled-box")
    }
    else
    {
        var box = row.children[proximaLetra -1]
        box.textContent = ""
        box.classList.remove("filled-box")
        proximaLetra -= 1  
    }
    selecionaLetra(box)

}

function checkGuess () {
    desSelecionaTudo()
    let row = document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes]
    let guessString = ''
    //guarda para repreencher caso precise.
    if (paupites.includes(row.textContent)) {
        // console.log("já contem, cancelando")
        // return;
    }else {
        paupites.push(row.textContent)
        localStorage.setItem("paupites",JSON.stringify(paupites));
        paupites = JSON.parse(localStorage.getItem("paupites"));
    }
    for (const val of row.textContent) {
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
        let letter = row.textContent[i]
        
        let letterPosition = palavraCorreta.indexOf(row.textContent[i])
        // se a letra estiver certa
        if (letterPosition === -1) {
            letterColor = 'SaddleBrown'
        } else {
            //colore de a letra existe ou está na posição correta
            if ( row.textContent[i]         === palavraCorreta[i]) {
                letterColor = 'green'
            } else {
                letterColor = 'yellow' 
            }

        }
        let delay = 100 * i
        setTimeout(()=> {
            animateCSS(box,"flipInX")
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === palavraCorreta )  {
        toastr.success("Acertou!")
        let vitorias = JSON.parse(localStorage.getItem("vitorias"));

        paupitesRestantes = 0
        
        if ( !(JSON.parse(localStorage.getItem("terminou"))==true) ) {
            localStorage.setItem( 'terminou',JSON.stringify(true ) )
            localStorage.setItem('vitorias',JSON.stringify(1+vitorias));
        }
        
        removeKeyBoard()
        initScoreBoard()

        return
    } else {
        paupitesRestantes -= 1;
        paupiteAtual = [];
        proximaLetra = 0;

        if (paupitesRestantes === 0) {
            localStorage.setItem( 'terminou',JSON.stringify(true ) )
            toastr.info("Acabo! melhor sorte na próxima")
            toastr.info(`A palavra correta era: "${palavraCorreta}"`)
            if ( !(JSON.parse(localStorage.getItem("terminou"))==true) ) {
                localStorage.setItem('desvitorias',JSON.stringify(1+JSON.parse(localStorage.getItem("desvitorias"))));
            }
            removeKeyBoard();
            return
        }
    }
    selecionaLetra(document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes].children[proximaLetra])
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

document.getElementById("game-board").addEventListener("click", (eb) => {
    if (eb.target.id >= 0) {
        proximaLetra=eb.target.id
    }
    return
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

selecionaLetra(document.getElementsByClassName("letter-row")[LETRAS_POR_PALAVRA - paupitesRestantes].children[proximaLetra])

var paupites = JSON.parse(localStorage.getItem("paupites") )
if ( paupites == null || paupites.length <0) {
    paupites = []
}
// console.log(paupites);
preencherPaupites()
function preencherPaupites() {
    if (!paupites || paupites.length<0)
        return;
    for (let val of paupites) {
        for (let i = 0; i < val.length;i++)
        {
            insertLetter(val[i])
        } 
        checkGuess()
    }
}