document.addEventListener("DOMContentLoaded", () => {
    class MemoryGame {
        constructor() {
            // Configuration des éléments UI
            this.elements = {
                ErrourNom: document.activeElement.querySelector(".ErrourNom"),
                startPage: document.getElementById("startPage"),
                gamePage: document.getElementById("gamePage"),
                gameContainer: document.querySelector(".game-container"),
                levelSelect: document.getElementById("levelSelect"),
                nextLevelContainer: document.querySelector(".next-level-container"),
                nextLevelBtn: document.getElementById("nextLevelBtn"),
                Rejouer : document.getElementById("Rejouer"),
                playerNameInput: document.getElementById("playerName"),
                playerNameDisplay: document.getElementById("playerNameDisplay"),
                errorCount: document.getElementById("errorCount"),
                timer: document.getElementById("timer"),
                score: document.getElementById("score")
            };
            
            // Configuration des niveaux avec une structure claire de paires
            this.levels = [
                {
                    theme: "Variables et Types",
                    pairs: [
                        ["LET.png", "LET REP.png"],
                        ["CONST.png", "CONST REP.png"],
                        ["VAR.png", "VAR REP.png"],
                        ["TYPEOF.png", "TYPEOF REP.png"],
                        ["NUMBER.png", "NUMBER REP.png"],
                        ["STRING.png", "STRING REP.png"]
                    ]
                },
                {
                    theme: "Structures conditionnelles",
                    pairs: [
                        ["IF().png", "IF REP.png"],
                        ["ELSE.png", "ELSE REP.png"],
                        ["ELSE IF.png", "ELSE IF REP.png"],
                        ["===.png", "=== REP.png"],
                        ["!==.png", "!== REP.png"],
                        ["SWITCH.png", "SWITCH REP.png"]
                    ]
                },
                {
                    theme: "Boucles",
                    pairs: [
                        ["FOR.png", "FOR REP.png"],
                        ["WHILE.png", "WHILE REP.png"],
                        ["BREAK.png", "BREAK REP.png"],
                        ["CONTINUE.png", "CONTINUE REP.png"],
                        ["++.png", "++ REP.png"],
                        ["DO WHILE.png", "DO WHILE REP.png"]
                    ]
                },
                {
                    theme: "Fonctions",
                    pairs: [
                        ["FUNCTION.png", "FUNCTION REP.png"],
                        ["RETURN.png", "RETURN REP.png"],
                        ["().png", "() REP.png"],
                        ["=flech.png", "=flech REP.png"],
                        ["ARGUMENT.png", "ARGUMENT REP.png"],
                        ["CALLBACK.png", "CALLBACK REP.png"]
                    ]
                },
                {
                    theme: "Tableaux",
                    pairs: [
                        ["ARRAY.png", "ARRAY REP.png"],
                        ["PUSH().png", "PUSH() REP.png"],
                        ["POP().png", "POP() REP.png"],
                        ["LENGTH().png", "LENGTH() REP.png"],
                        ["FOREACH.png", "FOREACH REP.png"],
                        ["INDEX.png", "INDEX REP.png"]
                    ]
                },
                {
                    theme: "Objets",
                    pairs: [
                        ["OBJECT.png", "OBJECT REP.png"],
                        ["KEY.png", "KEY REP.png"],
                        ["VALUE.png", "VALUE REP.png"],
                        ["FOR..IN.png", "FOR..IN REP.png"],
                        ["THIS.png", "THIS REP.png"],
                        ["HASOWNPROPERTY.png", "HASOWNPROPERTY REP.png"]
                    ]
                }
            ];

            // État du jeu au debut de match
            this.state = {
                firstCard: null,
                secondCard: null,
                canClick: false,
                errorCount: 0,
                score: 0,
                time: 0,
                timerId: null,
                currentLevel: 0,
                totalPairs: 0,
                totalLevels: this.levels.length,
                playerName: "",
                cardsData: [] // stock les card de jeu de match 
            };

            this.initialize();
        }

        initialize() {
            this.setupEventListeners();
            this.populateLevelSelect();

            // Masquer les messages d'erreur au démarrage
            this.elements.ErrourNom.style.display = 'none';
        }
        updateScore(points) {
            this.state.score += points; // Ajouter des points au score
            document.getElementById("score").textContent = this.state.score; // Mettre à jour l'affichage
        }

        setupEventListeners() {
            this.elements.nextLevelBtn.addEventListener("click", () => this.nextLevel());
            document.getElementById('startGame').addEventListener('click', () => this.startGame());
            this.elements.gameContainer.addEventListener('click', e => this.handleCardClick(e));
            this.elements.Rejouer.addEventListener("click", () => this.Rejouer()); // Add this line
        
            // Ajout de l'écouteur pour le bouton "OK" de ErrourNom
            const closeErrorButton = document.querySelector('.ErrourNomclose');
            closeErrorButton.addEventListener('click', () => {
                this.elements.ErrourNom.style.display = 'none'; // Masque le message d'erreur
            });
        }


        populateLevelSelect() {
            this.levels.forEach((level, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${level.theme} (Niveau ${index + 1})`;
                this.elements.levelSelect.appendChild(option);
            });
        }

        startGame() {
            const playerName = this.elements.playerNameInput.value.trim();
            const levelValue = this.elements.levelSelect.value;

            // Réinitialiser les messages d'erreur
            this.elements.ErrourNom.style.display = 'none';
            

            // Vérification du nom du joueur
            if (!playerName) {
                this.elements.ErrourNom.style.display = 'block'; // Affiche le message d'erreur
                return; // Arrête l'exécution
            }

          

            // Si tout est valide, démarrer le jeu
            this.state.currentLevel = parseInt(levelValue);
            this.resetGameState(playerName);
            this.showGamePage();
            this.generateCards();
            this.startCardPreview();
        }



        resetGameState(playerName) {
            this.state = {
                ...this.state,
                playerName,
                errorCount: 0,
                score: 0,
                time: 0,
                firstCard: null,
                secondCard: null,
                canClick: false,
                cardsData: []
            };
            this.updateUI();
        }

        getCurrentLevel() {
            return this.levels[this.state.currentLevel];
        }

        generateCards() {
            this.elements.gameContainer.innerHTML = '';
            const level = this.getCurrentLevel();
            this.state.cardsData = [];
            this.state.totalPairs = level.pairs.length;
            
            // Création des données des cartes
            level.pairs.forEach((pair, pairId) => {
                pair.forEach(img => {
                    this.state.cardsData.push({
                        img: `imgs/${img}`,
                        pairId,
                        matched: false
                    });
                });
            });
            
            // Mélange et création des éléments DOM
            this.shuffleArray(this.state.cardsData).forEach((cardData, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = index;
                card.innerHTML = `
                    <img src="${cardData.img}" class="front" alt="Carte mémoire">
                    <img src="imgs/BG.png" class="back" alt="Dos de carte">
                `;
                this.elements.gameContainer.appendChild(card);
            });
        }

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        handleCardClick(event) {
            const cardElement = event.target.closest('.card');
            if (!this.isValidCardClick(cardElement)) return;
            
            const cardIndex = parseInt(cardElement.dataset.index);
            const cardData = this.state.cardsData[cardIndex];
            
            cardElement.classList.add('flip');
            
            if (this.state.firstCard === null) {
                this.state.firstCard = { element: cardElement, data: cardData };
            } else {
                this.state.secondCard = { element: cardElement, data: cardData };
                this.checkCardMatch();
            }
        }

        isValidCardClick(card) {
            return card &&
                this.state.canClick &&
                !card.classList.contains('flip') &&
                !this.state.cardsData[parseInt(card.dataset.index)].matched &&
                card !== this.state.firstCard?.element;
        }

        checkCardMatch() {
            const isMatch = this.state.firstCard.data.pairId === this.state.secondCard.data.pairId;
            
            if (isMatch) {
                this.handleMatch();
            } else {
                this.handleMismatch();
            }
        }

        handleMatch() {
            this.state.firstCard.data.matched = true;
            this.state.secondCard.data.matched = true;
            this.state.score++;
            this.updateUI();
            
            setTimeout(() => {
                this.state.firstCard.element.classList.add('matched');
                this.state.secondCard.element.classList.add('matched');
                this.resetSelection();
                
                if (this.state.score === this.state.totalPairs) {
                    this.handleLevelCompletion();
                }
            }, 300);
        }

        handleMismatch() {
            this.state.errorCount++;
            this.updateUI();
            this.state.canClick = false;
            
            setTimeout(() => {
                this.state.firstCard.element.classList.remove('flip');
                this.state.secondCard.element.classList.remove('flip');
                this.resetSelection();
                this.state.canClick = true;
            }, 1000);
        }

        resetSelection() {
            this.state.firstCard = null;
            this.state.secondCard = null;
        }

        handleLevelCompletion() {
            this.stopTimer();
            this.saveGameProgress();

            if (this.state.currentLevel < this.state.totalLevels - 1) {
                this.showNextLevelOption();
            } else {
                this.showFinalCongratulations();
            }
        }

        showNextLevelOption() {
            this.elements.nextLevelContainer.style.display = 'block';
        }

        showFinalCongratulations() {
            const endContainer = document.querySelector('.EnDContainer');
            endContainer.style.display = 'block';

            setTimeout(() => {
                endContainer.style.opacity = '1';
            }, 100); // Légère transition pour l'apparition
        }

        nextLevel() {
            this.state.currentLevel++;
            this.elements.levelSelect.value = this.state.currentLevel;
            this.startGame();
        }
        Rejouer() {
            // Show the start page and hide the game page
            startPage.style.display = "block";
            gamePage.style.display = "none";
        }
        
        startCardPreview() {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('flip');
                }, index * 100); // Ajout d'un délai pour un effet de cascade
            });

            setTimeout(() => {
                cards.forEach(card => card.classList.remove('flip'));
                this.state.canClick = true;
                this.startTimer();
            }, 3000 + cards.length * 100); // Ajustement du délai total
        }

        startTimer() {
            this.state.timerId = setInterval(() => {
                this.state.time++;
                this.elements.timer.textContent = this.formatTime(this.state.time);
            }, 1000);
        }

        stopTimer() {
            clearInterval(this.state.timerId);
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        updateUI() {
            this.elements.playerNameDisplay.textContent = this.state.playerName;
            this.elements.errorCount.textContent = this.state.errorCount;
        }

        showGamePage() {
            this.elements.startPage.style.display = 'none';
            this.elements.gamePage.style.display = 'block';
            this.elements.nextLevelContainer.style.display = 'none';
        }

        saveGameProgress() {
            localStorage.setItem('memoryGameProgress', JSON.stringify({
                level: this.state.currentLevel,
                playerName: this.state.playerName
            }));
        }

        showMessage(title, message) {
            const modal = document.createElement('div');
            modal.className = 'custom-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.remove(), 3000);
        }
    }

    // Initialisation du jeu
    const memoryGame = new MemoryGame();
});