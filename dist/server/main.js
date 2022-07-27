/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./Timer.ts":
/*!******************!*\
  !*** ./Timer.ts ***!
  \******************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nclass Timer {\r\n    constructor() {\r\n        this.TIMERINTERVAL = 200;\r\n        this._maxTime = 0;\r\n        this._time = 0;\r\n    }\r\n    get time() {\r\n        return this._time;\r\n    }\r\n    get maxTime() {\r\n        return this._maxTime;\r\n    }\r\n    reset() {\r\n        if (this.timer === undefined)\r\n            throw Error('Can not reset the timer. Timer was not set!');\r\n        clearInterval(this.timer);\r\n        this.timer = undefined;\r\n        this._time = 0;\r\n        this._maxTime = 0;\r\n    }\r\n    restart() {\r\n        const prevTime = this._maxTime;\r\n        this.reset();\r\n        this.start(prevTime, this.callback);\r\n    }\r\n    start(maxTime, callback) {\r\n        this._maxTime = maxTime;\r\n        this.callback = callback;\r\n        this.timer = setInterval(() => {\r\n            if (this._time >= this._maxTime) {\r\n                this.reset();\r\n                callback();\r\n            }\r\n            this._time += this.TIMERINTERVAL;\r\n        }, this.TIMERINTERVAL);\r\n    }\r\n    add(addTime) {\r\n        const timeLeft = this._maxTime - this._time;\r\n        this.reset();\r\n        if (timeLeft + addTime >= 0)\r\n            this.start(timeLeft + addTime, this.callback);\r\n    }\r\n}\r\nexports[\"default\"] = Timer;\r\n\n\n//# sourceURL=webpack:///./Timer.ts?");

/***/ }),

