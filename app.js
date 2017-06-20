const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const assert = require('assert');
const feedparser = require('feedparser-promised');
const mysql = require('mysql');
const config = require('./config');
const Promise = require('promise');

function debug(msg) {
  if (config.debug) {
    console.log(msg);
  }
}

// Expose public static files.
app.use(express.static('public'));

// Handle / get.
app.get('/', function(req, res){
  res.sendFile(__dirname + '../app/index.html');
});

// Set up server.
http.listen(config.port, function(){
  debug('listening on *:' + config.port);
});

// Setup mysql database connection.
var connection = mysql.createConnection(config.mysql);
connection.connect();

let itemsI = [];
let itemsWe = [];

/**
 * Load all We data.
 */
var itemsWePromise = new Promise(function (resolve, reject) {
  connection.query('SELECT * FROM items_we;',
    function (error, results, fields) {
      if (error) {
        reject(error);
      }
      else {
        debug('loaded ' + results.length + ' items_we');
        itemsWe = results;
        resolve(results);
      }
    }
  );
});
var itemsIPromise = new Promise(function (resolve, reject) {
  connection.query('SELECT * FROM items_i;',
    function (error, results, fields) {
      if (error) {
        reject(error);
      }
      else {
        debug('loaded ' + results.length + ' items_i');
        itemsI = results;
        resolve(results);
      }
    }
  );
});

let feedsToRead = 0;

function alreadyAdded(bucket, title, link) {
  let now = (Math.floor(new Date().getTime() / 1000));

  return bucket.reduce(function (acc, val) {
    return acc ||
      (val.link === link && val.title === title) ||
      (val.title === title && val.timestamp > now - config.interval);
  });
}

function handleItem(item) {
  // Check blacklist.
  let blacklist = false;
  for (index in config.blacklist) {
    if (item.link.indexOf(config.blacklist[index]) !== -1) {
      blacklist = true;
      break;
    }
  }

  if (blacklist) {
    debug('>> blacklisted: ' + item.link);
    return;
  }

  let title = item.title;
  let splitTitle = title.split(':');

  // Split title at : if it exists, choose the text on the right of the colon.
  if (splitTitle.length >= 2) {
    splitTitle.splice(0, 1);
    title = splitTitle.reduce(function(acc, val) {
      return acc + val;
    });
  }

  // Remove leading and trailing whitespace.
  title = title.trim();

  // Check if the title starts with "Vi " or "Jeg ".
  if (title.indexOf('Jeg ') === 0) {
    bucketName = 'items_i';
    bucket = itemsI;
  }
  else if (title.indexOf('Vi ') === 0) {
    bucketName = 'items_we'
    bucket = itemsWe;
  }
  else {
    return;
  }

  // Avoid link and title combination.
  if (alreadyAdded(bucket, title, item.link)) {
    debug('** already added: ' + title + ' - ' + item.link);
    return;
  }

  // Insert into database.
  let newItem = {
    title: title,
    link: item.link,
    datetime: (Math.floor(new Date().getTime() / 1000))
  };

  console.log("NEW ITEM", newItem);

  let sql = 'INSERT INTO ' + bucketName + ' (title, link, datetime) ' +
            'VALUES ("' + newItem.title + '", "' + newItem.link + '", ' + newItem.datetime + ');';

  connection.query(sql,
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      else {
        newItem.id = results.insertId;
      }
    }
  );

  // Insert element in bucket.
  bucket.push(newItem);

  // Emit updated bucket.
  io.emit(bucketName, bucket);
}

function feedReadFinished() {
  feedsToRead = feedsToRead - 1;

  if (feedsToRead === 0) {
    analyseFeeds();
  }
}

function analyseFeeds() {
  debug('analysing feeds...');
  feedsToRead = config.urls.length;

  config.urls.forEach((url) => {
    feedparser.parse(url).then( (items) => {
       items.forEach( (item) => {
         handleItem(item)
       });
     }).catch( (error) => {
       debug(url);
       //debug('error: ', error);
     }).then( () => {
       feedReadFinished();
     });
  });
}

Promise.all([itemsIPromise, itemsWePromise])
  .then(function (res) {
    /**
     * Handle socket connection.
     */
    io.on('connection', (socket) => {
      socket.emit('items_i', itemsI);
      socket.emit('items_we', itemsWe);
    });

    setTimeout(analyseFeeds, 5000);
  });
