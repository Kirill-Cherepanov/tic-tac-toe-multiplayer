/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./styles/styles.sass":
/*!****************************!*\
  !*** ./styles/styles.sass ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack:///./styles/styles.sass?");

/***/ }),

/***/ "./scripts/TicTacToe.ts":
/*!******************************!*\
  !*** ./scripts/TicTacToe.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst TicTacToeSigleplayer_1 = __importDefault(__webpack_require__(/*! ./TicTacToeSigleplayer */ \"./scripts/TicTacToeSigleplayer.ts\"));\r\nconst TicTacToeInvitation_1 = __importDefault(__webpack_require__(/*! ./TicTacToeInvitation */ \"./scripts/TicTacToeInvitation.ts\"));\r\nconst TicTacToeMultiplayer_1 = __importDefault(__webpack_require__(/*! ./TicTacToeMultiplayer */ \"./scripts/TicTacToeMultiplayer.ts\"));\r\nclass TicTacToeGame {\r\n    constructor(modeButtons, usernameForm, multiPlayerMenu) {\r\n        this.modeButtons = modeButtons;\r\n        this.multiPlayerMenu = multiPlayerMenu;\r\n        this.usernameForm = usernameForm;\r\n        this.gameMode = this.findActiveModeButton().dataset.gameMode;\r\n        this.changeMode = this.changeMode.bind(this);\r\n        this.modeButtons.forEach((button) => {\r\n            button.addEventListener('click', this.changeMode);\r\n        });\r\n    }\r\n    initializeSingleplayer(cells, board, endMessage) {\r\n        this.singleplayer = new TicTacToeSigleplayer_1.default(cells, board, endMessage);\r\n        this.singleplayer.startGame();\r\n    }\r\n    initializeMultiplayer(singleplayerProps, multiplayerProps) {\r\n        this.multiplayer = new TicTacToeMultiplayer_1.default(...multiplayerProps, singleplayerProps);\r\n        this.invitations = new TicTacToeInvitation_1.default(this.multiPlayerMenu, this.multiplayer);\r\n        this.usernameForm.addEventListener('submit', (e) => {\r\n            var _a;\r\n            e.preventDefault();\r\n            const username = this.getUsernameFormInputElement().value;\r\n            if (username === '')\r\n                return;\r\n            (_a = this.invitations) === null || _a === void 0 ? void 0 : _a.initialize(username);\r\n        });\r\n    }\r\n    getUsernameFormInputElement() {\r\n        return this.usernameForm.elements.username;\r\n    }\r\n    findActiveModeButton() {\r\n        return this.modeButtons.filter((button) => {\r\n            if (button.classList.contains('active'))\r\n                return true;\r\n            return false;\r\n        })[0];\r\n    }\r\n    changeMode(e) {\r\n        const button = e.currentTarget;\r\n        if (button.dataset.gameMode === this.gameMode)\r\n            return;\r\n        this.findActiveModeButton().classList.remove('active');\r\n        this.gameMode = button.dataset.gameMode;\r\n        button.classList.add('active');\r\n        if (this.gameMode === 'multi') {\r\n            this.multiPlayerMenu.classList.add('entering-username');\r\n            const username = localStorage.getItem('username') || '';\r\n            this.getUsernameFormInputElement().value = username;\r\n        }\r\n        else {\r\n            this.multiPlayerMenu.classList.remove('entering-username');\r\n            this.multiPlayerMenu.classList.remove('search');\r\n            if (this.singleplayer !== undefined)\r\n                this.singleplayer.startGame();\r\n        }\r\n    }\r\n}\r\nexports[\"default\"] = TicTacToeGame;\r\n\n\n//# sourceURL=webpack:///./scripts/TicTacToe.ts?");

/***/ }),

