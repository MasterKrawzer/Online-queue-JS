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
        keyboard: [["Вызвать ученика", "Посмотреть очередь"], ["Выйти"]],
    })
}
function logToFile(type, msg, id) {
    console.log('entered log');

    var date = new Date(msg.date * 1000);

    if (type == 'log') {
        console.log('logging');

        switch (id) {
            case 1: //Authorisation complete //ALL CLEAR
                let data = "Консоль: Успешная авторизация учителя\n"
                    + 'Имя пользователя: ' + msg.chat.username + ',\n'
                    + 'ID чата: ' + msg.chat.id + ',\n'
                    + 'Время (unix): ' + msg.date + ',\n'
                    + 'Время (нормальное): ' + date.toLocaleString() + '.\n\n';
                fs.appendFileSync('./log.txt', data);
                break;


            case 2: //Deauthorisation complete
                let data = 'Консоль: Успешная деавторизация учителя\n'
                    + 'Имя пользователя: ' + msg.chat.username + ',\n'
                    + 'ID чата: ' + msg.chat.id + ',\n'
                    + 'Время (unix): ' + msg.chat.date + ',\n'
                    + 'Время (нормальное): ' + date.toLocaleString() + '.\n\n';
                fs.appendFileSync('./log.txt', data);
                break;
        }

    }
    /*
    if (type == 'error') {
        switch (id) {
            case 1: //Failed authorisation 
                let data = 'Ошибка 1: Ошибка авторизации\n'
                    + 'Имя пользователя: ' + msg.chat.username + ',\n'
                    + 'ID чата: ' + msg.chat.id + ',\n'
                    + 'Попытка: ' + tries + ',\n'
                    + 'Время (unix): ' + msg.date + ',\n'
                    + 'Время (нормальное): ' + date.toLocaleString() + '\n\n';
                fs.appendFileSync('./log.txt', data);
                break;

                    case 2: //Failed deauthorisation
                    let data = "Oшибка 2: Недостаточно прав для деавторизации учителя: \n"
                    + 'Имя: ' + msg.chat.username + ",\n"
                    + 'ID чата: ' + msg.chat.id + ",\n"
                    + 'Время (unix): ' + msg.date + ",\n"
                    + 'Время (нормальное): ' + date.toLocaleString() + '\n\n';
                    fs.appendFileSync('./log.txt', data);
                    break;
                }
            }
            */
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
            + '/auth <логин> <пароль> -- авторизация в систему (обязательна!)\n'
            + '/death -- деавторизация (обязательна по окончанию урока или рабочего дня!)\n'
            + '/next -- вызвать следующего ученика\n');
    } else {
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
        bot.sendMessage(msg.chat.id, "Успешная авторизация учителя! Удачного дня");
        logToFile('log', msg, 1);
    } else {

    }
})

bot.onText(/\/deauth/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель');
        logToFile('log', msg, 2);

    } else {
        logToFile('error', msg, 2);
    }
})

bot.onText(/Выйти/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель', studentKeyboard);
        logToFile('log', msg, 2);
    } else {
        logToFile('error', msg, 2);
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
        queue = tempQueue;
        bot.sendMessage(queue.id.shift(), 'Ваша очередь!');
    }
})

bot.onText(/\/seeq/, msg => {
    queue.forEach(val => {
        bot.sendMessage(msg.chat.id, val.id);
    })
})

bot.onText(/Посмотреть очередь/, msg => {
    bot.sendMessage(msg.chat.id, "im in");
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