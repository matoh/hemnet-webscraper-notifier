import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import {FaHome} from 'react-icons/fa';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LinkRounded from '@material-ui/icons/LinkRounded';
import Link from '@material-ui/core/Link';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import {ExpandMore} from '@material-ui/icons';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

function HemnetItem(props) {
  return (
      <div>
        <Divider/>
        <ListItem>
          <ExpansionPanel>
            <ExpansionPanelSummary
                expandIcon={<ExpandMore/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
              <ListItemText primary={props.hemnetItem.title} secondary={props.hemnetItem.pubDate}/>
              <Typography style={{marginRight: 20}}>
                <b>Distance to work:</b> {props.hemnetItem.distance}
              </Typography>
              <Typography style={{marginRight: 70}}>
                <b>Time to work:</b> {props.hemnetItem.duration}
              </Typography>
              <Link href={props.hemnetItem.link} style={{marginTop: 17}} target="_blank">
                <LinkRounded />
              </Link>

            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                {props.hemnetItem.description}
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </ListItem>
      </div>
  );
}

function ActualItems(props) {

  let hemnetItemObjects = props.hemnetItems;

  const filterByDay = (hemnetItem) => {
    return props.filterByDay === moment(hemnetItem.pubDate).format('YYYY-MM-DD');
  };

  if (props.filterByDay) {
    hemnetItemObjects = hemnetItemObjects.filter(filterByDay);
  }

  hemnetItemObjects = hemnetItemObjects.sort(
      (a, b) => (a.pubDate > b.pubDate) ? -1 : 1) // Sort by published date from latest
      .map((item, key) =>
          <HemnetItem key={item.id} hemnetItem={item}></HemnetItem>,
      );

  return (
      <List> {hemnetItemObjects} </List>
  );
}

function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
      <Typography
          component="div"
          role="tabpanel"
          hidden={value !== index}
          id={`scrollable-force-tabpanel-${index}`}
          aria-labelledby={`scrollable-force-tab-${index}`}
          {...other}>
        <Box p={0}>{children}</Box>
      </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = React.useState(0);
  const [hemnetItems, setHemnetItems] = useState([]);
  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    axios.get(process.env.REACT_APP_FETCH_ITEMS_URL)
        .then((items) => {
          setHemnetItems(items.data);
        })
        .catch((err) => {
          console.log('Error', err);
        });
  }, []); // [] preventing to re-call after component update

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <FaHome className="App-icon"/>
            </IconButton>
            <Typography variant="h6">
              Hemnet Webscraper
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid container spacing={1} direction="row" justify="center" alignItems="stretch">
          <Grid item xs={9}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                scrollButtons="on"
                indicatorColor="secondary"
                textColor="inherit"
                aria-label="scrollable force tabs example">
              <Tab label="Posted Today" {...a11yProps(0)} />
              <Tab label="Actual Now" {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={value} index={0}>
              <ActualItems hemnetItems={hemnetItems} filterByDay={moment().format('YYYY-MM-DD')}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ActualItems hemnetItems={hemnetItems}/>
            </TabPanel>
          </Grid>
        </Grid>
      </div>
  );
}

export default App;