/***/ "./scripts/TicTacToeInvitation.ts":
/*!****************************************!*\
  !*** ./scripts/TicTacToeInvitation.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst socket_io_client_1 = __webpack_require__(/*! socket.io-client */ \"../../node_modules/socket.io-client/build/cjs/index.js\");\r\nclass TicTacToeInvitation {\r\n    constructor(multiPlayerMenu, multiplayer) {\r\n        this.multiPlayerMenu = multiPlayerMenu;\r\n        this.sessions = [];\r\n        this.multiplayer = multiplayer;\r\n        document.addEventListener('keydown', (e) => {\r\n            var _a;\r\n            if (e.key === 'q')\r\n                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('restartMatch');\r\n        });\r\n    }\r\n    initialize(username) {\r\n        localStorage.setItem('username', username);\r\n        this.multiPlayerMenu.classList.remove('entering-username');\r\n        this.multiPlayerMenu.classList.add('search');\r\n        this.connectToServer();\r\n        if (this.socket === undefined) {\r\n            throw Error('Failed to connect to the server!');\r\n        }\r\n        this.socket.emit('enter', username);\r\n    }\r\n    noChangesInSessions(sessionsData) {\r\n        // Fetching SessionData from this.sessions\r\n        const prevData = sortSessionData(this.sessions.map((session) => {\r\n            return {\r\n                socketID: session.dataset.token,\r\n                username: session.innerText,\r\n                invited: session.classList.contains('pending'),\r\n                wasInvited: session.classList.contains('active')\r\n            };\r\n        }));\r\n        return compareSessionData(prevData, sortSessionData(sessionsData));\r\n        function sortSessionData(data) {\r\n            return data.sort((a, b) => {\r\n                if (a.socketID > b.socketID) {\r\n                    return 1;\r\n                }\r\n                if (a.socketID < b.socketID) {\r\n                    return -1;\r\n                }\r\n                return 0;\r\n            });\r\n        }\r\n        function compareSessionData(data1, data2) {\r\n            return (data1.length === data2.length &&\r\n                data1.every((session, i) => {\r\n                    return (session.socketID === data2[i].socketID &&\r\n                        session.username === data2[i].username &&\r\n                        session.invited === data2[i].invited &&\r\n                        session.wasInvited === data2[i].wasInvited);\r\n                }));\r\n        }\r\n    }\r\n    clearSessions() {\r\n        this.sessions.forEach((session) => {\r\n            var _a;\r\n            (_a = session.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(session);\r\n        });\r\n        this.sessions = [];\r\n    }\r\n    createSessionElement(sessionData) {\r\n        const sessionElement = document.createElement('button');\r\n        sessionElement.classList.add('multiplayer-session');\r\n        if (sessionData.wasInvited)\r\n            sessionElement.classList.add('active');\r\n        if (sessionData.invited)\r\n            sessionElement.classList.add('pending');\r\n        sessionElement.dataset['token'] = sessionData.socketID;\r\n        const nicknameSpan = document.createElement('span');\r\n        nicknameSpan.classList.add('multiplayer-nickname');\r\n        nicknameSpan.dataset['sessionNickname'] = '';\r\n        nicknameSpan.innerText = sessionData.username;\r\n        const cancelIcon = document.createElement('i');\r\n        cancelIcon.classList.add('cancel-icon');\r\n        cancelIcon.classList.add('session-icon');\r\n        const acceptIcon = document.createElement('i');\r\n        acceptIcon.classList.add('accept-icon');\r\n        acceptIcon.classList.add('session-icon');\r\n        sessionElement.addEventListener('click', (e) => {\r\n            if ((e.target !== sessionElement && e.target !== nicknameSpan) ||\r\n                sessionElement.classList.contains('confirm') ||\r\n                sessionElement.classList.contains('active')) {\r\n                return;\r\n            }\r\n            sessionElement.classList.add('confirm');\r\n        });\r\n        acceptIcon.addEventListener('click', () => {\r\n            var _a, _b, _c, _d;\r\n            if (sessionElement.classList.contains('pending')) {\r\n                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('acceptInvite', sessionData.socketID);\r\n                return;\r\n            }\r\n            const pendingInvites = (this.multiPlayerMenu.querySelector('.pending-invites'));\r\n            if (!pendingInvites.classList.contains('show')) {\r\n                pendingInvites.classList.add('show');\r\n            }\r\n            (_c = (_b = sessionElement.parentElement) === null || _b === void 0 ? void 0 : _b.previousElementSibling) === null || _c === void 0 ? void 0 : _c.append(sessionElement);\r\n            (_d = this.socket) === null || _d === void 0 ? void 0 : _d.emit('invite', sessionData.socketID);\r\n            sessionElement.classList.remove('confirm');\r\n            sessionElement.classList.add('active');\r\n        });\r\n        cancelIcon.addEventListener('click', () => {\r\n            const handleCancelInvite = (wasInvited) => {\r\n                var _a, _b;\r\n                const pendingInvites = (this.multiPlayerMenu.querySelector('.pending-invites'));\r\n                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('cancelInvite', sessionData.socketID, wasInvited);\r\n                (_b = pendingInvites.nextElementSibling) === null || _b === void 0 ? void 0 : _b.append(sessionElement);\r\n                if (pendingInvites.childElementCount === 0) {\r\n                    pendingInvites.classList.remove('show');\r\n                }\r\n            };\r\n            if (sessionElement.classList.contains('active')) {\r\n                handleCancelInvite(true);\r\n            }\r\n            else if (sessionElement.classList.contains('pending')) {\r\n                handleCancelInvite(false);\r\n            }\r\n            sessionElement.classList.remove('confirm');\r\n            sessionElement.classList.remove('active');\r\n            sessionElement.classList.remove('pending');\r\n        });\r\n        sessionElement.append(nicknameSpan, cancelIcon, acceptIcon);\r\n        return sessionElement;\r\n    }\r\n    updateSessions(sessionsData) {\r\n        if (this.noChangesInSessions(sessionsData))\r\n            return;\r\n        this.clearSessions();\r\n        const pendingInvites = (this.multiPlayerMenu.querySelector('.pending-invites'));\r\n        sessionsData.forEach((sessionData) => {\r\n            var _a;\r\n            const sessionElement = this.createSessionElement(sessionData);\r\n            this.sessions.push(sessionElement);\r\n            if ((sessionElement.classList.contains('active') ||\r\n                sessionElement.classList.contains('pending')) &&\r\n                !sessionElement.classList.contains('confirm')) {\r\n                if (!pendingInvites.classList.contains('show')) {\r\n                    pendingInvites.classList.add('show');\r\n                }\r\n                pendingInvites.append(sessionElement);\r\n            }\r\n            else {\r\n                (_a = pendingInvites.nextElementSibling) === null || _a === void 0 ? void 0 : _a.append(sessionElement);\r\n            }\r\n        });\r\n        if (pendingInvites.classList.contains('show') ===\r\n            (pendingInvites.childElementCount === 0)) {\r\n            pendingInvites.classList.toggle('show');\r\n        }\r\n    }\r\n    connectToServer() {\r\n        if (this.socket !== undefined)\r\n            return;\r\n        this.socket = (0, socket_io_client_1.io)('http://192.168.100.2:3000/');\r\n        this.socket.on('sessionsupdate', (sessionsData) => {\r\n            console.log('ff');\r\n            this.updateSessions(sessionsData);\r\n        });\r\n        this.socket.on('startGame', (...args) => {\r\n            var _a;\r\n            if (this.socket === undefined)\r\n                throw Error('How in the world has this happened? Socket is undefined!');\r\n            this.multiPlayerMenu.classList.remove('entering-username');\r\n            this.multiPlayerMenu.classList.remove('search');\r\n            (_a = this.multiPlayerMenu.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('multiplayer');\r\n            this.multiplayer.initialize(...args, this.socket);\r\n            this.socket.on('gameOver', () => {\r\n                var _a;\r\n                this.multiPlayerMenu.classList.add('search');\r\n                (_a = this.multiPlayerMenu.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove('multiplayer');\r\n            });\r\n        });\r\n        this.multiplayer.leaveButton.addEventListener('click', (e) => {\r\n            var _a;\r\n            this.multiPlayerMenu.classList.add('search');\r\n            (_a = this.multiPlayerMenu.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove('multiplayer');\r\n        });\r\n    }\r\n}\r\nexports[\"default\"] = TicTacToeInvitation;\r\n\n\n//# sourceURL=webpack:///./scripts/TicTacToeInvitation.ts?");

