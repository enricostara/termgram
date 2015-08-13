//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

module.exports = require('./mark-down')
({
    "welcome": "Welcome to **TERMGRAM**, a terminal client to connect with _Telegram_.",
    "signUp": {
        "info": "To protect your Telegram identity you must create a local user/password,\n" +
        "**Termgram** will use your password to encrypt your authorization data saved locally.\n" +
        "Choose your **username**, it will be _local_ and it will _not be used_ by Telegram!",
        "choose_username": "Username",
        "choose_username_error": "The username must be between 3 and 12 characters long!",
        "choose_username_alreadyIn": "The username '**%s**' is already registered!",
        "choose_username_hello": "Hi **%s** !",
        "choose_passwordType_answer": "Which type of password fits your needs?",
        "choose_passwordType_option_simple": "**Numeric**, only 4 digits for fast typing",
        "choose_passwordType_option_simple_case": "Case: you are on your PC already protected by a secure password..",
        "choose_passwordType_option_strong": "**PassPhrase**, at least 10 characters long and " +
        "should contain lowercase/uppercase letters, numbers and symbols",
        "choose_passwordType_option_strong_case": "Case: you are connected remotely to a departmental server or to a nuclear plant or whatever..",
        "choose_passwordType": "Select the password type number",
        "choose_passwordType_chose": "You chose:",
        "choose_password_simple": "Password (4 digits)",
        "choose_password_strong": "Password (10+ chars)",
        "choose_password_retype": "Retype the password for confirmation",
        "choose_password_retype_error": "Hey, the _two passwords didn't match_!",
        "auth_inProgress": "Authorization on going, wait few seconds..",
        "ask_phoneNumber_info": "Provide your phone number in order to receive the verification code from Telegram",
        "ask_phoneNumber": "Phone number, must have the international code",
        "ask_authorizationCode": "Authorization code received by SMS",
        "phone_unregistered": "Your phone number is not registered, give some info to complete a new registration:",
        "choose_firstName": "First name",
        "choose_lastName": "Last name",
        "error_PHONE_NUMBER_INVALID": "Phone number **%s** is invalid! try again..",
        "error_PHONE_CODE_INVALID": "Authorization code **%s** is invalid! try again..",
        "error_PHONE_CODE_EXPIRED": "Authorization code is expired!",
        "error_FIRSTNAME_INVALID": "First name is invalid! try again..",
        "error_LASTNAME_INVALID": "Last name is invalid! try again.."
    },
    "signIn": {
        "info": "Termgram Login",
        "welcome": "Welcome back **%s**!",
        "ask_username": "Username",
        "ask_password": "Password",
        "ask_signUp": "The username provided is new, do you want to create a new local account?"
    },
    "selectChat": {
        "list": "Chats:",
        "noChatAvailable": "No chat available!",
        "userSelfName": "You",
        "choose_chat": "Choose a chat **number**"
    },
    "ui": {
        "askConfirmation": "y/n",
        "askConfirmation_defaultYes": "_Y_/n",
        "askConfirmation_defaultNo": "y/_N_",
        "error": {
            "askWord": "Hey, you must enter only alphanumeric chars!",
            "askNumeric": "Hey, you must enter only numeric chars!",
            "askPhone": "Hey, this is not an international phone number!",
            "askPassword": "Hey, the password didn't match the requirements!"
        }
    },
    "exit": "Are you sure you want to exit?"
});