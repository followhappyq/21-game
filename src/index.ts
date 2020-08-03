import {
  getCardButton,
  playerEndButton,
  newGame,
  numberOfPlayers,
  gameFieldPlayers,
  cardList,
  playerScore,
  gameField,
  playerName,
  playAgainButton,
  result,
} from "./document"
import { DEFAULT_BASE_VALUE, BaseValueType, CardValues, scoreForWin } from "./const"

interface cardType {
  code: string
  image: string
  images: {
    png: string
    svg: string
  }
  suit: string
  value: string
}

interface IplayersDetails {
  id: number
  cards: Array<any>
  score: number
}

let deckId: string
let playersInGame: number = 1
let player: number = 0
let isPositiveOrZero: boolean = false
const playersDetails: Array<IplayersDetails> = [{ id: 0, cards: [], score: 0 }]

const getDeckId: () => void = async () => {
  const url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  const res = await fetch(url)
  if (res.ok) {
    const data = await res.json()
    deckId = data.deck_id
  } else {
    console.log(res.status)
  }
}

const shuffleCard = async (deckId) => {
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`
  const res = await fetch(url)
  if (res.ok) {
    console.log("The cards are shuffled")
  } else {
    console.log(res.status)
  }
}

const onNewGameStarted: () => void = () => {
  getCardButton.classList.remove("hidden")
  playerEndButton.classList.remove("hidden")
  newGame.classList.add("hidden")
  gameFieldPlayers.classList.add("hidden")

  playersInGame = parseInt(numberOfPlayers.value)
  getCard(2, deckId)
}

const getCard: (count: number, deckId: string) => void = async (count, deckId) => {
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`
  const res = await fetch(url)
  if (res.ok) {
    const data = await res.json()
    if (count === 2 && twoAces(data.cards[0], data.cards[1])) {
      data.cards.map((item: cardType) => {
        cardList.innerHTML += `<li class="list__item"><img src="${item.image}" alt="${item.code}"></li>`
      })
      alert("ez")
    } else {
      data.cards.map((item: cardType) => {
        cardList.innerHTML += `<li class="list__item"><img src="${item.image}" alt="${item.code}"></li>`
        addPlayerCard(player, item)
      })
    }
  }
}

const twoAces: (card1: cardType, card2: cardType) => boolean = (card1, card2) => {
  if (card1.value === "ACE" && card2.value === "ACE") {
    return true
  }
  return false
}

const addPlayerCard: (player: number, card: cardType) => void = (player, card) => {
  playersDetails[player].cards.push(card)
  /* const some: CardValues = CardValues[CardValues.[card.value.toLowerCase()]] */
  const cardTitle: any = card.value.toLowerCase()
  playersDetails[player].score += getCardValue(cardTitle)
  changePlayerScore(player)
  checkPlayerScore(playersDetails[player].score)
}

const getCardValue: (key: CardValues, baseValueType?: BaseValueType) => number = (
  key,
  baseValueType = DEFAULT_BASE_VALUE
) => {
  return baseValueType[key]
}

const changePlayerScore: (player: number) => void = (player) => {
  playerScore.innerHTML = playersDetails[player].score.toString()
}

const checkPlayerScore: (score: number) => void = (score) => {
  if (score >= scoreForWin && player === playersInGame - 1) {
    onGameOver()
  }
  if (score >= scoreForWin && player !== playersInGame - 1) {
    nextPlayer()
  }
}

const onGameOver: () => void = () => {
  playAgainButton.classList.remove("hidden")
  getCardButton.classList.add("hidden")
  playerEndButton.classList.add("hidden")
  cardList.classList.add("hidden")

  playersDetails.map((player) => {
    result.insertAdjacentHTML(
      "beforeend",
      `<p style="color:#fff">Player ${player.id + 1} has ${player.score} score.</p>`
    )
  })
  result.insertAdjacentHTML("beforeend", `<h2 style="color:#fff"> Winner</h2>`)
  scoring(playersDetails, isPositiveOrZero).map((player) => {
    result.insertAdjacentHTML(
      "beforeend",
      `<p style="color:#fff">Player ${player.id + 1} won, with ${player.score} score.</p>`
    )
  })
}

const nextPlayer: () => void = () => {
  if (playersDetails[player].score - scoreForWin <= 0) {
    isPositiveOrZero = true
  }
  if (!isPositiveOrZero && player === playersInGame - 2) {
    lastPlayerWon()
  } else {
    cardList.innerHTML = ""
    getCard(2, deckId)
    playersDetails.push({ id: player + 1, cards: [], score: 0 })
    player += 1
    playerName.innerHTML = `${player + 1}`
  }
}

const scoring: (playerDetails: Array<IplayersDetails>, isPositiveOrZer: boolean) => Array<IplayersDetails> = (
  playersDetails,
  isPositiveOrZero
) => {
  let sortedArray
  let winnerArray = []
  if (isPositiveOrZero) {
    sortedArray = playersDetails.filter((player) => player.score - 21 <= 0).sort(sortArray)
    winnerArray.push(sortedArray[0])
  } else {
    sortedArray = playersDetails.filter((player) => player.score - 21 > 0).sort(sortArray)
    winnerArray.push(sortedArray[sortedArray.length - 1])
  }
  return sortedArray.filter((item) => item.score === winnerArray[0].score)
}

const sortArray = (player1, player2) => {
  return player2.score - player1.score
}

const lastPlayerWon: () => void = () => {
  isPositiveOrZero = true
}

const playAgain: () => void = () => {
  playersDetails.length = 0
  playersDetails.push({ id: 0, cards: [], score: 0 })
  player = 0
  isPositiveOrZero = false
  cardList.innerHTML = ""
  result.innerHTML = ""
  cardList.classList.remove("hidden")
  playAgainButton.classList.add("hidden")
  onNewGameStarted()
}

getCardButton.addEventListener("click", () => {
  getCard(1, deckId)
})

playerEndButton.addEventListener("click", () => {
  if (player === playersInGame - 1) {
    onGameOver()
  } else {
    nextPlayer()
  }
})

newGame.addEventListener("click", onNewGameStarted)
playAgainButton.addEventListener("click", playAgain)

window.addEventListener("load", getDeckId)
