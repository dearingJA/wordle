import { useEffect, useState } from 'react'
import './App.css'

// const API_URL = 'https://api.frontendexpert.io/api/fe/wordle-words';
//
// add more than one letter get correct feedback
// keyboard at bottom visual

const WORD_LENGTH = 5;


function App() {

  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLostGameOver, setIsLostGameOver] = useState(false);
  const [validWords, setValidWords] = useState([]);

  const [showStartScreen, setShowStartScreen] = useState(true);

  // fetch valid words
  useEffect(() => {
    const fetchValidWords = async () => {

      const response = await fetch('/validWords.txt');
      const text = await response.text();
      const wordsArray = text.split('\n').map(word => word.trim());
      setValidWords(wordsArray);
    };

    fetchValidWords();
  }, []);

  // handle guesses
  useEffect(() => {
    const handleType = (event) => {
      if (isGameOver) {
        return;
      }

      if (event.key === 'Enter') {
        if (currentGuess.length !== 5) return;
        
        if (!validWords.includes(currentGuess.toLowerCase())) {
          alert('Invalid guess. Enter real word.');
          return;
        } 

        const newGuesses = [...guesses];
        newGuesses[guesses.findIndex(val => val == null)] = currentGuess;
        setGuesses(newGuesses);
        setCurrentGuess('');

        const isCorrect = solution === currentGuess;

        const nextGuessIndex = newGuesses.findIndex(val => val == null);
        const isLastGuess = nextGuessIndex === -1;

        if (isCorrect) {
          setIsGameOver(true);
        } else if (isLastGuess) {
          setIsLostGameOver(true);
        }
      }

      if (event.key === 'Backspace') {
        setCurrentGuess(currentGuess.slice(0,-1));
        return;
      }   
      
      if (currentGuess.length >= 5) {
        return;
      }
      
      const isLetter = event.key.match(/^[a-z]{1}$/) != null;
      if (isLetter) {
        setCurrentGuess(oldGuess => oldGuess + event.key);
      }
    };

    window.addEventListener('keydown', handleType);

    return () => window.removeEventListener('keydown', handleType);
  }, [currentGuess, isGameOver, solution, guesses]);

  // handle start screen and selecting word
  const startGameWithWord = (word) => {
    setSolution(word);
    setGuesses(Array(6).fill(null));
    setCurrentGuess('');
    setIsGameOver(false);
    setIsLostGameOver(false);
    setShowStartScreen(false);
  };

  return (
    <div className='app'>
      <div className='title-container'>
        <h1 className='title'>Woddle</h1>
      </div>

      {showStartScreen ? (
        <div className="start-screen">

          <button onClick={() => startGameWithWord('hello')}>
            Assigned Word
          </button>

          <button onClick={() => {
            if (validWords.length === 0) {
              alert("Word list not loaded yet"); return;
            }
            const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
            startGameWithWord(randomWord);
          }}>
            Random Word (HARD MODE)
          </button>
        </div>
      ) : (
        <>
          <div className='board'>
            {guesses.map((guess, idx) => {
              const isCurrentGuess = idx === guesses.findIndex(val => val === null);
              return (
                <Line 
                  key={idx} 
                  guess={isCurrentGuess ? currentGuess : guess ?? ''}
                  isFinal={!isCurrentGuess && guess != null}
                  solution={solution}
                />
              );
            })}
          </div>

          {isLostGameOver && (
            <div className="game-over-message">
              <p>Correct Word: <strong>{solution.toUpperCase()}</strong></p>
            </div>
          )}
        </>
      )}
    </div>

  );
}

function Line({ guess, isFinal, solution }) {

  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i];
    let className = 'tile';

    if (isFinal) {
      if (char === solution[i]) {
        className += ' correct';
      } else if (solution.includes(char)) {
        className += ' close';
      } else {
        className += ' incorrect';
      }

    }


    tiles.push(<div key={i} className={className}>{char}</div>);
  }



  return (
    <div className='line'>
      {tiles}
    </div>
  )
}

export default App;