/***/ }),

/***/ "./scripts/TicTacToeMultiplayer.ts":
/*!*****************************************!*\
  !*** ./scripts/TicTacToeMultiplayer.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst TicTacToeSigleplayer_1 = __importDefault(__webpack_require__(/*! ./TicTacToeSigleplayer */ \"./scripts/TicTacToeSigleplayer.ts\"));\r\nclass TicTacToeMultiplayer extends TicTacToeSigleplayer_1.default {\r\n    constructor(optionButtons, timer, settingsForm, boardProps) {\r\n        super(...boardProps);\r\n        this.currentTurn = this.xTurn;\r\n        this.username = localStorage.getItem('username');\r\n        this.settingsButton = optionButtons[0];\r\n        this.leaveButton = optionButtons[1];\r\n        this.timer = timer;\r\n        this.settingsForm = settingsForm;\r\n        this.startGame = this.startGame.bind(this);\r\n    }\r\n    initialize(opponent, firstTurn, socket) {\r\n        this.opponent = opponent;\r\n        this.xTurn = firstTurn;\r\n        this.currentTurn = firstTurn;\r\n        this.socket = socket;\r\n        this.initializeSettings();\r\n        this.setMessage(`Match against<br>${this.opponent}`, 'Start');\r\n    }\r\n    initializeSettings() {\r\n        const settingsContainer = this.settingsForm.parentElement;\r\n        const settingsLabel = (this.settingsButton.lastElementChild);\r\n        const moveTimeInput = (this.settingsForm.elements['player-move-time']);\r\n        this.settingsButton.addEventListener('click', () => {\r\n            if (settingsContainer.classList.contains('show')) {\r\n                settingsLabel.innerText = 'Game';\r\n            }\r\n            else\r\n                settingsLabel.innerText = 'Settings';\r\n            settingsContainer.classList.toggle('show');\r\n        });\r\n        // moveTimeInput.addEventListener('change', () => {\r\n        //     this.socket?.emit('changeMoveTime', Number(moveTimeInput.value))\r\n        // });\r\n        // this.socket?.on('changeMoveTime', time => {\r\n        // });\r\n        this.settingsForm.addEventListener('submit', (e) => {\r\n            var _a;\r\n            e.preventDefault();\r\n            const form = e.currentTarget;\r\n            const timeoutTime = (form.elements['timeout-time']);\r\n            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('timeout', Number(timeoutTime.value) * 60);\r\n        });\r\n        this.leaveButton.addEventListener('click', (e) => {\r\n            var _a;\r\n            this.endMessage.classList.remove('show');\r\n            settingsContainer.classList.remove('show');\r\n            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('leaveGame');\r\n        });\r\n    }\r\n    swapSides() {\r\n        this.xTurn = !this.xTurn;\r\n        this.currentTurn = this.xTurn;\r\n        this.setBoardHoverClass();\r\n        this.clearBoard();\r\n    }\r\n    startGame() {\r\n        var _a, _b;\r\n        this.swapSides();\r\n        if (this.currentTurn)\r\n            this.initializeMove();\r\n        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.off('move');\r\n        (_b = this.socket) === null || _b === void 0 ? void 0 : _b.on('move', (position) => {\r\n            this.makeMove(this.cells[position]);\r\n            this.initializeMove();\r\n        });\r\n    }\r\n    initializeMove() {\r\n        const makeMove = this.makeMove;\r\n        const socket = this.socket;\r\n        const move = (e) => {\r\n            const cell = e.target;\r\n            makeMove(cell);\r\n            socket === null || socket === void 0 ? void 0 : socket.emit('move', this.cells.indexOf(cell));\r\n            this.cells.forEach((cell) => {\r\n                cell.removeEventListener('click', move);\r\n            });\r\n        };\r\n        this.cells.forEach((cell) => {\r\n            if (cell.classList.contains('x') || cell.classList.contains('o')) {\r\n                return;\r\n            }\r\n            cell.addEventListener('click', move);\r\n        });\r\n    }\r\n    makeMove(cell) {\r\n        const currentClass = this.currentTurn === this.xTurn ? 'x' : 'o';\r\n        this.placeMark(cell, currentClass);\r\n        this.swapTurns();\r\n        if (this.checkWin(currentClass))\r\n            this.gameOver();\r\n        else if (this.checkDraw())\r\n            this.gameOver(true);\r\n    }\r\n    swapTurns() {\r\n        this.currentTurn = !this.currentTurn;\r\n        this.setBoardHoverClass();\r\n    }\r\n    gameOver(draw = false) {\r\n        const message = draw\r\n            ? 'Draw!'\r\n            : `${this.currentTurn ? this.username : this.opponent}'s Victory!`;\r\n        this.setMessage(message, 'Restart');\r\n    }\r\n    setMessage(text, buttonText) {\r\n        var _a;\r\n        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('timeout');\r\n        const endText = (this.endMessage.querySelector('[data-end-text]'));\r\n        const restartButton = (this.endMessage.querySelector('[data-restart-button]'));\r\n        endText.innerHTML = text;\r\n        restartButton.innerText = buttonText;\r\n        this.endMessage.classList.add('show');\r\n        restartButton.addEventListener('click', () => {\r\n            var _a, _b;\r\n            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('restartMatch');\r\n            endText.innerText = 'Waiting for the opponent';\r\n            restartButton.innerText = 'Wait';\r\n            (_b = this.socket) === null || _b === void 0 ? void 0 : _b.on('restartMatch', () => {\r\n                var _a, _b;\r\n                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('restartMatch');\r\n                this.startGame();\r\n                (_b = this.socket) === null || _b === void 0 ? void 0 : _b.off('restartMatch');\r\n            });\r\n        }, { once: true });\r\n    }\r\n}\r\nexports[\"default\"] = TicTacToeMultiplayer;\r\n\n\n//# sourceURL=webpack:///./scripts/TicTacToeMultiplayer.ts?");

