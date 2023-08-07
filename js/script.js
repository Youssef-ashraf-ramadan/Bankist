'use strict';

/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-05-19T21:31:17.178Z',
    '2023-06-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2023-05-27T17:01:17.194Z',
    '2023-07-11T23:36:17.929Z',
    '2023-07-23T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentUser, checkTimer;
// authentication
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentUser?.pin === +inputLoginPin.value) {
    displayUi();
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(' ')[0]
    }`;
    const time = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentUser.locale,
      options
    ).format(time);
    inputLoginPin.value = inputLoginUsername.value = '';

    if (checkTimer) clearInterval(checkTimer);
    checkTimer = startLogOutTimer();
  }
});

// function set timer to log of the user
const startLogOutTimer = function () {
  let time = 300; // set time to 5 minute
  labelTimer.textContent = '';

  //call the timer every 1 second
  const timer = setInterval(function () {
    // convert the time  to minute
    let minute = String(Math.trunc(time / 60)).padStart(2, 0);
    // convert the time  to second
    let second = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${minute} : ${second}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }

    // Decrese the time every 1 second
    time--;
  }, 1000);
  return timer;
};

////// internationalization Api for formating movement date
const formatMovementsDate = function (date, locale) {
  const displayDate = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const convertedTime = displayDate(new Date(), date);

  if (convertedTime === 0) return `Today`;
  if (convertedTime === 1) return `Yestrday`;
  if (convertedTime <= 7) return `${convertedTime} days ago`;



  return new Intl.DateTimeFormat(locale).format(date);
};
////// internationalization Api for formating movement money and currency
const formatedCurrency = function (locale, mov, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(mov);
};

// this function will display the user data when the user log in into the account
const displayUi = function () {
  // display all the user momvements
  diplayData(currentUser);
  // display the summary of deposit and withdraw and interest
  displaySummary(currentUser);
  // display the banalce
  displayBalance(currentUser);
};

// this function will display all the movements of the current log in user
const diplayData = function (currentUser, sort = false) {
  containerMovements.innerHTML = '';
  const mov = sort
    ? currentUser.movements.slice().sort((a, b) => a - b)
    : currentUser.movements;

  mov.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const time = new Date(currentUser.movementsDates[i]);
    const displayFormatDate = formatMovementsDate(time, currentUser.locale);
    const formatedDataCurrency = formatedCurrency(
      currentUser.locale,
      mov,
      currentUser.currency
    );
    let html = `
   <div class="movements__row">
   <div class="movements__type movements__type--${type}"> ${i + 1} ${type}</div>
   <div class="movements__date"> ${displayFormatDate}</div>
   <div class="movements__value">${formatedDataCurrency}</div> 

 </div>

   `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// this function will display the the summary of user deposit and withdraw
const displaySummary = function (acc) {
  const insert = acc.movements
    .filter(deposit => deposit > 0)
    .reduce((acc, movInsert) => acc + movInsert, 0);
  const withdraw = acc.movements
    .filter(withdraw => withdraw < 0)
    .reduce((acc, movWithdraw) => acc + movWithdraw);

  const interest = acc.movements
    .filter(interest => interest > 0)
    .map(interest => (interest * acc.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interestBanking) => acc + interestBanking);

  const formatedInserturrency = formatedCurrency(
    acc.locale,
    insert,
    acc.currency
  );
  const formatedWithdrawCurrency = formatedCurrency(
    acc.locale,
    Math.abs(withdraw),
    acc.currency
  );
  const formatedInterestCurrency = formatedCurrency(
    acc.locale,
    interest,
    acc.currency
  );
  labelSumIn.textContent = `${formatedInserturrency}`;
  labelSumOut.textContent = `${formatedWithdrawCurrency}`;
  labelSumInterest.textContent = `${formatedInterestCurrency}`;
};

// this function will display all the result of the banalce of the current log in user
const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  const formatedDataCurrency = formatedCurrency(
    acc.locale,
    acc.balance,
    acc.currency
  );
  labelBalance.textContent = `${formatedDataCurrency}`;
};

// this function will create user name for each account
const createUserName = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .split(' ')
      .map(name => name[0])
      .join('')
      .toLowerCase();
  });
};

createUserName(accounts);


//// transfer money to another bank account which mean withdraw in current user account 
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  let amount = +inputTransferAmount.value;
  let transferUserName = inputTransferTo.value;

  let transferdUser = accounts.find(acc => acc.username === transferUserName);
  if (
    currentUser.balance >= amount &&
    transferdUser &&
    amount > 0 &&
    transferUserName !== currentUser.username
  ) {
    currentUser.movements.push(-amount);
    transferdUser?.movements.push(amount);
    currentUser.movementsDates.push(new Date().toISOString());
    transferdUser?.movementsDates.push(new Date().toISOString());
    clearInterval(checkTimer);
    checkTimer = startLogOutTimer();
  }

  displayUi();
  inputTransferAmount.value = inputTransferTo.value = '';
});

//close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  let currentUserIndex = accounts.findIndex(
    user => user.username === currentUser.username
  );

  if (
    accounts[currentUserIndex].pin === +inputClosePin.value &&
    inputCloseUsername.value === currentUser.username
  ) {
    // delete the user account
    accounts.splice(currentUserIndex, 1);
    // hide ui
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

////// Loan Request
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const LoanAmount = +inputLoanAmount.value;
  const checkAmount = currentUser.movements.some(
    mov => mov >= (LoanAmount * 10) / 100
  );

  if (LoanAmount > 0 && checkAmount) {
    setTimeout(() => {
      currentUser.movements.push(LoanAmount);
      currentUser.movementsDates.push(new Date().toISOString());
      displayUi();
      inputLoanAmount.value = '';
      clearInterval(checkTimer);
      checkTimer = startLogOutTimer();
    }, 2500);
  }
});


// sorting data in ascending order
let sort = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  diplayData(currentUser, !sort);
  sort = !sort;
});