/***/ "./app.ts":
/*!****************!*\
  !*** ./app.ts ***!
  \****************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst socket_io_1 = __webpack_require__(/*! socket.io */ \"socket.io\");\r\nconst promises_1 = __importDefault(__webpack_require__(/*! fs/promises */ \"fs/promises\"));\r\nconst Timer_1 = __importDefault(__webpack_require__(/*! ./Timer */ \"./Timer.ts\"));\r\nconsole.log(process.env);\r\nconsole.log(process.env.PORT);\r\nconst io = new socket_io_1.Server(Number(process.env.PORT) || 3000, {\r\n    cors: {\r\n        origin: true\r\n    }\r\n});\r\nconst UPDATE_SESSION_TIME = 1000;\r\nconst TIMINGS = {\r\n    move: [3, 5, 10, 15, 30, Infinity],\r\n    pause: 1000\r\n};\r\nio.on('connection', function (socket) {\r\n    socket.on('enter', (username) => __awaiter(this, void 0, void 0, function* () {\r\n        const dbData = yield readDb();\r\n        if (isUserInSearch(dbData, socket.id, username))\r\n            return;\r\n        let inSearch = true;\r\n        let opponent = '', gameID = '';\r\n        let opponentMoveTime = 10, moveTime = 10, finalMoveTime = 10;\r\n        const timer = new Timer_1.default();\r\n        const sessionsUpdater = (socket) => __awaiter(this, void 0, void 0, function* () {\r\n            if (!inSearch)\r\n                return;\r\n            const dbData = yield readDb();\r\n            socket.emit('sessionsupdate', getSessionDataFromPlayers(dbData.players, socket.id));\r\n            setTimeout(() => {\r\n                sessionsUpdater(socket);\r\n            }, UPDATE_SESSION_TIME);\r\n        });\r\n        const isSuccess = addUser(dbData, socket.id, username);\r\n        if (!isSuccess) {\r\n            socket.emit('enterFailure', 'username already exists');\r\n            return;\r\n        }\r\n        socket.emit('enterSuccess');\r\n        yield updateDb(dbData);\r\n        sessionsUpdater(socket);\r\n        const leaveGame = () => __awaiter(this, void 0, void 0, function* () {\r\n            const dbData = yield readDb();\r\n            if (!isUserInGame(dbData, socket.id)) {\r\n                throw Error(\"Can't leave the game. Not in multiplayer currently!\");\r\n            }\r\n            cancelGame(dbData, socket.id, false);\r\n            updateDb(dbData);\r\n            inSearch = true;\r\n            opponent = gameID = '';\r\n        });\r\n        socket.on('invite', (invited) => __awaiter(this, void 0, void 0, function* () {\r\n            const dbData = yield readDb();\r\n            if (!isUserInSearch(dbData, invited))\r\n                return;\r\n            dbData.players[socket.id].invited.push(invited);\r\n            dbData.players[invited].wasInvited.push(socket.id);\r\n            updateDb(dbData);\r\n        }));\r\n        socket.on('cancelInvite', (inviter, wasInvited) => __awaiter(this, void 0, void 0, function* () {\r\n            const dbData = yield readDb();\r\n            if (!isUserInSearch(dbData, inviter))\r\n                return;\r\n            if (wasInvited) {\r\n                dbData.players[socket.id].invited.splice(dbData.players[socket.id].invited.indexOf(inviter), 1);\r\n                dbData.players[inviter].wasInvited.splice(dbData.players[inviter].wasInvited.indexOf(socket.id), 1);\r\n            }\r\n            else {\r\n                dbData.players[socket.id].wasInvited.splice(dbData.players[socket.id].wasInvited.indexOf(inviter), 1);\r\n                dbData.players[inviter].invited.splice(dbData.players[inviter].invited.indexOf(socket.id), 1);\r\n            }\r\n            updateDb(dbData);\r\n        }));\r\n        socket.on('acceptInvite', (inviter) => __awaiter(this, void 0, void 0, function* () {\r\n            const dbData = yield readDb();\r\n            if (!isUserInSearch(dbData, inviter))\r\n                return;\r\n            const room = {\r\n                players: {\r\n                    [socket.id]: dbData.players[socket.id].username,\r\n                    [inviter]: dbData.players[inviter].username\r\n                },\r\n                currentGame: Array(9).fill(null)\r\n            };\r\n            dbData.games[inviter] = room;\r\n            io.to(socket.id).emit('startGame', dbData.players[inviter].username, true);\r\n            io.to(inviter).emit('startGame', dbData.players[socket.id].username, false);\r\n            deleteUser(dbData, inviter);\r\n            deleteUser(dbData, socket.id);\r\n            yield updateDb(dbData);\r\n        }));\r\n        socket.on('timeout', (time = TIMINGS.pause) => __awaiter(this, void 0, void 0, function* () {\r\n            if (opponent === '' || gameID === '') {\r\n                const dbData = yield readDb();\r\n                const isInGame = isUserInGame(dbData, socket.id);\r\n                if (typeof isInGame === 'boolean')\r\n                    return;\r\n                inSearch = false;\r\n                gameID = isInGame;\r\n                opponent = Object.keys(dbData.games[gameID].players).filter((i) => i !== socket.id)[0];\r\n            }\r\n            if (timer.maxTime !== 0)\r\n                timer.reset();\r\n            timer.start(time * 1000, leaveGame);\r\n        }));\r\n        // socket.on('changeMoveTime', (time) => {\r\n        //     if (time !== Infinity && time > 30) return;\r\n        //     io.to(opponent).emit('changeMoveTime', time);\r\n        // });\r\n        socket.on('restartMatch', function initial() {\r\n            return __awaiter(this, void 0, void 0, function* () {\r\n                io.to(opponent).emit('restartMatch');\r\n                socket.on('restartMatch', function restartMatch() {\r\n                    io.to(socket.id).emit('restartMatch');\r\n                    io.to(opponent).emit('restartMatch');\r\n                    timer.reset();\r\n                    timer.start(finalMoveTime * 1000, () => {\r\n                        socket.emit('timeIsUp', true);\r\n                    });\r\n                    socket.on('restartMatch', initial);\r\n                    socket.off('restartMatch', restartMatch);\r\n                });\r\n                socket.off('restartMatch', initial);\r\n            });\r\n        });\r\n        socket.on('move', (position) => __awaiter(this, void 0, void 0, function* () {\r\n            const dbData = yield readDb();\r\n            if (dbData.games[gameID].currentGame[position]) {\r\n                restartMatch(dbData, gameID);\r\n                io.to(gameID).emit('restartMatch');\r\n            }\r\n            dbData.games[gameID].currentGame[position] = 1;\r\n            io.to(opponent).emit('move', position);\r\n        }));\r\n        socket.on('leaveGame', leaveGame);\r\n        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {\r\n            console.log('disconnect');\r\n            const dbData = yield readDb();\r\n            if (isUserInSearch(dbData, socket.id)) {\r\n                deleteUser(dbData, socket.id);\r\n            }\r\n            else if (isUserInGame(dbData, socket.id)) {\r\n                cancelGame(dbData, socket.id, true);\r\n            }\r\n            else {\r\n                const errorMessage = `Something went wrong. Here is dbData:\\n${dbData}`;\r\n                throw Error(errorMessage);\r\n            }\r\n            updateDb(dbData);\r\n        }));\r\n    }));\r\n});\r\nfunction updateDb(dbData) {\r\n    return promises_1.default.writeFile('CurrentPlayers.json', JSON.stringify(dbData));\r\n}\r\nfunction readDb() {\r\n    return __awaiter(this, void 0, void 0, function* () {\r\n        return (JSON.parse((yield promises_1.default.readFile('CurrentPlayers.json')).toString('utf-8')));\r\n    });\r\n}\r\nfunction getSessionDataFromPlayers(players, socketID) {\r\n    return Object.entries(players)\r\n        .filter((player) => player[0] !== socketID)\r\n        .map((player) => {\r\n        return {\r\n            socketID: player[0],\r\n            username: player[1].username,\r\n            invited: player[1].invited.includes(socketID),\r\n            wasInvited: player[1].wasInvited.includes(socketID)\r\n        };\r\n    });\r\n}\r\nfunction addUser(dbData, socketID, username) {\r\n    const isUsernameInDb = Object.values(dbData.players)\r\n        .map((player) => player.username)\r\n        .includes(username);\r\n    if (isUsernameInDb)\r\n        return false;\r\n    dbData.players[socketID] = {\r\n        username: username,\r\n        invited: [],\r\n        wasInvited: []\r\n    };\r\n    return true;\r\n}\r\nfunction deleteUser(dbData, socketID) {\r\n    if (dbData.players[socketID] === undefined) {\r\n        const errorMessage = `Can not delete the user ${socketID}.\\nThere is no such user in\\n${dbData.players}!`;\r\n        throw Error(errorMessage);\r\n    }\r\n    for (let invited of dbData.players[socketID].invited) {\r\n        if (dbData.players[invited] === undefined)\r\n            continue;\r\n        dbData.players[invited].wasInvited.splice(dbData.players[invited].wasInvited.indexOf(socketID), 1);\r\n    }\r\n    for (let inviter of dbData.players[socketID].invited) {\r\n        if (dbData.players[inviter] === undefined)\r\n            continue;\r\n        dbData.players[inviter].invited.splice(dbData.players[inviter].invited.indexOf(socketID), 1);\r\n    }\r\n    delete dbData.players[socketID];\r\n    return;\r\n}\r\nfunction restartMatch(dbData, room) {\r\n    dbData.games[room].currentGame = Array(9).fill(null);\r\n}\r\nfunction isUserInSearch(dbData, socketID, username = '') {\r\n    return (Object.keys(dbData.players).includes(socketID) &&\r\n        (username === '' || dbData.players[socketID].username === username));\r\n}\r\nfunction isUserInGame(dbData, socketID) {\r\n    const games = Object.values(dbData.games);\r\n    let room;\r\n    for (let game of games) {\r\n        if (Object.keys(game.players).includes(socketID)) {\r\n            room = Object.keys(game.players)[1];\r\n        }\r\n    }\r\n    return room || false;\r\n}\r\nfunction cancelGame(dbData, socketID, isDisconnected) {\r\n    let room_id;\r\n    let opponent;\r\n    let username;\r\n    for (let game of Object.entries(dbData.games)) {\r\n        if (Object.keys(game[1].players).includes(socketID)) {\r\n            room_id = game[0];\r\n            opponent = Object.entries(game[1].players).filter((i) => i[0] !== socketID)[0];\r\n            username = game[1].players[socketID];\r\n        }\r\n    }\r\n    if (opponent === undefined ||\r\n        room_id === undefined ||\r\n        username === undefined) {\r\n        const errorMessage = `Can not delete the user ${socketID}.\\nThere is no such user in\\n${JSON.stringify(dbData.games)}!`;\r\n        throw Error(errorMessage);\r\n    }\r\n    if (!isDisconnected) {\r\n        dbData.players[socketID] = {\r\n            username: username,\r\n            invited: [],\r\n            wasInvited: []\r\n        };\r\n    }\r\n    dbData.players[opponent[0]] = {\r\n        username: opponent[1],\r\n        invited: [],\r\n        wasInvited: []\r\n    };\r\n    io.to(opponent[0]).emit('gameOver');\r\n    delete dbData.games[room_id];\r\n}\r\n\n\n//# sourceURL=webpack:///./app.ts?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("fs/promises");

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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./app.ts");
/******/ 	
/******/ })()
;