/***/ }),

/***/ "./scripts/TicTacToeSigleplayer.ts":
/*!*****************************************!*\
  !*** ./scripts/TicTacToeSigleplayer.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nclass TicTacToeSingleplayer {\r\n    constructor(cells, board, endMessage) {\r\n        this.cells = [...cells];\r\n        this.board = board;\r\n        this.endMessage = endMessage;\r\n        this.xTurn = true;\r\n        this.WINNING_COMBINATIONS = [\r\n            [0, 3, 6],\r\n            [1, 4, 7],\r\n            [2, 5, 8],\r\n            [0, 1, 2],\r\n            [3, 4, 5],\r\n            [6, 7, 8],\r\n            [0, 4, 8],\r\n            [2, 4, 6]\r\n        ];\r\n        this.makeMove = this.makeMove.bind(this);\r\n    }\r\n    clearBoard() {\r\n        this.endMessage.classList.remove('show');\r\n        [...this.board.childNodes].forEach(child => {\r\n            this.board.removeChild(child);\r\n        });\r\n        this.cells.forEach((cell, i) => {\r\n            const newNode = cell.cloneNode(true);\r\n            newNode.classList.remove('x');\r\n            newNode.classList.remove('o');\r\n            this.board.append(newNode);\r\n            this.cells[i] = newNode;\r\n        });\r\n    }\r\n    startGame() {\r\n        this.setBoardHoverClass();\r\n        this.clearBoard();\r\n        this.cells.forEach((cell) => {\r\n            cell.addEventListener('click', this.makeMove, {\r\n                once: true\r\n            });\r\n        });\r\n    }\r\n    makeMove(cell) {\r\n        if (cell instanceof Event)\r\n            cell = cell.target;\r\n        const currentClass = this.xTurn ? 'x' : 'o';\r\n        this.placeMark(cell, currentClass);\r\n        this.swapTurns();\r\n        if (this.checkWin(currentClass))\r\n            this.gameOver();\r\n        else if (this.checkDraw())\r\n            this.gameOver(true);\r\n    }\r\n    placeMark(cell, currentClass) {\r\n        cell.classList.add(currentClass);\r\n    }\r\n    swapTurns() {\r\n        this.xTurn = !this.xTurn;\r\n        this.setBoardHoverClass();\r\n    }\r\n    setBoardHoverClass() {\r\n        this.board.classList.remove('o');\r\n        this.board.classList.remove('x');\r\n        if (this.xTurn) {\r\n            this.board.classList.add('x');\r\n        }\r\n        else {\r\n            this.board.classList.add('o');\r\n        }\r\n    }\r\n    checkWin(currentClass) {\r\n        return this.WINNING_COMBINATIONS.some(combination => {\r\n            return combination.every(index => {\r\n                return this.cells[index].classList.contains(currentClass);\r\n            });\r\n        });\r\n    }\r\n    checkDraw() {\r\n        return [...this.cells].every((cell) => {\r\n            return cell.classList.contains('x') || cell.classList.contains('o');\r\n        });\r\n    }\r\n    gameOver(draw = false) {\r\n        let message;\r\n        message = draw\r\n            ? 'Draw!'\r\n            : `${this.xTurn ? 'Circle' : 'Cross'} player Wins!`;\r\n        this.setMessage(message, 'Restart', (e) => {\r\n            this.endMessage.classList.remove('show');\r\n            this.startGame.call(this);\r\n        });\r\n    }\r\n    setMessage(text, buttonText, callback) {\r\n        this.endMessage.classList.add('show');\r\n        const endText = (this.endMessage.querySelector('[data-end-text]'));\r\n        const restartButton = (this.endMessage.querySelector('[data-restart-button]'));\r\n        endText.innerHTML = text;\r\n        restartButton.innerText = buttonText;\r\n        restartButton.addEventListener('click', e => callback(e), { once: true });\r\n    }\r\n}\r\nexports[\"default\"] = TicTacToeSingleplayer;\r\n\n\n//# sourceURL=webpack:///./scripts/TicTacToeSigleplayer.ts?");

/***/ }),

