// create a variable to hold the database connection
let db;

// establish a connection to IndexedDB database
const request = indexedDB.open('shiny-lamp', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };

request.onsuccess = function (event) {
    // if successfully created with objectstore save reference to db
    db = event.target.result;
    //check if online or offline to uploadTransactions() to push local db
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errCode); 
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
var saveTransaction = function (record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(["new_transaction"], "readwrite");

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore("new_transaction"); 
  
    // add record to your store with add method
    transactionObjectStore.add(record);
  };

var uploadTransaction = function () {
    // open a transaction on your db
    const transaction = db.transaction(["new_transaction"], "readwrite");

    // access object store
    const transactionObjectStore = transaction.objectStore("new_transaction");

    // get all records from store and set to a variable
    const allTransactions = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    allTransactions.onsuccess = function () {
        // if there is data in indexedDb's store, send it to api server 
        if (allTransactions.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(allTransactions.result),
                headers: {
                Accept: "Application/json, text/plain, */*",
                "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(["new_transaction"], "readwrite");
            // access objectStore
            const transactionObjectStore = transaction.objectStore("new_transaction"); 
            transactionObjectStore.clear();
            alert('All transactions submitted!');
            })
            .catch((err) => console.log(err));
        }
    };
};

// listen for app coming back online
window.addEventListener("online", uploadTransaction);