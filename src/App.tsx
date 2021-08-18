import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Pairing } from "./components/Pairing";
import {
  AppBar,
  Box,
  Button,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Route, Switch } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  menu: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

const App = () => {
  const classes = useStyles();

  const [connected, setConnected] = useState<Boolean>(false);

  try {
    chrome.runtime.sendMessage({ type: "getNonce" }, ({ connected }) => {
      if (connected) {
        setConnected(true);
      }
    });
  } catch (e) {}

  const renderConnectButton = () => {
    if (!connected) {
      return (
        <Button variant="contained" color="secondary">
          Connect
        </Button>
      );
    } else {
      return (
        <Button variant="contained" color="secondary">
          Connected
        </Button>
      );
    }
  };

  const renderMain = () => {
    if (connected) {
      return (
        <Switch>
          <Route exact path="/">
            Home
          </Route>
        </Switch>
      );
    } else {
      return (
        <Pairing />
      )
    }
  };

  return (
    <Box className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>

          <Box className={classes.menu}>{renderConnectButton()}</Box>
        </Toolbar>
      </AppBar>
      {renderMain()}
    </Box>
  );
};

export default App;