/***/ "./scripts/index.ts":
/*!**************************!*\
  !*** ./scripts/index.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst TicTacToe_1 = __importDefault(__webpack_require__(/*! ./TicTacToe */ \"./scripts/TicTacToe.ts\"));\r\n__webpack_require__(/*! ../styles/styles.sass */ \"./styles/styles.sass\");\r\nconst cellElements = document.querySelectorAll('[data-cell]');\r\nconst board = document.getElementById('gameboard');\r\nconst endMessage = document.querySelector('[data-end-message]');\r\nconst endText = document.querySelector('[data-end-text]');\r\nconst restartButton = (document.querySelector('[data-restart-button]'));\r\nconst singlePlayerButton = (document.getElementById('single-button'));\r\nconst multiPlayerButton = (document.getElementById('multi-button'));\r\nconst aiButton = document.getElementById('ai-button');\r\nconst multiPlayerMenu = (document.querySelector('[data-multiplayer-menu]'));\r\nconst usernameForm = document.getElementById('username-form');\r\nconst settingsButton = document.getElementById('settings-btn');\r\nconst leaveButton = document.getElementById('leave-btn');\r\nconst timer = document.querySelector('[data-timer]');\r\nconst multiplayerSettingsForm = document.querySelector('[data-settings]');\r\nconst opponentMoveTime = document.querySelector('[data-opponent-move-time]');\r\nconst finalMoveTime = document.querySelector('[data-final-move-time]');\r\nconst tictactoe = new TicTacToe_1.default([singlePlayerButton, multiPlayerButton, aiButton], usernameForm, multiPlayerMenu);\r\nconst singleplayerProps = [cellElements, board, endMessage];\r\nconst multiplayerProps = [[settingsButton, leaveButton], timer, multiplayerSettingsForm];\r\ntictactoe.initializeSingleplayer(...singleplayerProps);\r\ntictactoe.initializeMultiplayer(singleplayerProps, multiplayerProps);\r\n\n\n//# sourceURL=webpack:///./scripts/index.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_socket_io-client_build_cjs_index_js"], function() { return __webpack_require__("./scripts/index.ts"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;