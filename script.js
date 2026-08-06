var game = new Chess();
var selectedSquare = null;
var currentMode = 'twoplayer';

var unlockedLevel = localStorage.getItem('chessUnlockedLevel') ? parseInt(localStorage.getItem('chessUnlockedLevel')) : 1;

var boardThemes = [0, 1, 2, 3];
var boardThemeNames = ['Classic Wood', 'Forest Green', 'Ocean Blue', 'Dark Modern'];
var boardThemeIndex = 0;

var pieceImages = {
    'w_p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'w_r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'w_n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'w_b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'w_q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'w_k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    'b_p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'b_r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'b_n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'b_b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'b_q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'b_k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
};

function showPopup(message, callback) {
    document.getElementById('modal-text').textContent = message;
    document.getElementById('custom-modal').classList.remove('hidden');
    window.modalCallback = callback;
}

document.getElementById('modal-btn').addEventListener('click', function() {
    document.getElementById('custom-modal').classList.add('hidden');
    if (window.modalCallback) {
        window.modalCallback();
        window.modalCallback = null;
    }
});

function updateMenuUI() {
    for (let i = 1; i <= 4; i++) {
        var card = document.querySelector(`.menu-card[data-level="${i}"]`);
        var tag = document.getElementById(`tag-${i}`);
        if (i <= unlockedLevel) {
            card.classList.remove('locked');
            card.classList.add('unlocked');
            tag.textContent = '[ UNLOCKED ]';
            tag.style.color = '#27ae60';
        } else {
            card.classList.add('locked');
            card.classList.remove('unlocked');
            tag.textContent = '[ LOCKED ]';
            tag.style.color = '#e74c3c';
        }
    }
}
updateMenuUI();

document.querySelectorAll('.menu-card[data-level]').forEach(card => {
    card.addEventListener('click', function() {
        var level = parseInt(this.getAttribute('data-level'));
        if (level <= unlockedLevel) {
            currentMode = level;
            document.getElementById('game-title').textContent = this.querySelector('h2').textContent;
            startGame();
        } else {
            showPopup('This level is locked! Win the previous level first.');
        }
    });
});

document.getElementById('btn-twoplayer').addEventListener('click', function() {
    currentMode = 'twoplayer';
    document.getElementById('game-title').textContent = '2 Player Mode (Pass & Play)';
    startGame();
});

document.getElementById('btn-home').addEventListener('click', function() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
    updateMenuUI();
});

document.getElementById('btn-restart').addEventListener('click', function() {
    game.reset();
    selectedSquare = null;
    renderBoard();
});

document.getElementById('btn-undo').addEventListener('click', function() {
    if (currentMode === 'twoplayer') {
        game.undo();
    } else {
        game.undo();
        game.undo();
    }
    selectedSquare = null;
    renderBoard();
});

document.getElementById('btn-hint').addEventListener('click', function() {
    var moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    var hintMove = moves[Math.floor(Math.random() * moves.length)];
    showPopup('💡 Hint: You can move from ' + hintMove.from.toUpperCase() + ' to ' + hintMove.to.toUpperCase() + '!');
});

document.getElementById('btn-theme').addEventListener('click', function() {
    boardThemeIndex = (boardThemeIndex + 1) % boardThemes.length;
    this.textContent = '🎨 ' + boardThemeNames[boardThemeIndex];
    renderBoard();
});

function startGame() {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    if (currentMode === 1) boardThemeIndex = 0;       
    else if (currentMode === 2) boardThemeIndex = 1;  
    else if (currentMode === 3) boardThemeIndex = 2;  
    else if (currentMode === 4) boardThemeIndex = 3;  
    else boardThemeIndex = 0;                         

    var themeBtn = document.getElementById('btn-theme');
    themeBtn.textContent = '🎨 ' + boardThemeNames[boardThemeIndex];

    game.reset();
    selectedSquare = null;
    renderBoard();
}

function renderBoard() {
    var boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    boardElement.className = '';
    boardElement.classList.add('mode-' + currentMode);
    boardElement.classList.add('board-theme-' + boardThemeIndex);
    
    var history = game.history({ verbose: true });
    var lastMove = history.length > 0 ? history[history.length - 1] : null;

    var legalMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : [];
    var legalSquares = legalMoves.map(m => m.to);

    for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
            var squareDiv = document.createElement('div');
            var isLight = (r + c) % 2 === 0;
            squareDiv.className = 'square ' + (isLight ? 'light' : 'dark');
            
            var rank = 8 - r;
            var fileCode = 97 + c;
            var fileChar = String.fromCharCode(fileCode);
            var squareName = fileChar + rank;

            squareDiv.dataset.square = squareName;

            if (c === 0) {
                var rankSpan = document.createElement('span');
                rankSpan.className = 'coord-rank';
                rankSpan.textContent = rank;
                squareDiv.appendChild(rankSpan);
            }

            if (r === 7) {
                var fileSpan = document.createElement('span');
                fileSpan.className = 'coord-file';
                fileSpan.textContent = fileChar;
                squareDiv.appendChild(fileSpan);
            }

            if (selectedSquare === squareName) {
                squareDiv.classList.add('selected');
            }

            if (legalSquares.includes(squareName)) {
                squareDiv.classList.add('legal-move');
            }

            if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) {
                squareDiv.classList.add('last-move');
            }

            var piece = game.get(squareName);
            if (piece) {
                var img = document.createElement('img');
                img.src = pieceImages[piece.color + '_' + piece.type];
                squareDiv.appendChild(img);
            }

            // Highlight King square in red if the current player's king is in check
            if (game.in_check() && piece && piece.type === 'k' && piece.color === game.turn()) {
                squareDiv.classList.add('king-danger');
            }

            squareDiv.addEventListener('click', function() {
                handleSquareClick(this.dataset.square);
            });

            boardElement.appendChild(squareDiv);
        }
    }
    updateStatus();
}

