const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const token = '7330002085:AAEYnzcnsKOPnqVegXm_FX5d59n12-hIEeE';

const bot = new TelegramApi(token, {polling: true})

const chats = { // аналог бд как ключи будет содержать в себе id чата а как значение загаданное число

}

// const gameOptions = { // объект опция для кнопок с одним полем replay_markup это должна быть JSON строка
//     reply_markup: JSON.stringify({
//         inline_keyboard: [ // каждый вложенный массив это отдельная строка кнопок
//             // callback_data информация каторая улетит на сервер после нажатия на кнопку
//             [{text: '1', callback_data: '1'}, {text: '2', callback_data: '2'}, {text: '3', callback_data: '3'}],
//             [{text: '4', callback_data: '4'}, {text: '5', callback_data: '5'}, {text: '6', callback_data: '6'}],
//             [{text: '7', callback_data: '7'}, {text: '8', callback_data: '8'}, {text: '9', callback_data: '9'}],
//             [{text: '0', callback_data: '0'}],
//         ]
//     })
// }

// const againOptions = { // объект опция для кнопок с одним полем replay_markup это должна быть JSON строка
//     reply_markup: JSON.stringify({
//         inline_keyboard: [ // каждый вложенный массив это отдельная строка кнопок
//             // callback_data информация каторая улетит на сервер после нажатия на кнопку
//             [{text: 'Играть еще раз', callback_data: '/again'}],
//         ]
//     })
// }

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    console.log(typeof randomNumber)
    chats[chatId] = randomNumber;
    // sendMessage 3 параметром принимает объект form с помощью негго можно вместе с сообщением отправлять кнопки на каторые можно нажимать
    await bot.sendMessage(chatId, `Отгадывай!`, gameOptions)
}

const start = () => {
    // пропишем команды каторые будут у бота с помощью апишки setMyCommands() параметром принимает массив объектов
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Угадай число'},
    ])

    bot.on('message', async msg => { // вешаем слушатель событий на обработку полученных сообщений
        console.log(msg) // в логи виведем сообщение каторое в этот колбек попадает
        // вытащим текст каторый отправил пользователь и id чата
        const text = msg.text;
        const chatId = msg.chat.id;
        // отправим сообщение пользователю sendMessage() 1 передаем chatId 2 сообщение каторое хотим отправить
        // bot.sendMessage(chatId, `Ты написал мне ${text}`)

        if (text === '/start') { // если в тексте отправил команду старт то отправляем сообщение 
            await bot.sendSticker(chatId, 'https://sl.combot.org/developeruz/webp/9xf09f8fa0.webp') // отправим пользователю стикер
            // команда старт отправляется по дефолту когда пользователь открыл бота и нажал подключится
            return bot.sendMessage(chatId, `Добро пожаловать в телеграм бот автора ютуб канала Ulbi TV`)
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.username}`)
        }

        // реализуем игру где бот будет загадыват число а пользователь должен его отгадать
        if (text === '/game') {
            // await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`)
            // const randomNumber = Math.floor(Math.random() * 10)
            // chats[chatId] = randomNumber;
            // // sendMessage 3 параметром принимает объект form с помощью негго можно вместе с сообщением отправлять кнопки на каторые можно нажимать
            // return bot.sendMessage(chatId, `Отгадывай!`, gameOptions)
            return startGame(chatId)
        }

        // если пользователь отправит несуществующую команду то бот просто помолчит сделам что бы отвечал
        return bot.sendMessage(chatId, `Я тебя не понимаю попробуй еще раз!`)
    })

    // слушатель нажатия кнопок
    bot.on('callback_query', async msg => {
        console.log(msg)
        const data = msg.data;
        const chatId = msg.message.chat.id;
        console.log(typeof data)
        // await bot.sendMessage(chatId, `Ты выбрал кнопку ${data}`)
        // после каждого нажатия кнопки бот возвращает одну и ту же цифру что бы бот ее перезагадл каждый раз надо вызывать команду /game
        // 3 параметром передаем againOptions теперь после каждого нажатия вылазит кнопка киграть еще раз
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data == chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `К сожидению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}

start()

