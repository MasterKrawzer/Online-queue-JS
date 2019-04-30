const Telegram = require('node-telegram-bot-api');
const TOKEN = require('/Users/alexeytkachenko/Documents/GitHub/telegramtoken.json');
const token = TOKEN.token;
//const token = '683886792:AAFmPILD7sjiplgXhxFnok8ACLtGiLr4J9k';
const config = require('./config.json');
const fs = require('fs');

var bot = new Telegram(token, { polling: true });
var queue = [];
var teacherID;
var muteID = [];
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

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, "Готов!");
    bot.sendMessage(msg.chat.id, "Чтобы добавиться в очередь, пиши '/add'");
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
bot.onText(/\/auth/, msg => {
    args = parseMessage(msg);
    if (args[0] === config.login && args[1] === config.password) {
        teacherID = msg.chat.id;
        bot.sendMessage(msg.chat.id, "Авторизован как учитель");
        var date = new Date(msg.date * 1000);

        let data = 'Консоль: Авторизация учителя\n'
            + 'Имя пользователя: ' + msg.chat.username + ',\n'
            + 'ID чата: ' + msg.chat.id + ',\n'
            + 'Время (unix) ' + msg.date + ',\n'
            + 'Время (нормальное) ' + date.toLocaleString() + '\n\n';
        fs.appendFileSync('./log.txt', data);
    } else {
        bot.sendMessage(`Не смог авторизоваться :(. Ещё ${tries} попыток`);

        let data = 'Ошибка 4: Ошибка авторизации\n'
            + 'Имя пользователя: ' + msg.chat.username + ',\n'
            + 'ID чата: ' + msg.chat.id + ',\n'
            + 'Попытка: ' + tries + ',\n'
            + 'Время (unix)' + msg.date + ',\n'
            + 'Время (нормальное)' + date.toLocaleString() + '\n\n';
        tries--;
    }
    if (tries <= 0) {
        muteID.push(msg.chat.id);
    }
})

bot.onText(/\/deauth/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель');
        var date = new Date(msg.date * 1000);

        let data = 'Консоль: Деавторизация учителя\n'
            + 'Время (unix) ' + msg.date + '\n'
            + 'Время (нормальное) ' + date.toLocaleString() + '\n\n';
        fs.appendFileSync('./log.txt', data);
    } else {
        var date = new Date(msg.date * 1000);

        let data = "Oшибка 5: Недостаточно прав для деавторизации учителя: \n"
            + 'Имя: ' + msg.chat.username + ",\n"
            + 'ID чата: ' + msg.chat.id + ",\n"
            + 'Время (unix): ' + msg.date + ",\n"
            + 'Время (нормальное): ' + date.toLocaleString() + '\n\n';
        fs.appendFileSync('./log.txt', data);
    }
})

bot.onText(/\/add/, msg => {
    let inQueue = false;
    queue.forEach((val, i, queue) => {
        if (val == msg.chat.id) {
            inQueue = true;
            bot.sendMessage(msg.chat.id, "Ты и так в очереди!");
            return 0;
        }
    })
    if (!inQueue) {
        queue.push(msg.chat.id);
        bot.sendMessage(msg.chat.id, `Добавил пользователя в очередь!`);
    }
})

bot.onText(/\/leave/, msg => {
    queue.forEach((val, i, queue) => {
        if (msg.chat.id === val) {
            queue[i] = 0;
            bot.sendMessage(msg.chat.id, 'Вы были убраны из очереди!');
        } else {
            bot.sendMessage(msg.chat.id, 'Не удалось убрать тебя из очереди!');
        }
    })
})

bot.onText(/\/next/, msg => {
    if (msg.chat.id === teacherID) {
        tempQueue = [];
        let j = 0;

        queue.forEach((val, i, queue) => {
            if (val != 0) {
                tempQueue[j] = queue[i];
            }
        })

        queue = tempQueue;

        bot.sendMessage(queue.shift(), 'Ваша очередь!');
    }
})
/*
bot.on('message', async msg => {
    tempQueue = [];
    queue.forEach((val, i, queue) => {
        let j = 0;
         if (val != 0) {
             tempQueue[j] = queue[i]; 
             j++;
         }
     });
     queue = tempQueue;
})
*/
bot.onText(/\/seeq/, msg => {
    queue.forEach(val => {
        bot.sendMessage(msg.chat.id, val);
    })
})


