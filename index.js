const Telegram = require('node-telegram-bot-api');
const TOKEN = require('/Users/alexeytkachenko/Documents/GitHub/telegramtoken.json');
const token = TOKEN.token;
//const token = '683886792:AAFmPILD7sjiplgXhxFnok8ACLtGiLr4J9k';
const config = require('./config.json');
const fs = require('fs');

var bot = new Telegram(token, { polling: true });
var queue = [];
var teacherID
var muteID = [];


const studentKeyboard = {
    reply_markup: JSON.stringify({
        keyboard: [["Добавиться в очередь", "Покинуть очередь"], ["Посмотреть место в очереди"]],
    })
};
const teacherKeyboard = {
    reply_markup: JSON.stringify({
        keyboard: [["Вызвать ученика", "Посмотреть очередь"], ["Загрузить логи"], ["Выйти"]],
    })
}
function logToFile(msg, id) {
    var date = new Date(msg.date * 1000);
    if (id === 1) {
        data = "Успешная авторизация учителя: \n";
        data += "Имя пользователя: " + msg.chat.username + ',\n';
        data += "ID чата: " + msg.chat.id + ',\n';
        data += "Время: " + date.toLocaleString() + '.\n\n';
    }
    if (id === 2) {
        data = "Успешная деавторизация учителя: \n";
        data += "Имя пользователя: " + msg.chat.username + ',\n';
        data += "ID чата: " + msg.chat.id + ',\n';
        data += "Время: " + date.toLocaleString() + '.\n\n';
    }
    fs.appendFileSync('log.txt', data);
}
function errorToFile(msg, id) {
    var date = new Date(msg.date * 1000);
    switch (id) {
        case 1:
            data = "Ошибка авторизации учителя: \n";
            data += "Имя пользователя: " + msg.chat.username + ',\n';
            data += "ID чата: " + msg.chat.id + ',\n';
            data += "Время: " + date.toLocaleString() + '.\n\n';
        case 2:
            console.log('Im in2');
            data = "Ошибка деавторизации учителя: \n";
            data += "Имя пользователя: " + msg.chat.username + ',\n';
            data += "ID чата: " + msg.chat.id + ',\n';
            data += "Время: " + date.toLocaleString() + '.\n\n';
    }
    fs.appendFileSync('log.txt', data);
}
function parseMessage(msg) {
    args = msg.text.toString().split(" ");
    args.shift();
    return args;
}

function delCommand(msg, length) {
    return msg.text.toString().slice(length + 1);
}

function checkForMute(msg) {
    muteID.forEach(chatID => {
        if (chatID == msg.chat.id) {
            return false;
        }
    });
    return true;
}
function filterArray() {
    tempQueue = [];
    let j = 0;
    queue.forEach((val, i, queue) => {
        if (val != null) {
            tempQueue[j] = queue[i];
        }
    })
    queue = tempQueue;
}

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, "Готов!", studentKeyboard);
})

bot.onText(/\/help/, msg => {
    if (msg.chat.id === teacherID) {
        bot.sendMessage(msg.chat.id, 'Команды для учителя:\n'
            + 'УСТАРЕЛО!'
            + '/auth <логин> <пароль> -- авторизация в систему (обязательна!)\n'
            + '/death -- деавторизация (обязательна по окончанию урока или рабочего дня!)\n'
            + '/next -- вызвать следующего ученика\n');
    }
    else {
        bot.sendMessage(msg.chat.id, 'Команды для ученика: \n'
            + '/add -- добавится в очередь\n'
            + '/leave -- покинуть очередь');
    }
})
bot.onText(/\/sendargs/, msg => {
    args = parseMessage(msg);
    args.forEach((val, i, args) => {
        console.log(val);
    })
})
bot.onText(/\/auth/, msg => {
    args = parseMessage(msg);
    if (args[0] === config.login && args[1] === config.password) {
        bot.sendMessage(msg.chat.id, "Успешная авторизация учителя! Удачного дня!", teacherKeyboard);
        teacherID = msg.chat.id;
        logToFile(msg, 1);
    } else {
        bot.sendMessage(msg.chat.id, "Неверный логин и/или пароль");
        errorToFile(msg, 1);
    }
})

