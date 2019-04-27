const Telegram = require('node-telegram-bot-api');
const TOKEN = require('/Users/alexeytkachenko/Documents/GitHub/telegramtoken.json');
//const token = TOKEN.token;
const token = '683886792:AAFmPILD7sjiplgXhxFnok8ACLtGiLr4J9k';
const config = require('./config.json');

var bot = new Telegram(token, {polling: true});
var queue = [];
var teacherID;
function parseMessage(msg) {
    args = msg.text.toString().split(" ");
    args.shift();
    return args;
}

function delCommand(msg, length) {
    return msg.text.toString().slice(length + 1);
}
bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, "Готов!");
    bot.sendMessage(msg.chat.id, "Чтобы добавиться в очередь, пиши '/add <ФИ>'");
})

bot.onText(/\/add/, msg => {
    args = delCommand(msg, 4);
    queue.push(args);
    bot.sendMessage(msg.chat.id, `Добавил пользователя '${args}' в очередь!`);
})

bot.onText(/\/auth/, msg => {
    args = parseMessage(msg);
    if (args[0] === config.login && args[1] === config.password) {
        teacherID = msg.chat.id;
        bot.sendMessage(msg.chat.id, "Авторизован как учитель");
    } else {
        bot.sendMessage("Не смог авторизоваться :(");
    }
})

bot.onText(/\/deauth/, msg => {
    if (msg.chat.id === teacherID) {
        teacherID = "";
        bot.sendMessage(msg.chat.id, 'Деавторизован учитель');
    } else {
        var date = new Date(msg.date * 1000);
        console.log("Попытка деавторизовать учителя: \n"
            + 'Username ' + msg.chat.username + ",\n"
            + 'Chat id ' + msg.chat.id + ",\n" 
            + 'Date (unix) ' + msg.date + ",\n"
            + 'Date (nomal) ' + date.toLocaleString()
        );
    }
}) 
    
bot.onText(/\/pull/, msg => {
    bot.sendMessage(msg.chat.id, queue.pop());
})

bot.onText(/\/args/, msg => {
    args = parseMessage(msg);
    bot.sendMessage(msg.chat.id, args[0] + ' ' + args[1]);
})

bot.onText(/\/falsedeauth/, msg => {
    console.log("Попытка деавторизовать учителя: \n"
            + 'Username ' + msg.chat.username + ",\n"
            + 'Chat id ' + msg.chat.id + ",\n" 
            + 'Date (unix) ' + msg.date + ",\n"
            + 'Date (nomal) ' + date.toLocaleString()
        );
})
