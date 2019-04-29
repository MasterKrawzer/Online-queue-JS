const Telegram = require('node-telegram-bot-api');
const TOKEN = require('/Users/alexeytkachenko/Documents/GitHub/telegramtoken.json');
const token = TOKEN.token;
//const token = '683886792:AAFmPILD7sjiplgXhxFnok8ACLtGiLr4J9k';
const config = require('./config.json');
const fs = require('fs');

var bot = new Telegram(token, {polling: true});
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

bot.on('message', msg => {
    if (checkForMute) {
        bot.onText(/\/start/, msg => {
            bot.sendMessage(msg.chat.id, "Готов!");
            bot.sendMessage(msg.chat.id, "Чтобы добавиться в очередь, пиши '/add'");
    })    
    
    bot.onText(/\/add/, msg => {
        queue.push(msg.chat.id);
        bot.sendMessage(msg.chat.id, `Добавил пользователя в очередь!`);
        /*
        queue.forEach((user, i, queue) => {
            bot.sendMessage(msg.chat.id, 'cheking');
            
            /*
            if (user == msg.chat.id) {
                bot.sendMessage(msg.chat.id, 'Вы уже в очереди!')
                return;
            }
            else {
                
                
                return;
            }
            
        });
        */
        console.error;
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
            + 'Время (unix)' + msg.date + ',\n'
            + 'Время (нормальное)' + date.toLocaleString() + '\n\n';
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
            + 'Время (unix)' + msg.date + '\n'
            + 'Время (нормальное)' + date.toLocaleString() + '\n\n';
            fs.appendFileSync('./log.txt', data);
        } else {
            var date = new Date(msg.date * 1000);
    
            let data = 'Ошибка 5: Попытка деавторизовать учителя: \n' 
                + 'Имя: ' + msg.chat.username + ",\n"
                + 'ID чата: ' + msg.chat.id + ",\n"
                + 'Время (unix): ' + msg.date + ",\n"
                + 'Время (нормальное): ' + date.toLocaleString() + '\n\n';
                fs.appendFileSync('./log.txt', data);
            }
        }) 
        
        bot.onText(/\/next/, msg => {
            if (msg.chat.id === teacherID) {
                bot.sendMessage(queue.shift(), 'Ваша очередь!');
            }
        })  
    
        bot.onText(/\/args/, msg => {
            args = parseMessage(msg);
            bot.sendMessage(msg.chat.id, args[0] + ' ' + args[1]);
        })
    
        bot.onText(/\/falsedeauth/, msg => {
            bot.sendMessage(msg.chat.id, 'Alarm');    
        })
        bot.onText(/\/textFile/, msg => {
            fs.writeFileSync('./log.txt', msg.text.toString() + "\n");
            console.log(msg.text.toString());
        })
    }
})

