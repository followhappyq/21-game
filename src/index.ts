import {
  getCardButton,
  playerEndButton,
  newGame,
  numberOfPlayers,
  gameFieldPlayers,
  cardList,
  playerScore,
  playerName,
  playAgainButton,
  result,
  loading,
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
let playWithBot: boolean = false
let gameWasEnded: boolean = false

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

const shuffleCard: (deckId: string) => void = async (deckId) => {
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
  playerName.innerHTML = "1"

  if (parseInt(numberOfPlayers.value) === 1) {
    playWithBot = true
    playersInGame = 2
  } else {
    playersInGame = parseInt(numberOfPlayers.value)
  }
  getCard(2, deckId)
}

const getCard: (count: number, deckId: string) => void = async (count, deckId) => {
  getCardButton.disabled = true
  let cardCount = count
  loading.classList.add("lds-hourglass")
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`
  const res = await fetch(url)
  if (res.ok) {
    const data = await res.json()
    if (count === 2 && twoAces(data.cards[0], data.cards[1])) {
      data.cards.map((item: cardType) => {
        addPlayerCard(player, item, count)
      })
      loading.classList.remove("lds-hourglass")
      winWithTwoAces()
    } else {
      data.cards.map((item: cardType) => {
        cardCount -= 1
        addPlayerCard(player, item, cardCount)
      })
      getCardButton.disabled = false
      loading.classList.remove("lds-hourglass")
    }
  } else {
    console.log(res.status)
  }
}

const twoAces: (card1: cardType, card2: cardType) => boolean = (card1, card2) => {
  if (card1.value === "ACE" && card2.value === "ACE") {
    return true
  }
  return false
}

const addPlayerCard: (player: number, card: cardType, cardCount: number) => void = (player, card, cardCount) => {
  cardList.innerHTML += `<li class="list__item"><img src="${card.image}" alt="${card.code}" class="list__image"></li>`
  playersDetails[player].cards.push(card)
  const cardTitle: CardValues =
    CardValues[Object.keys(CardValues).find((key) => CardValues[key] === card.value.toLowerCase())]

  playersDetails[player].score += getCardValue(cardTitle)
  if (cardCount === 0) {
    setTimeout(() => {
      checkPlayerScore(playersDetails[player].score)
    }, 400)
  }

  changePlayerScore(player)
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
  if (player === playersInGame - 1) {
    if (!playWithBot && score >= scoreForWin) {
      onGameOver()
    }
    if (playWithBot && (score >= scoreForWin || score === scoreForWin - 1 || score > playersDetails[0].score)) {
      onGameOver()
    }
  }
  if (score >= scoreForWin && player !== playersInGame - 1) {
    alert(playersDetails[player].score)
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

const winWithTwoAces: () => void = () => {
  playAgainButton.classList.remove("hidden")
  getCardButton.classList.add("hidden")
  playerEndButton.classList.add("hidden")
  cardList.classList.add("hidden")
  result.insertAdjacentHTML("beforeend", `<h2 style="color:#fff">This player has got two aces.</h2>`)
}

const nextPlayer: () => void = () => {
  if (playersDetails[player].score - scoreForWin <= 0) {
    isPositiveOrZero = true
  }
  if (playWithBot && playersDetails[player].score - scoreForWin <= 0) {
    onChangePlayer()
    bot()
  } else {
    if (!isPositiveOrZero && player === playersInGame - 2) {
      lastPlayerWon()
    } else {
      onChangePlayer()
    }
  }
}

const onChangePlayer: () => void = () => {
  cardList.innerHTML = ""
  getCard(2, deckId)
  playersDetails.push({ id: player + 1, cards: [], score: 0 })
  player += 1
  playerName.innerHTML = `${player + 1}`
}

const bot: () => void = () => {
  getCardButton.classList.add("hidden")
  playerEndButton.classList.add("hidden")
  let ineterval = setInterval(() => {
    if (playersDetails[0].score >= playersDetails[1].score && playersDetails[1].score !== 20) {
      getCard(1, deckId)
    }
    if (playersDetails[0].score < playersDetails[1].score) {
      gameWasEnded = true
      clearInterval(ineterval)
    }
  }, 1000)
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
  playersDetails.push({ id: player + 1, cards: [], score: 0 })
  onGameOver()
}

const playAgain: () => void = () => {
  shuffleCard(deckId)
  playersDetails.length = 0
  playersDetails.push({ id: 0, cards: [], score: 0 })
  player = 0
  isPositiveOrZero = false
  cardList.innerHTML = ""
  result.innerHTML = ""
  cardList.classList.remove("hidden")
  playAgainButton.classList.add("hidden")
  gameWasEnded = false
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