bot.onText(/\/deauth/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель', studentKeyboard);
        logToFile(msg, 2);

    } else {
        errorToFile(msg, 2);
    }
})

bot.onText(/Выйти/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель', studentKeyboard);
        logToFile(msg, 2);
    } else {
        errorToFile(msg, 2);
    }
})

bot.onText(/\/add/, msg => {
    filterArray();
    let inQueue = false;
    queue.forEach((val, i, queue) => {
        if (val.id == msg.chat.id) {
            inQueue = true;
            bot.sendMessage(msg.chat.id, "Ты и так в очереди!");
            return 0;
        }
    })
    if (!inQueue) {
        queue.push(msg.chat);
        bot.sendMessage(msg.chat.id, `Добавил пользователя в очередь!`);
    }
})

bot.onText(/Добавиться в очередь/, msg => {
    filterArray();
    let inQueue = false;
    queue.forEach((val, i, queue) => {
        if (val.id == msg.chat.id) {
            inQueue = true;
            bot.sendMessage(msg.chat.id, "Ты и так в очереди!");
            return 0;
        }
    })
    if (!inQueue) {
        queue.push(msg.chat);
        bot.sendMessage(msg.chat.id, `Добавил пользователя в очередь!`);
    }
})

bot.onText(/\/leave/, msg => {
    queue.forEach((val, i, queue) => {
        if (msg.chat.id === val.id) {
            queue[i] = 0;
            bot.sendMessage(msg.chat.id, 'Вы были убраны из очереди!');
        } else {
            bot.sendMessage(msg.chat.id, 'Не удалось убрать тебя из очереди!');
        }
    })
})

bot.onText(/Покинуть очередь/, msg => {
    queue.forEach((val, i, queue) => {
        if (msg.chat.id === val.id) {
            queue[i] = null;
            bot.sendMessage(msg.chat.id, 'Вы были убраны из очереди!');
        } else {
            bot.sendMessage(msg.chat.id, 'Не удалось убрать тебя из очереди!');
        }
    })
    filterArray();
})

bot.onText(/\/next/, msg => {
    if (msg.chat.id === teacherID) {
        filterArray();
        queue = tempQueue;
        bot.sendMessage(queue.id.shift(), 'Ваша очередь!');
    }
})

bot.onText(/Вызвать ученика/, msg => {
    if (msg.chat.id === teacherID) {
        filterArray();
        let user = queue.shift();
        bot.sendMessage(user.id, 'Ваша очередь!');
    }
})

bot.onText(/\/seeq/, msg => {
    queue.forEach(val => {
        bot.sendMessage(msg.chat.id, val.id);
    })
})

bot.onText(/Посмотреть очередь/, msg => {
    if (msg.chat.id === teacherID) {
        bot.sendMessage(msg.chat.id, "im in");
        let str = "Вот очередь:\n\n";
        queue.forEach((val, i, queue) => {
            str += i + 1 + ". ";
            str += val.username;
            str += '\n';
        })
        bot.sendMessage(msg.chat.id, str);
    }
})

bot.onText(/Посмотреть место в очереди/, msg => {
    queue.forEach((val, i, queue) => {
        if (val.id === msg.chat.id) {
            bot.sendMessage(msg.chat.id, `Ты ${i + 1} в очереди`);
            return;
        } else {
            bot.sendMessage(msg.chat.id, 'Тебя нет в очереди!');
        }
    });
})

bot.onText(/\/sendid/, msg => {
    chat = queue[queue.length];
    console.log(chat);
    queue.shift();
    bot.sendMessage(msg.chat.id, chat.id);
})

bot.onText(/Загрузить логи/, msg => {
    if (msg.chat.id === teacherID) {
        bot.sendDocument(msg.chat.id, "log.txt");
    }
})