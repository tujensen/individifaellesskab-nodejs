const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const assert = require('assert');
const feedparser = require('feedparser-promised');
const mysql = require('mysql');
const config = require('./config');
const Promise = require('promise');

/**
* Debug message and obj.
*/
function debug(msg, obj) {
  if (config.debug) {
    if (obj) {
      console.log(msg, obj);
    }
    else {
      console.log(msg);
    }
  }
}

/////////////////////////////////////////////
// web server
/////////////////////////////////////////////

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

/////////////////////////////////////////////
// database
/////////////////////////////////////////////

// Setup mysql database connection.
var connection = mysql.createConnection(config.mysql);
connection.connect();

let itemsI = [];
let itemsWe = [];

/**
* Load all We data.
*/
let itemsWePromise = new Promise(function (resolve, reject) {
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

/**
 * Load all I data.
 */
let itemsIPromise = new Promise(function (resolve, reject) {
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

/////////////////////////////////////////////
// feed reader
/////////////////////////////////////////////

/**
 * Has the <title, link> already been added to the bucket.
 *   or has the title already been added to the bucket within the
     last config.interval seconds?
 */
function alreadyAdded(bucket, title, link) {
  let now = (Math.floor(new Date().getTime() / 1000));

  return bucket.find(function (element) {
    return (element.link === link && element.title === title) ||
    (element.title === title && element.datetime >= now - config.interval);
  }) !== undefined;
}

/**
 * Process the first item in items, and recursively handle items.
 * When items is empty, call analyseFeeds with remaining urls.
 */
function handleItems(urls, items) {
  if (!items || items.length <= 0) {
    return analyseFeeds(urls);
  }

  let item = items.shift();

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
    return handleItems(urls, items);
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
    return handleItems(urls, items);
  }

  // Avoid link and title combination.
  if (alreadyAdded(bucket, title, item.link)) {
    debug('* already added: ' + title);
    return handleItems(urls, items);
  }

  // Insert into database.
  let newItem = {
    title: title,
    link: item.link,
    datetime: (Math.floor(new Date().getTime() / 1000))
  };

  let sql = 'INSERT INTO ' + bucketName + ' (title, link, datetime) ' +
  'VALUES ("' + newItem.title + '", "' + newItem.link + '", ' + newItem.datetime + ');';

  connection.query(sql,
    function (error, results, fields) {
      if (error) {
        console.error(error);
        return handleItems(urls, items);
      }
      else {
        newItem.id = results.insertId;

        debug("New item inserted", newItem);

        // Insert element in bucket.
        bucket.push(newItem);

        // Emit updated bucket.
        io.emit(bucketName, bucket);

        return handleItems(urls, items);
      }
    }
  );
}

function analyseFeeds(urls) {
  if (!urls || urls.length <= 0) {
    setTimeout( () => {
      debug('analysing feeds...');
      analyseFeeds(JSON.parse(JSON.stringify(config.urls)));
    }, 500);
    return;
  }

  // Remove first url from urls.
  let url = urls.shift();

  debug('next url: ' + url);

  // Parse the url.
  feedparser.parse(url).then((items) => {
    handleItems(urls, items);
  }).catch( (error) => {
    debug(url, error);
    analyseFeeds(urls);
  });
}

// Start the show.
// Setup socket events after items have been loaded.
Promise.all([itemsIPromise, itemsWePromise])
.then(function (res) {
  io.on('connection', (socket) => {
    socket.emit('items_i', itemsI);
    socket.emit('items_we', itemsWe);
  });

  // Start analysing feeds.
  setTimeout(analyseFeeds, 5000);
});
