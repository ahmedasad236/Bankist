'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
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
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
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

/////////////////////////////////////////////////
/////////////////////////////////////////////////

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

let currentAccount;

const displayAccountMovements = function (movements, sorted) {
  containerMovements.innerHTML = '';
  const movs = sorted ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, idx) {
    const movType = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${movType}">${
      idx + 1
    } ${movType}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov.toFixed(2)}€</div>
  </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const updateUI = function (acc) {
  //display movements
  displayAccountMovements(acc.movements, false);

  //display balance
  calcDisplayBalance(acc);

  //display summary
  calcDisplaySummary(acc.movements);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((balance, curr) => balance + curr, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;

  console.log(acc.balance);
};

const calcDisplaySummary = function (movements) {
  const incomes = movements
    .filter(curr => curr > 0)
    .reduce((accumaltor, curr) => accumaltor + curr, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;
  const outcomes = movements
    .filter(curr => curr < 0)
    .reduce((accumaltor, curr) => accumaltor + curr, 0);
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}€`;

  const interest = movements
    .filter(curr => curr > 0)
    .map(deposite => (deposite * 1.2) / 100)
    .reduce((acc, curr) => curr + acc, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

btnLogin.addEventListener('click', function (e) {
  // prevent the form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
  } else console.log('wrong login');

  containerApp.style.opacity = 100;

  updateUI(currentAccount);
});

// implement the transfer event
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amountTransfered = Number(inputTransferAmount.value);
  const destinationUser = accounts.find(
    acc => inputTransferTo.value === acc.username
  );

  if (
    amountTransfered > 0 &&
    destinationUser &&
    amountTransfered <= currentAccount.balance &&
    destinationUser?.username !== currentAccount.username
  ) {
    console.log(`Transfer is done ${amountTransfered}`);
    currentAccount.movements.push(-amountTransfered);
    destinationUser.movements.push(amountTransfered);
    updateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
});

// implement close event
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const idx = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // remove the account
    accounts.splice(idx, 1);

    //hide UI
    containerApp.style.opacity = 0;
  }
});

//implement loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount = '';
});

// sort the movements
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayAccountMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