function handleSquareClick(square) {
    if (currentMode !== 'twoplayer' && game.turn() === 'b') return;

    if (selectedSquare === null) {
        var piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            renderBoard();
        }
     } else {
        var piece = game.get(selectedSquare);
        var isPromotion = (piece && piece.type === 'p' && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1')));

        if (isPromotion) {
            showPromotionModal(function(chosenPiece) {
                var move = game.move({
                    from: selectedSquare,
                    to: square,
                    promotion: chosenPiece
                });
                selectedSquare = null;
                renderBoard();
                checkGameEnd();

                if (currentMode !== 'twoplayer' && !game.game_over() && game.turn() === 'b') {
                    setTimeout(makeAIMove, 300);
                }
            });
        } else {
            var move = game.move({
                from: selectedSquare,
                to: square
            });

            selectedSquare = null;
            if (move === null) {
                var clickedPiece = game.get(square);
                if (clickedPiece && clickedPiece.color === game.turn()) {
                    selectedSquare = square;
                }
            }
            renderBoard();
            checkGameEnd();

            if (currentMode !== 'twoplayer' && !game.game_over() && game.turn() === 'b') {
                setTimeout(makeAIMove, 300);
            }
        }
    }
    

function getPieceValue(piece) {
    if (!piece) return 0;
    switch (piece.type) {
        case 'p': return 1;
        case 'n': case 'b': return 3;
        case 'r': return 5;
        case 'q': return 9;
        case 'k': return 1000;
        default: return 0;
    }
}

function makeAIMove() {
    var possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    var selectedMove;

    if (currentMode === 1) {
        var captures = possibleMoves.filter(m => m.captured);
        if (captures.length > 0 && Math.random() < 0.5) {
            selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    } 
    else if (currentMode === 2) {
        var captures = possibleMoves.filter(m => m.captured);
        if (captures.length > 0 && Math.random() < 0.75) {
            selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    } 
    else if (currentMode === 3) {
        var captures = possibleMoves.filter(m => m.captured);
        var checks = possibleMoves.filter(m => m.san.includes('+'));

        if (checks.length > 0 && Math.random() < 0.7) {
            selectedMove = checks[Math.floor(Math.random() * checks.length)];
        } else if (captures.length > 0) {
            captures.sort((a, b) => getPieceValue(b.captured) - getPieceValue(a.captured));
            selectedMove = captures[0];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    } 
    else {
        var captures = possibleMoves.sort((a, b) => getPieceValue(b.captured) - getPieceValue(a.captured));
        var checks = possibleMoves.filter(m => m.san.includes('+'));

        if (checks.length > 0 && Math.random() < 0.8) {
            selectedMove = checks[0];
        } else if (captures.length > 0 && getPieceValue(captures[0].captured) > 0) {
            selectedMove = captures[0];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    }

    game.move(selectedMove);
    renderBoard();
    checkGameEnd();
}

function checkGameEnd() {
    if (game.in_checkmate()) {
        var winningTeam = (game.turn() === 'w') ? 'Black' : 'White';
        
        if (currentMode !== 'twoplayer') {
            if (game.turn() === 'b') {
                showPopup('🎉 Congratulations! You won this level!', function() {
                    if (currentMode === unlockedLevel && unlockedLevel < 4) {
                        unlockedLevel++;
                        localStorage.setItem('chessUnlockedLevel', unlockedLevel);
                    }
                    document.getElementById('game-screen').classList.add('hidden');
                    document.getElementById('menu-screen').classList.remove('hidden');
                    updateMenuUI();
                });
            } else {
                showPopup('💥 Computer defeated you! Try again.');
            }
        } else {
            showPopup('🏆 Checkmate! ' + winningTeam + ' Wins the Game! 🎉', function() {
                game.reset();
                selectedSquare = null;
                renderBoard();
            });
        }
    } else if (game.in_draw()) {
        showPopup('🤝 Game is a draw!', function() {
            if (currentMode === 'twoplayer') {
                game.reset();
                selectedSquare = null;
                renderBoard();
            }
        });
    }
}

function updateStatus() {
    var statusEl = document.getElementById('status');
    var moveColor = (game.turn() === 'w') ? 'White' : 'Black';
    var history = game.history({ verbose: true });
    var lastMove = history.length > 0 ? history[history.length - 1] : null;

    if (game.in_checkmate()) {
        statusEl.textContent = '👑 Checkmate! ' + (game.turn() === 'w' ? 'Black' : 'White') + ' Wins!';
    } else if (game.in_draw()) {
        statusEl.textContent = '🤝 Game is a draw!';
    } else {
        var text = '';
        if (lastMove) {
            var playerWhoMoved = lastMove.color === 'w' ? 'White' : 'Black';
            text = playerWhoMoved + ' played: ' + lastMove.from.toUpperCase() + ' → ' + lastMove.to.toUpperCase() + ' | ';
        }
        if (currentMode !== 'twoplayer' && game.turn() === 'b') {
            text += 'Computer is thinking...';
        } else {
            text += 'Turn: ' + moveColor;
        }
        
        if (game.in_check()) {
            text += ' ⚠️ (King in Danger!)';
        }
        
        statusEl.textContent = text;
    }
}

function showPromotionModal(callback) {
    var modal = document.getElementById('promotion-modal');
    modal.classList.remove('hidden');

    const buttons = modal.querySelectorAll('.promo-btn');
    buttons.forEach(button => {
        var newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function() {
            var chosenPiece = this.getAttribute('data-piece');
            modal.classList.add('hidden');
            callback(chosenPiece);
        });
    });
}
    
