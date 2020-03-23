import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {FaHome} from 'react-icons/fa';

function HemnetItem(props) {
  return <div>
    <h2>{props.hemnetItem.title} - <a href={props.hemnetItem.link}>View</a></h2>
    <h3>Description:</h3>
    <p>{props.hemnetItem.description}</p>
    <h3>Apartment was posted: {props.hemnetItem.pubDate}</h3>
    <hr/>
  </div>;
}

function ScrapedHemnetItem(props) {
  return <div>
    <h2>{props.scrapedHemnetItem.title[0]} - <a href={props.scrapedHemnetItem.link[0]}>View</a></h2>
    <h3>Description:</h3>
    <p>{props.scrapedHemnetItem.description[0]}</p>
    <h3>Apartment was posted: {props.scrapedHemnetItem.pubDate[0]}</h3>
    <hr/>
  </div>;
}

function App() {
  return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Link className="App-link" to="/">
              <FaHome className="App-icon"/>
            </Link>
            <span>Hemnet Webscraper - </span>
            <Link className="App-link" to="/scrapeItems">
              Webscrape Actual Items
            </Link>
          </header>
        </div>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/scrapeItems">
            <ScrapeItems/>
          </Route>
          <Route path="/">
            <StoredItems/>
          </Route>
        </Switch>
      </Router>
  );
}

function StoredItems() {
  const [hemnetItems, setHemnetItems] = useState([]);

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    axios.get('http://localhost:3000/api/getStoredItems')
        .then((items) => {
          setHemnetItems(items.data.Items);
        })
        .catch((err) => {
          console.log('Error', err);
        });
  }, []); // [] preventing to re-call after component update

  return <div>
    <h1>Apartments for Selling</h1>
    <div>
      {hemnetItems.sort((a, b) => (a.pubDate > b.pubDate) ? -1 : 1) // Sort by published date from latest
          .map((item, key) =>
              <HemnetItem key={item.id} hemnetItem={item}></HemnetItem>,
          )}
    </div>
  </div>;
}

function ScrapeItems() {
  const [scrapedHemnetItems, setScrapedHemnetItems] = useState([]);

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    // TODO: From config, point to remote API
    axios.get('http://localhost:3000/api/scrapeItems')
        .then((items) => {
          console.log('Items', items);
          setScrapedHemnetItems(items.data);
        })
        .catch((err) => {
          console.log('Error', err);
        });
  }, []); // [] preventing to re-call after component update

  return <div>
    <h1>Scraped Apartments for Selling</h1>
    <div>
      {scrapedHemnetItems.sort((a, b) => (a.pubDate > b.pubDate) ? -1 : 1) // Sort by published date from latest
          .map((item, key) =>
              <ScrapedHemnetItem key={item.guid} scrapedHemnetItem={item}></ScrapedHemnetItem>,
          )}
    </div>
  </div>;
}

export default App;
