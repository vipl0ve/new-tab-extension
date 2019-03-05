'use strict';

function displayTimeOfDay() {
    let time = new Date().getHours();
    if (time >= 0 && time <= 3) return 'evening';
    if (time >= 4 && time <= 11) return 'morning';
    if (time >= 12 && time <= 16) return 'afternoon';
    if (time >= 17 && time <= 24) return 'evening';
    console.log(time);
}

const greeting = document.getElementById('greeting');
const textarea = document.querySelector("textarea");

const apikey = '4OO6ZTC7J8Y4BQ1V';
let stock_URL = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=FDX&interval=5min&apikey='+apikey;

fetch(stock_URL) // fetching the stock price API
  .then(response => {
      return response.json();
  })
  .then(json => {
      let lastRefreshed = json['Meta Data']["3. Last Refreshed"];
      let fedExQuote = json["Time Series (5min)"][lastRefreshed];

      const quoteBox = document.querySelector('#stock-price p');
      const quoteCite = document.querySelector("cite");
      quoteBox.textContent = JSON.stringify(fedExQuote);
      quoteCite.textContent = "Last Refreshed:" + lastRefreshed;
  })
  .catch(err => {
      const quoteBox = document.querySelector("#stock-price p");
      quoteBox.textContent = "Error:" + err;
  });

window.addEventListener("load", () => {
    let notes = "";
    let userName = "";
    
    chrome.storage.local.get('note', function (result) {
        notes = result.note;
        console.log(result.note);
        
        if(notes == ""){
            textarea.textContent = "";
        } else {
            textarea.textContent = notes;
        }
    });

    chrome.storage.local.get('username', function (result) {
        userName = result.username;
        console.log(result.username);

        if(userName == ""){
            let newUser = prompt("Please enter your name", "New User");
            chrome.storage.local.set({'username': newUser}, function() {
              // Notify that we saved.
              console.log('username \"'+ newUser + '\" saved')
            });

            greeting.textContent = 'Good '+ displayTimeOfDay() + "! " + newUser;
        } else {
            greeting.textContent = 'Good '+ displayTimeOfDay() + "! " + userName;
        }
    });
});

textarea.addEventListener("focusout", function() {
    const textareaValue = textarea.value;
    chrome.storage.local.set({ 'note': textareaValue }, function () {
        console.log('note saved!')
    })
});

chrome.tabs.onCreated.addListener(function (tab){
    while(tab.status!=="complete"){
        console.log('wait for tab to load');
    }
    console.log('Tab loaded');
    chrome.windows.get(tab.windowId, function(window){
        if(window.type === "popup"){
            console.log("This tab is a popup");
            console.log("Query tabs");
            let queryInfo = {
                windowId: tab.windowId
            };
            chrome.tabs.query(queryInfo, function(tabs){
                for (let tab of tabs) {
                // tab.url requires the `tabs` permission
                console.log(tab.id + tab.url + tab.windowId);
                }   
            });
            console.log("All tabs");
            chrome.tabs.query({active: true}, function(tabs){
                for (let tab of tabs) {
                // tab.url requires the `tabs` permission
                console.log(tab.id + tab.url + tab.windowId);
                }   
            });   
        }
    });
});